// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../pool/LiquidBridgePool.sol";

/// @title LiquidBridgeFactory - Creates and registers LiquidBridge pools
contract LiquidBridgeFactory is Ownable {
    mapping(address => mapping(address => address)) public getPool;
    address[] public allPools;

    event PoolCreated(address indexed rwaToken, address indexed usdcToken, address pool, uint256 poolCount);

    function createPool(address rwaToken, address usdcToken, address navOracle, address complianceVerifier)
        external
        onlyOwner
        returns (address pool)
    {
        require(rwaToken != usdcToken, "Factory: identical tokens");
        require(getPool[rwaToken][usdcToken] == address(0), "Factory: pool exists");

        LiquidBridgePool newPool = new LiquidBridgePool(rwaToken, usdcToken, navOracle, complianceVerifier);
        newPool.transferOwnership(msg.sender);
        pool = address(newPool);

        getPool[rwaToken][usdcToken] = pool;
        getPool[usdcToken][rwaToken] = pool;
        allPools.push(pool);

        emit PoolCreated(rwaToken, usdcToken, pool, allPools.length);
    }

    function allPoolsLength() external view returns (uint256) {
        return allPools.length;
    }
}
