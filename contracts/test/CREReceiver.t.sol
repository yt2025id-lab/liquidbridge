// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/mocks/MockUSDC.sol";
import "../src/mocks/MockRWAToken.sol";
import "../src/compliance/ComplianceVerifier.sol";
import "../src/oracle/NAVOracle.sol";
import "../src/oracle/CREReceiver.sol";
import "../src/pool/LiquidBridgePool.sol";
import "../src/factory/LiquidBridgeFactory.sol";

contract CREReceiverTest is Test {
    MockUSDC usdc;
    MockRWAToken mBuild;
    ComplianceVerifier compliance;
    NAVOracle navOracle;
    LiquidBridgeFactory factory;
    LiquidBridgePool pool;
    CREReceiver creReceiver;

    address deployer = address(this);
    address forwarder = makeAddr("forwarder");
    address alice = makeAddr("alice");

    uint256 constant INITIAL_NAV = 100_000_000; // $100.00
    uint256 constant INITIAL_RESERVE_RATIO = 9950; // 99.5%

    function setUp() public {
        usdc = new MockUSDC();
        mBuild = new MockRWAToken();
        compliance = new ComplianceVerifier();
        navOracle = new NAVOracle(INITIAL_NAV, INITIAL_RESERVE_RATIO);
        factory = new LiquidBridgeFactory();

        address poolAddr = factory.createPool(
            address(mBuild), address(usdc), address(navOracle), address(compliance)
        );
        pool = LiquidBridgePool(poolAddr);

        // Deploy CREReceiver with forwarder
        creReceiver = new CREReceiver(address(navOracle), poolAddr, forwarder);

        // Authorize CREReceiver on NAVOracle and Pool
        navOracle.addAuthorizedUpdater(address(creReceiver));
        pool.addAuthorizedUpdater(address(creReceiver));

        // Setup compliance and liquidity
        compliance.addToWhitelist(deployer);
        compliance.addToWhitelist(poolAddr);

        mBuild.mint(deployer, 10_000e18);
        usdc.mint(deployer, 1_000_000e6);
        mBuild.approve(poolAddr, 10_000e18);
        usdc.approve(poolAddr, 1_000_000e6);
        pool.addLiquidity(10_000e18, 1_000_000e6);
    }

    // ============ HAPPY PATH ============

    function test_OnReport_UpdatesNAVAndBounds() public {
        uint256 newNAV = 105_000_000; // $105.00
        uint256 newReserveRatio = 9960; // 99.6%

        bytes memory report = abi.encode(newNAV, newReserveRatio);
        bytes memory metadata = "";

        vm.prank(forwarder);
        creReceiver.onReport(metadata, report);

        // Verify NAV Oracle updated
        INAVOracle.NAVData memory data = navOracle.getLatestNAV();
        assertEq(data.nav, newNAV);
        assertEq(data.reserveRatio, newReserveRatio);

        // Verify Pool bounds updated (105 * 1.005 = 105.525, 105 * 0.995 = 104.475)
        ILiquidBridgePool.PoolState memory state = pool.getPoolState();
        assertEq(state.upperBound, 105_525_000);
        assertEq(state.lowerBound, 104_475_000);
    }

    function test_OnReport_OwnerCanCall() public {
        uint256 newNAV = 101_000_000;
        uint256 newReserveRatio = 9950;

        bytes memory report = abi.encode(newNAV, newReserveRatio);

        // Owner (deployer/this) can also call onReport
        creReceiver.onReport("", report);

        INAVOracle.NAVData memory data = navOracle.getLatestNAV();
        assertEq(data.nav, newNAV);
    }

    function test_OnReport_EmitsEvent() public {
        uint256 newNAV = 102_000_000;
        uint256 newReserveRatio = 9970;

        bytes memory report = abi.encode(newNAV, newReserveRatio);

        vm.expectEmit(false, false, false, true);
        emit CREReceiver.CREReportProcessed(newNAV, newReserveRatio, block.timestamp);

        vm.prank(forwarder);
        creReceiver.onReport("", report);
    }

    // ============ ACCESS CONTROL ============

    function test_OnReport_RevertsUnauthorized() public {
        bytes memory report = abi.encode(uint256(100_000_000), uint256(9950));

        vm.prank(alice);
        vm.expectRevert("CREReceiver: unauthorized caller");
        creReceiver.onReport("", report);
    }

    // ============ CIRCUIT BREAKER ============

    function test_OnReport_TriggersCircuitBreaker() public {
        uint256 newNAV = 100_000_000;
        uint256 lowReserveRatio = 9700; // 97% - below 98% threshold

        bytes memory report = abi.encode(newNAV, lowReserveRatio);

        vm.prank(forwarder);
        creReceiver.onReport("", report);

        // Circuit breaker should be active
        assertTrue(pool.circuitBreakerActive());
    }

    function test_OnReport_DeactivatesCircuitBreaker() public {
        // First, activate circuit breaker
        bytes memory lowReport = abi.encode(uint256(100_000_000), uint256(9700));
        vm.prank(forwarder);
        creReceiver.onReport("", lowReport);
        assertTrue(pool.circuitBreakerActive());

        // Then restore reserves
        bytes memory highReport = abi.encode(uint256(100_000_000), uint256(9900));
        vm.prank(forwarder);
        creReceiver.onReport("", highReport);
        assertFalse(pool.circuitBreakerActive());
    }

    // ============ ADMIN ============

    function test_SetForwarder() public {
        address newForwarder = makeAddr("newForwarder");
        creReceiver.setForwarder(newForwarder);
        assertEq(creReceiver.forwarder(), newForwarder);

        // New forwarder can call onReport
        bytes memory report = abi.encode(uint256(100_000_000), uint256(9950));
        vm.prank(newForwarder);
        creReceiver.onReport("", report);
    }

    function test_SetForwarder_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert("Ownable: caller is not the owner");
        creReceiver.setForwarder(alice);
    }
}
