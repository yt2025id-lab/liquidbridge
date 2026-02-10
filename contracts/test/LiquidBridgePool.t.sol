// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/mocks/MockUSDC.sol";
import "../src/mocks/MockRWAToken.sol";
import "../src/compliance/ComplianceVerifier.sol";
import "../src/oracle/NAVOracle.sol";
import "../src/pool/LiquidBridgePool.sol";
import "../src/factory/LiquidBridgeFactory.sol";
import "../src/router/LiquidBridgeRouter.sol";

contract LiquidBridgePoolTest is Test {
    MockUSDC usdc;
    MockRWAToken mBuild;
    ComplianceVerifier compliance;
    NAVOracle navOracle;
    LiquidBridgeFactory factory;
    LiquidBridgePool pool;
    LiquidBridgeRouter router;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address deployer = address(this);

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
        router = new LiquidBridgeRouter(address(factory));

        // Setup
        pool.addAuthorizedUpdater(deployer);
        compliance.addToWhitelist(deployer);
        compliance.addToWhitelist(alice);
        compliance.addToWhitelist(bob);
        compliance.addToWhitelist(poolAddr);
        compliance.addToWhitelist(address(router));

        // Seed initial liquidity
        mBuild.mint(deployer, 10_000e18);
        usdc.mint(deployer, 1_000_000e6);
        mBuild.approve(poolAddr, 10_000e18);
        usdc.approve(poolAddr, 1_000_000e6);
        pool.addLiquidity(10_000e18, 1_000_000e6);

        // Give alice & bob tokens
        mBuild.mint(alice, 100e18);
        usdc.mint(alice, 10_000e6);
        mBuild.mint(bob, 100e18);
        usdc.mint(bob, 10_000e6);
    }

    // ============ BASIC POOL STATE ============

    function test_PoolState() public view {
        ILiquidBridgePool.PoolState memory state = pool.getPoolState();
        assertEq(state.navPrice, INITIAL_NAV);
        assertGt(state.totalLiquidity, 0);
        assertEq(state.reserveRWA, 10_000e18);
        assertEq(state.reserveUSDC, 1_000_000e6);
        assertFalse(state.circuitBreakerActive);
    }

    // ============ SWAP TESTS ============

    function test_SwapRWAtoUSDC() public {
        vm.startPrank(alice);

        uint256 swapAmount = 1e18; // 1 mBUILD
        mBuild.approve(address(pool), swapAmount);

        (uint256 expectedOut,) = pool.getAmountOut(address(mBuild), swapAmount);

        uint256 usdcBefore = usdc.balanceOf(alice);
        pool.swap(address(mBuild), swapAmount, 0, alice);
        uint256 usdcAfter = usdc.balanceOf(alice);

        uint256 received = usdcAfter - usdcBefore;
        assertEq(received, expectedOut);
        // At $100 NAV with ~0.05% fee, should receive ~$99.95
        assertGt(received, 99_900_000); // > $99.90
        assertLt(received, 100_000_000); // < $100.00

        vm.stopPrank();
    }

    function test_SwapUSDCtoRWA() public {
        vm.startPrank(alice);

        uint256 swapAmount = 100e6; // $100 USDC
        usdc.approve(address(pool), swapAmount);

        (uint256 expectedOut,) = pool.getAmountOut(address(usdc), swapAmount);

        uint256 rwaBefore = mBuild.balanceOf(alice);
        pool.swap(address(usdc), swapAmount, 0, alice);
        uint256 rwaAfter = mBuild.balanceOf(alice);

        uint256 received = rwaAfter - rwaBefore;
        assertEq(received, expectedOut);
        // At $100 NAV with ~0.05% fee, should receive ~0.9995 mBUILD
        assertGt(received, 999_000_000_000_000_000); // > 0.999
        assertLt(received, 1e18); // < 1.0

        vm.stopPrank();
    }

    function test_SwapRevert_NotCompliant() public {
        address mallory = makeAddr("mallory");
        mBuild.mint(mallory, 1e18);

        vm.startPrank(mallory);
        mBuild.approve(address(pool), 1e18);
        vm.expectRevert("Pool: sender not compliant");
        pool.swap(address(mBuild), 1e18, 0, mallory);
        vm.stopPrank();
    }

    function test_SwapRevert_CircuitBreaker() public {
        pool.activateCircuitBreaker();

        vm.startPrank(alice);
        mBuild.approve(address(pool), 1e18);
        vm.expectRevert("Pool: circuit breaker active");
        pool.swap(address(mBuild), 1e18, 0, alice);
        vm.stopPrank();
    }

    function test_SwapRevert_StaleOracle() public {
        // Advance time beyond staleness threshold
        vm.warp(block.timestamp + 3601);

        vm.startPrank(alice);
        mBuild.approve(address(pool), 1e18);
        vm.expectRevert("Pool: oracle stale");
        pool.swap(address(mBuild), 1e18, 0, alice);
        vm.stopPrank();
    }

    // ============ LIQUIDITY TESTS ============

    function test_AddRemoveLiquidity() public {
        vm.startPrank(alice);

        mBuild.approve(address(pool), 10e18);
        usdc.approve(address(pool), 1_000e6);
        uint256 liquidity = pool.addLiquidity(10e18, 1_000e6);
        assertGt(liquidity, 0);

        uint256 lpBalance = pool.balanceOf(alice);
        assertEq(lpBalance, liquidity);

        (uint256 rwaOut, uint256 usdcOut) = pool.removeLiquidity(liquidity);
        assertGt(rwaOut, 0);
        assertGt(usdcOut, 0);

        vm.stopPrank();
    }

    // ============ NAV ORACLE TESTS ============

    function test_NAVUpdate() public {
        uint256 newNAV = 101_000_000; // $101.00
        navOracle.updateNAV(newNAV, 9960);

        INAVOracle.NAVData memory data = navOracle.getLatestNAV();
        assertEq(data.nav, newNAV);
        assertEq(data.reserveRatio, 9960);
        assertFalse(data.isStale);
    }

    function test_BoundsUpdate() public {
        uint256 newNAV = 105_000_000; // $105.00
        navOracle.updateNAV(newNAV, 9950);
        pool.updateBounds();

        ILiquidBridgePool.PoolState memory state = pool.getPoolState();
        assertEq(state.navPrice, newNAV);
        // Upper = 105 * 1.005 = 105.525
        assertEq(state.upperBound, 105_525_000);
        // Lower = 105 * 0.995 = 104.475
        assertEq(state.lowerBound, 104_475_000);
    }

    // ============ CIRCUIT BREAKER TESTS ============

    function test_CircuitBreakerAutoActivate() public {
        // Set reserve ratio below 98%
        navOracle.updateNAV(INITIAL_NAV, 9700); // 97%
        pool.updateBounds();

        assertTrue(pool.circuitBreakerActive());
    }

    function test_CircuitBreakerAutoDeactivate() public {
        // First activate
        navOracle.updateNAV(INITIAL_NAV, 9700);
        pool.updateBounds();
        assertTrue(pool.circuitBreakerActive());

        // Then restore reserves
        navOracle.updateNAV(INITIAL_NAV, 9900);
        pool.updateBounds();
        assertFalse(pool.circuitBreakerActive());
    }

    // ============ COMPLIANCE TESTS ============

    function test_SelfWhitelist() public {
        address newUser = makeAddr("newUser");
        assertFalse(compliance.isCompliant(newUser));

        vm.prank(newUser);
        compliance.selfWhitelist();

        assertTrue(compliance.isCompliant(newUser));
    }

    // ============ FACTORY TESTS ============

    function test_FactoryPoolCreation() public view {
        assertEq(factory.allPoolsLength(), 1);
        assertEq(factory.getPool(address(mBuild), address(usdc)), address(pool));
        assertEq(factory.getPool(address(usdc), address(mBuild)), address(pool));
    }

    // ============ DYNAMIC FEE TEST ============

    function test_DynamicFeeIncreasesWithImbalance() public {
        // Get fee when balanced
        uint256 balancedFee = pool.getCurrentFee();

        // Create imbalance by doing a large swap
        vm.startPrank(alice);
        usdc.mint(alice, 100_000e6);
        usdc.approve(address(pool), 100_000e6);
        pool.swap(address(usdc), 100_000e6, 0, alice);
        vm.stopPrank();

        // Fee should be higher now due to imbalance
        uint256 imbalancedFee = pool.getCurrentFee();
        assertGe(imbalancedFee, balancedFee);
    }
}
