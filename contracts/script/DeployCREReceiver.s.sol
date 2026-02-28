// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/oracle/CREReceiver.sol";
import "../src/oracle/NAVOracle.sol";
import "../src/pool/LiquidBridgePool.sol";

contract DeployCREReceiver is Script {
    // Existing deployed addresses on Base Sepolia
    address constant NAV_ORACLE  = 0x74ec721De6164Cc203FEa1EcFA2670896C47A90C;
    address constant POOL        = 0x61d60590b5a47628D895F71e072BFA531189Da7F;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy CREReceiver — forwarder = deployer for hackathon demo
        CREReceiver creReceiver = new CREReceiver(
            NAV_ORACLE,
            POOL,
            deployer // Production: Chainlink KeystoneForwarder address
        );

        // Authorize CREReceiver to update NAVOracle and Pool
        NAVOracle(NAV_ORACLE).addAuthorizedUpdater(address(creReceiver));
        LiquidBridgePool(POOL).addAuthorizedUpdater(address(creReceiver));

        vm.stopBroadcast();

        console.log("=== CREReceiver Deployed ===");
        console.log("CREReceiver:", address(creReceiver));
        console.log("Connected to NAVOracle:", NAV_ORACLE);
        console.log("Connected to Pool:", POOL);
        console.log("Forwarder (deployer):", deployer);
    }
}
