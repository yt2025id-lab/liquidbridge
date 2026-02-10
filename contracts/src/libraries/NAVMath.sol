// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/math/Math.sol";

/// @title NAVMath - Fixed-point math for NAV-anchored pricing
/// @notice All prices use 6 decimals (matching USDC). RWA tokens use 18 decimals.
library NAVMath {
    uint256 internal constant PRICE_PRECISION = 1e6; // 6 decimals for prices
    uint256 internal constant RWA_PRECISION = 1e18; // 18 decimals for RWA token
    uint256 internal constant BPS = 10000;

    /// @notice Calculate swap output for RWA -> USDC
    /// @param amountIn RWA amount (18 decimals)
    /// @param nav Current NAV price (6 decimals)
    /// @param feeBps Fee in basis points
    /// @return amountOut USDC amount (6 decimals)
    function rwaToUsdc(uint256 amountIn, uint256 nav, uint256 feeBps) internal pure returns (uint256 amountOut) {
        // amountOut = amountIn * nav / 1e18 * (1 - fee)
        uint256 gross = Math.mulDiv(amountIn, nav, RWA_PRECISION);
        uint256 feeAmount = Math.mulDiv(gross, feeBps, BPS);
        amountOut = gross - feeAmount;
    }

    /// @notice Calculate swap output for USDC -> RWA
    /// @param amountIn USDC amount (6 decimals)
    /// @param nav Current NAV price (6 decimals)
    /// @param feeBps Fee in basis points
    /// @return amountOut RWA amount (18 decimals)
    function usdcToRwa(uint256 amountIn, uint256 nav, uint256 feeBps) internal pure returns (uint256 amountOut) {
        // amountOut = amountIn * 1e18 / nav * (1 - fee)
        uint256 gross = Math.mulDiv(amountIn, RWA_PRECISION, nav);
        uint256 feeAmount = Math.mulDiv(gross, feeBps, BPS);
        amountOut = gross - feeAmount;
    }

    /// @notice Calculate fee amount for RWA -> USDC
    function rwaToUsdcFee(uint256 amountIn, uint256 nav, uint256 feeBps) internal pure returns (uint256) {
        uint256 gross = Math.mulDiv(amountIn, nav, RWA_PRECISION);
        return Math.mulDiv(gross, feeBps, BPS);
    }

    /// @notice Calculate fee amount for USDC -> RWA (in USDC terms)
    function usdcToRwaFee(uint256 amountIn, uint256 feeBps) internal pure returns (uint256) {
        return Math.mulDiv(amountIn, feeBps, BPS);
    }

    /// @notice Calculate dynamic fee based on deviation from NAV center
    /// @dev Fee scales quadratically: BASE_FEE at center, MAX_FEE at bounds
    /// @param currentImbalance How imbalanced the pool is (0 = perfect, BPS = max)
    /// @param baseFee Base fee in bps (e.g., 5 = 0.05%)
    /// @param maxFee Max fee in bps (e.g., 50 = 0.5%)
    /// @return feeBps Dynamic fee in basis points
    function calculateDynamicFee(uint256 currentImbalance, uint256 baseFee, uint256 maxFee)
        internal
        pure
        returns (uint256 feeBps)
    {
        if (currentImbalance == 0) return baseFee;
        if (currentImbalance >= BPS) return maxFee;

        // Quadratic scaling: fee = baseFee + (maxFee - baseFee) * (imbalance/BPS)^2
        uint256 feeRange = maxFee - baseFee;
        uint256 scaled = Math.mulDiv(currentImbalance, currentImbalance, BPS);
        feeBps = baseFee + Math.mulDiv(feeRange, scaled, BPS);

        if (feeBps > maxFee) feeBps = maxFee;
    }

    /// @notice Calculate pool imbalance ratio
    /// @dev Returns how far the pool ratio deviates from NAV-implied ratio
    /// @param reserveRWA RWA reserves (18 decimals)
    /// @param reserveUSDC USDC reserves (6 decimals)
    /// @param nav NAV price (6 decimals)
    /// @return imbalance Imbalance in basis points (0 = balanced, 10000 = max)
    function calculateImbalance(uint256 reserveRWA, uint256 reserveUSDC, uint256 nav)
        internal
        pure
        returns (uint256 imbalance)
    {
        if (reserveRWA == 0 || reserveUSDC == 0) return 0;

        // Expected USDC value of RWA reserves
        uint256 rwaValueInUsdc = Math.mulDiv(reserveRWA, nav, RWA_PRECISION);
        uint256 totalValue = rwaValueInUsdc + reserveUSDC;

        if (totalValue == 0) return 0;

        // Ideal: 50/50 split. Imbalance = |rwaValue - usdcValue| / totalValue
        uint256 diff = rwaValueInUsdc > reserveUSDC
            ? rwaValueInUsdc - reserveUSDC
            : reserveUSDC - rwaValueInUsdc;

        imbalance = Math.mulDiv(diff, BPS, totalValue);
        if (imbalance > BPS) imbalance = BPS;
    }

    /// @notice Calculate bounds from NAV price
    /// @param nav NAV price (6 decimals)
    /// @param deviationBps Max deviation in basis points (e.g., 50 = 0.5%)
    /// @return upper Upper bound (6 decimals)
    /// @return lower Lower bound (6 decimals)
    function calculateBounds(uint256 nav, uint256 deviationBps)
        internal
        pure
        returns (uint256 upper, uint256 lower)
    {
        uint256 deviation = Math.mulDiv(nav, deviationBps, BPS);
        upper = nav + deviation;
        lower = nav > deviation ? nav - deviation : 0;
    }

    /// @notice Calculate implied price from pool reserves
    function impliedPrice(uint256 reserveRWA, uint256 reserveUSDC) internal pure returns (uint256) {
        if (reserveRWA == 0) return 0;
        return Math.mulDiv(reserveUSDC, RWA_PRECISION, reserveRWA);
    }
}
