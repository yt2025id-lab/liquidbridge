// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INAVOracle {
    struct NAVData {
        uint256 nav; // NAV price in USDC terms (6 decimals)
        uint256 timestamp; // When NAV was last updated
        uint256 reserveRatio; // Reserve ratio in basis points (10000 = 100%)
        bool isStale; // True if data is older than staleness threshold
    }

    function getLatestNAV() external view returns (NAVData memory);
    function updateNAV(uint256 newNAV, uint256 newReserveRatio) external;
    function getHistoricalNAV(uint256 index) external view returns (NAVData memory);
    function historyLength() external view returns (uint256);
}
