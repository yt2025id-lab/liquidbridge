// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/INAVOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NAVOracle - Mock NAVLink oracle updated by CRE Workflow
/// @notice Stores NAV data with history for chart visualization
contract NAVOracle is INAVOracle, Ownable {
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hour
    uint256 public constant MAX_HISTORY = 48;

    NAVData public latestData;
    NAVData[] public history;
    mapping(address => bool) public authorizedUpdaters;

    event NAVUpdated(uint256 nav, uint256 reserveRatio, uint256 timestamp);
    event UpdaterAdded(address indexed updater);
    event UpdaterRemoved(address indexed updater);

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "NAVOracle: not authorized");
        _;
    }

    constructor(uint256 initialNAV, uint256 initialReserveRatio) {
        latestData = NAVData({
            nav: initialNAV,
            timestamp: block.timestamp,
            reserveRatio: initialReserveRatio,
            isStale: false
        });
        history.push(latestData);
        emit NAVUpdated(initialNAV, initialReserveRatio, block.timestamp);
    }

    function updateNAV(uint256 newNAV, uint256 newReserveRatio) external override onlyAuthorized {
        require(newNAV > 0, "NAVOracle: invalid NAV");
        require(newReserveRatio <= 10000, "NAVOracle: invalid ratio");

        latestData = NAVData({
            nav: newNAV,
            timestamp: block.timestamp,
            reserveRatio: newReserveRatio,
            isStale: false
        });

        if (history.length >= MAX_HISTORY) {
            // Shift left: remove oldest entry
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }
        history.push(latestData);

        emit NAVUpdated(newNAV, newReserveRatio, block.timestamp);
    }

    function getLatestNAV() external view override returns (NAVData memory) {
        NAVData memory data = latestData;
        data.isStale = (block.timestamp - data.timestamp) > STALENESS_THRESHOLD;
        return data;
    }

    function getHistoricalNAV(uint256 index) external view override returns (NAVData memory) {
        require(index < history.length, "NAVOracle: index out of bounds");
        return history[index];
    }

    function historyLength() external view override returns (uint256) {
        return history.length;
    }

    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAdded(updater);
    }

    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRemoved(updater);
    }
}
