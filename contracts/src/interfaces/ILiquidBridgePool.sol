// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ILiquidBridgePool {
    struct PoolState {
        uint256 reserveRWA; // RWA token reserves (18 decimals)
        uint256 reserveUSDC; // USDC reserves (6 decimals)
        uint256 totalLiquidity; // Total LP tokens issued (18 decimals)
        uint256 navPrice; // Current NAV price (6 decimals)
        uint256 upperBound; // Upper price bound (6 decimals)
        uint256 lowerBound; // Lower price bound (6 decimals)
        uint256 baseFee; // Base fee in bps
        bool circuitBreakerActive; // True if reserves < threshold
    }

    event Swap(
        address indexed sender,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount,
        uint256 effectivePrice
    );

    event LiquidityAdded(address indexed provider, uint256 amountRWA, uint256 amountUSDC, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amountRWA, uint256 amountUSDC, uint256 liquidity);
    event BoundsUpdated(uint256 newNAV, uint256 upperBound, uint256 lowerBound);
    event CircuitBreakerActivated(uint256 reserveRatio);
    event CircuitBreakerDeactivated(uint256 reserveRatio);

    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, address recipient)
        external
        returns (uint256 amountOut);

    function addLiquidity(uint256 amountRWA, uint256 amountUSDC) external returns (uint256 liquidity);
    function removeLiquidity(uint256 liquidity) external returns (uint256 amountRWA, uint256 amountUSDC);

    function getPoolState() external view returns (PoolState memory);
    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut, uint256 fee);
}
