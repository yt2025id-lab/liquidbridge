// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "../interfaces/ILiquidBridgePool.sol";
import "../interfaces/INAVOracle.sol";
import "../interfaces/IComplianceVerifier.sol";
import "../libraries/NAVMath.sol";

/// @title LiquidBridgePool - NAV-Anchored AMM for Tokenized Securities
/// @notice Prices are anchored to NAV oracle with ±0.5% bounds and dynamic fees
contract LiquidBridgePool is ILiquidBridgePool, ERC20, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_DEVIATION_BPS = 50; // 0.5%
    uint256 public constant BASE_FEE_BPS = 5; // 0.05%
    uint256 public constant MAX_FEE_BPS = 50; // 0.5%
    uint256 public constant RESERVE_THRESHOLD_BPS = 9800; // 98%
    uint256 public constant BPS = 10000;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    IERC20 public immutable rwaToken;
    IERC20 public immutable usdcToken;
    INAVOracle public immutable navOracle;
    IComplianceVerifier public complianceVerifier;

    uint256 public upperBound;
    uint256 public lowerBound;
    bool public circuitBreakerActive;

    // Stats
    uint256 public totalVolume;
    uint256 public totalFees;
    uint256 public swapCount;

    mapping(address => bool) public authorizedUpdaters;

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Pool: not authorized");
        _;
    }

    modifier whenActive() {
        require(!circuitBreakerActive, "Pool: circuit breaker active");
        _;
    }

    constructor(
        address _rwaToken,
        address _usdcToken,
        address _navOracle,
        address _complianceVerifier
    ) ERC20("LiquidBridge LP Token", "lbLP") {
        rwaToken = IERC20(_rwaToken);
        usdcToken = IERC20(_usdcToken);
        navOracle = INAVOracle(_navOracle);
        complianceVerifier = IComplianceVerifier(_complianceVerifier);

        // Set initial bounds from oracle
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        (upperBound, lowerBound) = NAVMath.calculateBounds(navData.nav, MAX_DEVIATION_BPS);
    }

    // ============ SWAP ============

    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, address recipient)
        external
        override
        nonReentrant
        whenActive
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Pool: zero amount");
        require(
            tokenIn == address(rwaToken) || tokenIn == address(usdcToken),
            "Pool: invalid token"
        );
        require(
            complianceVerifier.isCompliant(msg.sender),
            "Pool: sender not compliant"
        );
        require(
            complianceVerifier.isCompliant(recipient),
            "Pool: recipient not compliant"
        );

        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        require(!navData.isStale, "Pool: oracle stale");

        // Enforce NAV bounds — effective price must stay within ±0.5% of NAV
        require(
            lowerBound == 0 || (navData.nav >= lowerBound && navData.nav <= upperBound),
            "Pool: price outside NAV bounds"
        );

        uint256 reserveRWA = rwaToken.balanceOf(address(this));
        uint256 reserveUSDC = usdcToken.balanceOf(address(this));

        // Calculate dynamic fee based on pool imbalance
        uint256 imbalance = NAVMath.calculateImbalance(reserveRWA, reserveUSDC, navData.nav);
        uint256 feeBps = NAVMath.calculateDynamicFee(imbalance, BASE_FEE_BPS, MAX_FEE_BPS);

        uint256 feeAmount;
        bool isRwaIn = tokenIn == address(rwaToken);

        if (isRwaIn) {
            // RWA -> USDC
            amountOut = NAVMath.rwaToUsdc(amountIn, navData.nav, feeBps);
            feeAmount = NAVMath.rwaToUsdcFee(amountIn, navData.nav, feeBps);
            require(amountOut <= reserveUSDC, "Pool: insufficient USDC liquidity");

            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
            usdcToken.safeTransfer(recipient, amountOut);
            totalVolume += feeAmount + amountOut; // Track in USDC terms
        } else {
            // USDC -> RWA
            amountOut = NAVMath.usdcToRwa(amountIn, navData.nav, feeBps);
            feeAmount = NAVMath.usdcToRwaFee(amountIn, feeBps);
            require(amountOut <= reserveRWA, "Pool: insufficient RWA liquidity");

            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
            rwaToken.safeTransfer(recipient, amountOut);
            totalVolume += amountIn; // Track in USDC terms
        }

        require(amountOut >= minAmountOut, "Pool: slippage exceeded");

        totalFees += feeAmount;
        swapCount++;

        emit Swap(msg.sender, tokenIn, amountIn, amountOut, feeAmount, navData.nav);
    }

    // ============ LIQUIDITY ============

    function addLiquidity(uint256 amountRWA, uint256 amountUSDC)
        external
        override
        nonReentrant
        returns (uint256 liquidity)
    {
        require(amountRWA > 0 && amountUSDC > 0, "Pool: zero amounts");
        require(complianceVerifier.isCompliant(msg.sender), "Pool: not compliant");

        uint256 totalSupplyBefore = totalSupply();
        uint256 reserveRWA = rwaToken.balanceOf(address(this));
        uint256 reserveUSDC = usdcToken.balanceOf(address(this));

        if (totalSupplyBefore == 0) {
            // First deposit: liquidity = sqrt(amountRWA * amountUSDC) adjusted for decimals
            // Scale to 18 decimals: amountRWA is 18dec, amountUSDC is 6dec
            liquidity = Math.sqrt(amountRWA * amountUSDC * 1e12) - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY); // Lock minimum liquidity
        } else {
            // Proportional deposit
            uint256 liquidityRWA = Math.mulDiv(amountRWA, totalSupplyBefore, reserveRWA);
            uint256 liquidityUSDC = Math.mulDiv(amountUSDC, totalSupplyBefore, reserveUSDC);
            liquidity = liquidityRWA < liquidityUSDC ? liquidityRWA : liquidityUSDC;
        }

        require(liquidity > 0, "Pool: insufficient liquidity minted");

        rwaToken.safeTransferFrom(msg.sender, address(this), amountRWA);
        usdcToken.safeTransferFrom(msg.sender, address(this), amountUSDC);
        _mint(msg.sender, liquidity);

        emit LiquidityAdded(msg.sender, amountRWA, amountUSDC, liquidity);
    }

    function removeLiquidity(uint256 liquidity)
        external
        override
        nonReentrant
        returns (uint256 amountRWA, uint256 amountUSDC)
    {
        require(liquidity > 0, "Pool: zero liquidity");

        uint256 totalSupplyBefore = totalSupply();
        uint256 reserveRWA = rwaToken.balanceOf(address(this));
        uint256 reserveUSDC = usdcToken.balanceOf(address(this));

        amountRWA = Math.mulDiv(liquidity, reserveRWA, totalSupplyBefore);
        amountUSDC = Math.mulDiv(liquidity, reserveUSDC, totalSupplyBefore);

        require(amountRWA > 0 && amountUSDC > 0, "Pool: insufficient amounts");

        _burn(msg.sender, liquidity);
        rwaToken.safeTransfer(msg.sender, amountRWA);
        usdcToken.safeTransfer(msg.sender, amountUSDC);

        emit LiquidityRemoved(msg.sender, amountRWA, amountUSDC, liquidity);
    }

    // ============ ORACLE / CRE INTEGRATION ============

    function updateBounds() external onlyAuthorized {
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        (upperBound, lowerBound) = NAVMath.calculateBounds(navData.nav, MAX_DEVIATION_BPS);

        // Auto-activate circuit breaker if reserves are low
        if (navData.reserveRatio < RESERVE_THRESHOLD_BPS && !circuitBreakerActive) {
            circuitBreakerActive = true;
            emit CircuitBreakerActivated(navData.reserveRatio);
        } else if (navData.reserveRatio >= RESERVE_THRESHOLD_BPS && circuitBreakerActive) {
            circuitBreakerActive = false;
            emit CircuitBreakerDeactivated(navData.reserveRatio);
        }

        emit BoundsUpdated(navData.nav, upperBound, lowerBound);
    }

    function activateCircuitBreaker() external onlyAuthorized {
        circuitBreakerActive = true;
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        emit CircuitBreakerActivated(navData.reserveRatio);
    }

    function deactivateCircuitBreaker() external onlyAuthorized {
        circuitBreakerActive = false;
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        emit CircuitBreakerDeactivated(navData.reserveRatio);
    }

    // ============ VIEW ============

    function getPoolState() external view override returns (PoolState memory) {
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        return PoolState({
            reserveRWA: rwaToken.balanceOf(address(this)),
            reserveUSDC: usdcToken.balanceOf(address(this)),
            totalLiquidity: totalSupply(),
            navPrice: navData.nav,
            upperBound: upperBound,
            lowerBound: lowerBound,
            baseFee: BASE_FEE_BPS,
            circuitBreakerActive: circuitBreakerActive
        });
    }

    function getAmountOut(address tokenIn, uint256 amountIn)
        external
        view
        override
        returns (uint256 amountOut, uint256 fee)
    {
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        uint256 reserveRWA = rwaToken.balanceOf(address(this));
        uint256 reserveUSDC = usdcToken.balanceOf(address(this));
        uint256 imbalance = NAVMath.calculateImbalance(reserveRWA, reserveUSDC, navData.nav);
        uint256 feeBps = NAVMath.calculateDynamicFee(imbalance, BASE_FEE_BPS, MAX_FEE_BPS);

        if (tokenIn == address(rwaToken)) {
            amountOut = NAVMath.rwaToUsdc(amountIn, navData.nav, feeBps);
            fee = NAVMath.rwaToUsdcFee(amountIn, navData.nav, feeBps);
        } else {
            amountOut = NAVMath.usdcToRwa(amountIn, navData.nav, feeBps);
            fee = NAVMath.usdcToRwaFee(amountIn, feeBps);
        }
    }

    function getImpliedPrice() external view returns (uint256) {
        return NAVMath.impliedPrice(rwaToken.balanceOf(address(this)), usdcToken.balanceOf(address(this)));
    }

    function getCurrentFee() external view returns (uint256) {
        INAVOracle.NAVData memory navData = navOracle.getLatestNAV();
        uint256 imbalance = NAVMath.calculateImbalance(
            rwaToken.balanceOf(address(this)), usdcToken.balanceOf(address(this)), navData.nav
        );
        return NAVMath.calculateDynamicFee(imbalance, BASE_FEE_BPS, MAX_FEE_BPS);
    }

    // ============ ADMIN ============

    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    function setComplianceVerifier(address _complianceVerifier) external onlyOwner {
        complianceVerifier = IComplianceVerifier(_complianceVerifier);
    }
}
