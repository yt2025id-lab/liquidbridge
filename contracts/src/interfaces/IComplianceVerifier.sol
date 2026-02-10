// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IComplianceVerifier {
    function isCompliant(address account) external view returns (bool);
    function checkTransferCompliance(address from, address to, address token, uint256 amount)
        external
        view
        returns (bool);
}
