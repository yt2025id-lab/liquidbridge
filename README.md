# LiquidBridge

**NAV-Anchored Compliant AMM for Tokenized Securities**

> Chainlink Convergence Hackathon 2026 - DeFi & Tokenization Track

## Problem

Tokenized real-world assets (RWAs) represent a $12.7B market with **virtually zero secondary market liquidity**. Traditional AMMs (Uniswap-style x*y=k) cause unacceptable price deviation from Net Asset Value (NAV), making them unsuitable for institutional securities trading.

## Solution

LiquidBridge is an AMM specifically designed for tokenized securities with:

- **NAV-Anchored Pricing** - Prices stay within ±0.5% of Chainlink NAVLink oracle
- **Dynamic Fees** - 0.05% at center, scaling to 0.5% at bounds (quadratic)
- **Circuit Breaker** - Auto-pauses trading when Proof of Reserve falls below 98%
- **Compliance Layer** - KYC/AML verification via Chainlink ACE (CCID)
- **CRE Orchestration** - Automated NAV updates, reserve checks, and bound adjustments

## Architecture

```
┌──────────────────────────────────────────────────────┐
│            CRE WORKFLOW (Chainlink DON)               │
│                                                       │
│  Cron ──► Fetch NAV ──► Verify Reserves ──► Update   │
│           (NAVLink)     (Proof of Reserve)  Oracle    │
│                                               │       │
│                                         Update Bounds │
│                                               │       │
│                                    Check Circuit      │
│                                    Breaker            │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Base Sepolia)            │
│                                                       │
│  NAVOracle ──► LiquidBridgePool ◄── ComplianceVerifier│
│  (NAV data)    (NAV-anchored AMM)   (ACE/CCID)       │
│                      │                                │
│              LiquidBridgeRouter                       │
│              (User entry point)                       │
│                      │                                │
│              LiquidBridgeFactory                      │
│              (Pool registry)                          │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                  │
│                                                       │
│  Swap ─── Pool Dashboard ─── Liquidity ─── Portfolio  │
│  (trade)  (NAV chart)       (LP mgmt)    (faucet)    │
└──────────────────────────────────────────────────────┘
```

## Chainlink Services Used (6)

| Service | Usage |
|---------|-------|
| **CRE** | Orchestrates NAV updates, reserve verification, circuit breaker |
| **NAVLink / Data Streams** | Real-time NAV pricing for tokenized assets |
| **Proof of Reserve** | Continuous reserve ratio verification |
| **ACE (CCID)** | Compliant trading with KYC/AML checks |
| **CCIP** | Cross-chain architecture ready |
| **Automation** | Periodic CRE workflow trigger |

## Innovation: NAV-Anchored Pricing

Unlike traditional AMMs where price = f(reserves), LiquidBridge anchors price to the NAV oracle:

```
Traditional AMM:  price = reserveUSDC / reserveRWA  (drifts from NAV)
LiquidBridge:     price = NAV ± dynamic_fee          (stays within ±0.5%)
```

Dynamic fee scales quadratically from center to bounds, naturally incentivizing arbitrage back to NAV.

## Tech Stack

- **Smart Contracts**: Solidity 0.8.24, Foundry, OpenZeppelin
- **Frontend**: Next.js 15, Tailwind CSS, RainbowKit, wagmi v2, recharts
- **CRE Workflow**: TypeScript, Chainlink CRE SDK
- **Chain**: Base Sepolia

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+

### Smart Contracts
```bash
cd contracts
forge install
forge build
forge test -v
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### CRE Workflow (Standalone)
```bash
cd cre-workflow
npm install
npm start
```

## Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| MockUSDC | `0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd` |
| MockRWAToken (mBUILD) | `0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff` |
| ComplianceVerifier | `0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095` |
| NAVOracle | `0x74ec721De6164Cc203FEa1EcFA2670896C47A90C` |
| LiquidBridgeFactory | `0x18b70a873cA71682122c6CC58BC401185fefE47f` |
| LiquidBridgePool | `0x61d60590b5a47628D895F71e072BFA531189Da7F` |
| LiquidBridgeRouter | `0xCc824965d3624F5a8852dfC46E02a5f497F02967` |

## Demo Flow (For Judges)

1. **Connect wallet** to Base Sepolia
2. Go to **Portfolio** → Click **"Get 10,000 USDC"** and **"Get 100 mBUILD"**
3. Click **"Complete KYC Verification"** (self-whitelist)
4. Go to **Swap** → Enter amount → See NAV price, dynamic fee, reserve ratio
5. Execute a swap → Observe price stays near NAV
6. Go to **Pool Dashboard** → See NAV chart with bounds
7. Observe CRE Workflow updating NAV every 60 seconds

## Testing

```bash
cd contracts
forge test -v

# Output:
# [PASS] test_SwapRWAtoUSDC()
# [PASS] test_SwapUSDCtoRWA()
# [PASS] test_SwapRevert_NotCompliant()
# [PASS] test_SwapRevert_CircuitBreaker()
# [PASS] test_SwapRevert_StaleOracle()
# [PASS] test_CircuitBreakerAutoActivate()
# [PASS] test_CircuitBreakerAutoDeactivate()
# [PASS] test_DynamicFeeIncreasesWithImbalance()
# ... 14 tests pass
```

## License

MIT
