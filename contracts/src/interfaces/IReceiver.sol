// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IReceiver - Chainlink CRE KeystoneForwarder receiver interface
/// @notice Contracts must implement this to receive CRE workflow reports
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}
