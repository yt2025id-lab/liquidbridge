// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ILiquidBridgePool.sol";
import "../factory/LiquidBridgeFactory.sol";

/// @title LiquidBridgeRouter - User-facing entry point for swaps and liquidity
contract LiquidBridgeRouter {
    using SafeERC20 for IERC20;

    LiquidBridgeFactory public immutable factory;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "Router: expired");
        _;
    }

    constructor(address _factory) {
        factory = LiquidBridgeFactory(_factory);
    }

    function swapExactInput(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountOut) {
        address pool = factory.getPool(tokenIn, tokenOut);
        require(pool != address(0), "Router: pool not found");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).safeApprove(pool, amountIn);

        amountOut = ILiquidBridgePool(pool).swap(tokenIn, amountIn, minAmountOut, recipient);
    }

    function addLiquidity(
        address rwaToken,
        address usdcToken,
        uint256 amountRWA,
        uint256 amountUSDC,
        uint256 minLiquidity,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 liquidity) {
        address pool = factory.getPool(rwaToken, usdcToken);
        require(pool != address(0), "Router: pool not found");

        IERC20(rwaToken).safeTransferFrom(msg.sender, address(this), amountRWA);
        IERC20(usdcToken).safeTransferFrom(msg.sender, address(this), amountUSDC);

        IERC20(rwaToken).safeApprove(pool, amountRWA);
        IERC20(usdcToken).safeApprove(pool, amountUSDC);

        liquidity = ILiquidBridgePool(pool).addLiquidity(amountRWA, amountUSDC);
        require(liquidity >= minLiquidity, "Router: insufficient liquidity");

        // Transfer LP tokens to user
        IERC20(pool).safeTransfer(msg.sender, IERC20(pool).balanceOf(address(this)));
    }

    function removeLiquidity(
        address rwaToken,
        address usdcToken,
        uint256 liquidity,
        uint256 minAmountRWA,
        uint256 minAmountUSDC,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountRWA, uint256 amountUSDC) {
        address pool = factory.getPool(rwaToken, usdcToken);
        require(pool != address(0), "Router: pool not found");

        IERC20(pool).safeTransferFrom(msg.sender, address(this), liquidity);

        (amountRWA, amountUSDC) = ILiquidBridgePool(pool).removeLiquidity(liquidity);

        require(amountRWA >= minAmountRWA, "Router: insufficient RWA");
        require(amountUSDC >= minAmountUSDC, "Router: insufficient USDC");

        IERC20(rwaToken).safeTransfer(msg.sender, amountRWA);
        IERC20(usdcToken).safeTransfer(msg.sender, amountUSDC);
    }

    function getQuote(address tokenIn, address tokenOut, uint256 amountIn)
        external
        view
        returns (uint256 amountOut, uint256 fee)
    {
        address pool = factory.getPool(tokenIn, tokenOut);
        require(pool != address(0), "Router: pool not found");
        return ILiquidBridgePool(pool).getAmountOut(tokenIn, amountIn);
    }
}
