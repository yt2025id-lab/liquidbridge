// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IComplianceVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ComplianceVerifier - Whitelist-based compliance for LiquidBridge
/// @notice Simulates Chainlink ACE/CCID compliance checks for hackathon MVP
contract ComplianceVerifier is IComplianceVerifier, Ownable {
    mapping(address => bool) public whitelist;
    uint256 public totalWhitelisted;

    event AddressWhitelisted(address indexed account);
    event AddressRemoved(address indexed account);

    constructor() {}

    function addToWhitelist(address account) external onlyOwner {
        if (!whitelist[account]) {
            whitelist[account] = true;
            totalWhitelisted++;
            emit AddressWhitelisted(account);
        }
    }

    function batchWhitelist(address[] calldata accounts) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            if (!whitelist[accounts[i]]) {
                whitelist[accounts[i]] = true;
                totalWhitelisted++;
                emit AddressWhitelisted(accounts[i]);
            }
        }
    }

    function removeFromWhitelist(address account) external onlyOwner {
        if (whitelist[account]) {
            whitelist[account] = false;
            totalWhitelisted--;
            emit AddressRemoved(account);
        }
    }

    /// @notice Self-whitelist for hackathon demo (judges can onboard themselves)
    function selfWhitelist() external {
        if (!whitelist[msg.sender]) {
            whitelist[msg.sender] = true;
            totalWhitelisted++;
            emit AddressWhitelisted(msg.sender);
        }
    }

    function isCompliant(address account) external view override returns (bool) {
        return whitelist[account];
    }

    function checkTransferCompliance(address from, address to, address, uint256)
        external
        view
        override
        returns (bool)
    {
        return whitelist[from] && whitelist[to];
    }
}
