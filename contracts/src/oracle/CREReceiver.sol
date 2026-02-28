// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IReceiver.sol";
import "../interfaces/INAVOracle.sol";
import "../interfaces/ILiquidBridgePool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CREReceiver - Receives Chainlink CRE workflow reports and forwards to NAVOracle + Pool
/// @notice Bridge between Chainlink KeystoneForwarder and LiquidBridge contracts
contract CREReceiver is IReceiver, Ownable {
    INAVOracle public navOracle;
    ILiquidBridgePool public pool;
    address public forwarder;

    event CREReportProcessed(uint256 nav, uint256 reserveRatio, uint256 timestamp);
    event ForwarderUpdated(address indexed oldForwarder, address indexed newForwarder);

    modifier onlyForwarder() {
        require(
            msg.sender == forwarder || msg.sender == owner(),
            "CREReceiver: unauthorized caller"
        );
        _;
    }

    constructor(address _navOracle, address _pool, address _forwarder) {
        require(_navOracle != address(0), "CREReceiver: zero oracle address");
        require(_pool != address(0), "CREReceiver: zero pool address");
        navOracle = INAVOracle(_navOracle);
        pool = ILiquidBridgePool(_pool);
        forwarder = _forwarder;
    }

    /// @notice Called by KeystoneForwarder with verified CRE report
    /// @param metadata Report metadata (workflow ID, DON ID, etc.)
    /// @param report ABI-encoded (uint256 newNAV, uint256 newReserveRatio)
    function onReport(bytes calldata metadata, bytes calldata report) external override onlyForwarder {
        (uint256 newNAV, uint256 newReserveRatio) = abi.decode(report, (uint256, uint256));

        // Validate inputs before forwarding
        require(newNAV > 0, "CREReceiver: invalid NAV");
        require(newReserveRatio <= 10000, "CREReceiver: invalid reserve ratio");

        // Forward to NAVOracle
        navOracle.updateNAV(newNAV, newReserveRatio);

        // Forward to Pool to update bounds and manage circuit breaker
        pool.updateBounds();

        emit CREReportProcessed(newNAV, newReserveRatio, block.timestamp);
    }

    /// @notice Update the KeystoneForwarder address
    function setForwarder(address _forwarder) external onlyOwner {
        emit ForwarderUpdated(forwarder, _forwarder);
        forwarder = _forwarder;
    }

    /// @notice Update the NAV Oracle address
    function setNAVOracle(address _navOracle) external onlyOwner {
        navOracle = INAVOracle(_navOracle);
    }

    /// @notice Update the Pool address
    function setPool(address _pool) external onlyOwner {
        pool = ILiquidBridgePool(_pool);
    }
}
