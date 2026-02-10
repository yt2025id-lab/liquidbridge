// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockRWAToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 100e18;

    constructor() ERC20("Mock BUIDL Token", "mBUILD") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
