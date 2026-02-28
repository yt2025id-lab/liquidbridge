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
│  Cron ──► Fetch NAV ──► Verify Reserves              │
│           (NAVLink)     (Proof of Reserve)            │
│               │               │                       │
│               ▼               ▼                       │
│         DON Consensus (Median Aggregation)            │
│                      │                                │
│              Generate DON-signed Report               │
│                      │                                │
│              writeReport()                            │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              SMART CONTRACTS (Base Sepolia)            │
│                                                       │
│  CREReceiver (KeystoneForwarder bridge)              │
│       │                                               │
│       ├──► NAVOracle.updateNAV()                     │
│       └──► LiquidBridgePool.updateBounds()           │
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
- **CRE Workflow**: TypeScript, Chainlink CRE SDK (`@chainlink/cre-sdk`)
- **Chain**: Base Sepolia

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+
- [CRE CLI](https://docs.chain.link/cre/getting-started/cli-installation/macos-linux) (optional, for CRE simulation)

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

### CRE Workflow

**Standalone mode** (direct on-chain writes via wallet):
```bash
cd cre-workflow
npm install
npm run start:standalone
```

**CRE simulation** (DON-signed reports via CRE SDK):
```bash
cd cre-workflow
npm install
npm run simulate
```

**Mock NAV API** (simulates NAVLink data source):
```bash
cd cre-workflow
npm run start:mock-api
# Runs on http://localhost:3001
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
| CREReceiver | `0x5a618f0317d4c5514af7775e17795Abd7525F7C7` |

## CRE Workflow Architecture

The CRE workflow uses the `@chainlink/cre-sdk` to orchestrate NAV updates:

```
1. CronCapability triggers every 60 seconds
2. HTTPClient fetches NAV from data source (NodeMode + median consensus)
3. EVMClient reads current on-chain state
4. runtime.report() generates DON-signed report
5. evmClient.writeReport() submits to CREReceiver contract
6. CREReceiver.onReport() → NAVOracle.updateNAV() → Pool.updateBounds()
```

The `CREReceiver` contract acts as a bridge between the Chainlink KeystoneForwarder and the existing NAVOracle/Pool system, decoding the DON-signed report and forwarding the NAV update.

## Demo Flow (For Judges)

### Step-by-Step (5 minutes)

1. **Connect wallet** to Base Sepolia (get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia))
2. Go to **Portfolio** tab:
   - Click **"Get 10,000 USDC"** → Confirm transaction → Wait for confirmation
   - Click **"Get 100 mBUILD"** → Confirm transaction → Wait for confirmation
   - Click **"Complete KYC Verification"** → This simulates Chainlink ACE compliance
3. Go to **Swap** tab:
   - Select mBUILD → USDC direction
   - Enter **1** mBUILD → Observe the NAV-anchored quote (~$99.95)
   - Note: **Dynamic Fee** shows 0.05% (pool is balanced)
   - Note: **Reserve Ratio** shows ~99.5%
   - Click **"Approve mBUILD"** → Confirm → Then click **"Swap"** → Confirm
   - Price stays within ±0.5% of NAV — this is the core innovation
4. Go to **Pool Dashboard** tab:
   - See live NAV chart with upper/lower bounds (±0.5%)
   - See TVL, volume, swap count, and fee statistics
5. Go to **Liquidity** tab:
   - Enter amounts for both mBUILD and USDC
   - Follow the step-by-step approval flow (Step 1: Approve mBUILD → Step 2: Approve USDC → Add Liquidity)
6. **CRE Workflow** (run in a separate terminal):
   ```bash
   cd cre-workflow && PRIVATE_KEY=<deployer_key> npm run start:standalone
   ```
   - Watch NAV updates every 60 seconds in the terminal
   - See the Pool Dashboard chart update in real-time

### What to Look For
- **Price stays within ±0.5% of NAV** — unlike Uniswap where price drifts freely
- **Dynamic fee increases** when pool becomes imbalanced — try a large swap and check fee
- **Circuit breaker activates** when reserve ratio drops below 98%
- **KYC required** — non-whitelisted wallets cannot trade
- **CRE workflow** updates NAV oracle every 60 seconds via DON-signed reports

## Testing

```bash
cd contracts
forge test -v

# Output (22 tests):
# [PASS] test_SwapRWAtoUSDC()
# [PASS] test_SwapUSDCtoRWA()
# [PASS] test_SwapRevert_NotCompliant()
# [PASS] test_SwapRevert_CircuitBreaker()
# [PASS] test_SwapRevert_StaleOracle()
# [PASS] test_CircuitBreakerAutoActivate()
# [PASS] test_CircuitBreakerAutoDeactivate()
# [PASS] test_DynamicFeeIncreasesWithImbalance()
# [PASS] test_OnReport_UpdatesNAVAndBounds()
# [PASS] test_OnReport_RevertsUnauthorized()
# [PASS] test_OnReport_TriggersCircuitBreaker()
# ... 22 tests pass
```

## License

MIT
