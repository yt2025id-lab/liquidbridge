// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/mocks/MockUSDC.sol";
import "../src/mocks/MockRWAToken.sol";
import "../src/compliance/ComplianceVerifier.sol";
import "../src/oracle/NAVOracle.sol";
import "../src/factory/LiquidBridgeFactory.sol";
import "../src/router/LiquidBridgeRouter.sol";
import "../src/pool/LiquidBridgePool.sol";
import "../src/oracle/CREReceiver.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy mock tokens
        MockUSDC usdc = new MockUSDC();
        MockRWAToken mBuild = new MockRWAToken();

        // 2. Deploy compliance verifier
        ComplianceVerifier compliance = new ComplianceVerifier();

        // 3. Deploy NAV Oracle (initial NAV = $100.00, reserve ratio = 99.5%)
        NAVOracle navOracle = new NAVOracle(100_000_000, 9950); // 100.00 USDC, 99.5%

        // 4. Deploy factory
        LiquidBridgeFactory factory = new LiquidBridgeFactory();

        // 5. Create pool
        address pool = factory.createPool(
            address(mBuild), address(usdc), address(navOracle), address(compliance)
        );

        // 6. Deploy router
        LiquidBridgeRouter router = new LiquidBridgeRouter(address(factory));

        // 7. Setup: authorize pool and whitelist deployer
        navOracle.addAuthorizedUpdater(deployer);
        LiquidBridgePool(pool).addAuthorizedUpdater(deployer);
        compliance.addToWhitelist(deployer);
        compliance.addToWhitelist(pool);
        compliance.addToWhitelist(address(router));

        // 8. Deploy CREReceiver (forwarder = deployer for hackathon demo)
        CREReceiver creReceiver = new CREReceiver(
            address(navOracle),
            pool,
            deployer // In production: Chainlink KeystoneForwarder address
        );
        navOracle.addAuthorizedUpdater(address(creReceiver));
        LiquidBridgePool(pool).addAuthorizedUpdater(address(creReceiver));

        // 9. Seed initial liquidity: 10,000 mBUILD + 1,000,000 USDC
        mBuild.mint(deployer, 10_000e18);
        usdc.mint(deployer, 1_000_000e6);

        mBuild.approve(pool, 10_000e18);
        usdc.approve(pool, 1_000_000e6);
        LiquidBridgePool(pool).addLiquidity(10_000e18, 1_000_000e6);

        vm.stopBroadcast();

        // Log addresses
        console.log("=== LiquidBridge Deployed ===");
        console.log("MockUSDC:", address(usdc));
        console.log("MockRWAToken (mBUILD):", address(mBuild));
        console.log("ComplianceVerifier:", address(compliance));
        console.log("NAVOracle:", address(navOracle));
        console.log("LiquidBridgeFactory:", address(factory));
        console.log("LiquidBridgePool:", pool);
        console.log("LiquidBridgeRouter:", address(router));
        console.log("CREReceiver:", address(creReceiver));
    }
}
