<div align="center">

<img src="frontend/public/LogoLiquidBridgeTransparan.png" alt="LiquidBridge" width="120" />

# LiquidBridge

### The First NAV-Anchored AMM for Tokenized Securities

**Chainlink Convergence Hackathon 2026 · DeFi & Tokenization Track**

[![Presentation](https://img.shields.io/badge/Presentation-Watch%20Now-FF0000?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1JsKHLS0hFp5cujgwy0rb2Vbkv-o_leAz/view?usp=sharing)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-liquidbridge.vercel.app-00A3FF?style=for-the-badge&logo=vercel)](https://liquidbridge.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-22%2F22%20Passing-00CC88?style=for-the-badge&logo=checkmarx)](https://github.com/yt2025id-lab/liquidbridge)
[![Chain](https://img.shields.io/badge/Chain-Base%20Sepolia-0052FF?style=for-the-badge&logo=coinbase)](https://sepolia.basescan.org)
[![Chainlink](https://img.shields.io/badge/Chainlink-6%20Services-375BD2?style=for-the-badge&logo=chainlink)](https://chain.link)

</div>

---

## The Problem

> *"$12.7 billion in tokenized real-world assets. Zero viable secondary market."*

BlackRock's BUIDL, Franklin Templeton's BENJI, and every other tokenized fund share the same critical flaw: **no secondary market liquidity**. When institutions need to exit, they can only redeem directly with the fund — a process that takes days and disrupts NAV pricing for other investors.

Traditional AMMs like Uniswap make this worse, not better. The x\*y=k invariant allows price to drift arbitrarily far from the fund's official Net Asset Value. A single large swap can push price 5–10% away from NAV — a catastrophic deviation for securities that trade at precisely $100.00 per unit.

**The market needs an AMM designed specifically for tokenized securities. LiquidBridge is that AMM.**

---

## The Solution

LiquidBridge introduces **NAV-Anchored Pricing** — a fundamentally new AMM model where price is determined by the Chainlink oracle, not by reserve ratios:

```
Traditional AMM:   price = reserveUSDC / reserveRWA    ← drifts from NAV freely
LiquidBridge:      price = NAV(oracle) ± dynamic_fee   ← anchored within ±0.5%
```

The protocol enforces a hard price boundary: no trade can execute outside ±0.5% of the Chainlink-reported NAV. Dynamic fees scale quadratically from 0.05% at the midpoint to 0.5% at the bounds, creating natural mean-reversion incentives that keep the pool balanced without external intervention.

---

## Five Core Innovations

| # | Innovation | Impact |
|---|-----------|--------|
| 1 | **NAV-Anchored Pricing** | Price guaranteed within ±0.5% of real fund value |
| 2 | **Quadratic Dynamic Fees** | 0.05%→0.5% scaling creates self-balancing pool |
| 3 | **Automated Circuit Breaker** | Auto-pauses at reserve ratio < 98%, resumes on recovery |
| 4 | **Compliance-First Architecture** | KYC check enforced at smart contract level, not UI |
| 5 | **CRE Orchestration** | Chainlink DON drives every price update, reserve check, and bound adjustment |

---

## Chainlink Integration (6 Services)

LiquidBridge is built on Chainlink infrastructure end-to-end:

| Service | Role | Implementation |
|---------|------|----------------|
| **Chainlink CRE** | Workflow orchestration | `@chainlink/cre-sdk` with CronCapability, HTTPClient, EVMClient, `runtime.report()` |
| **Data Streams / NAVLink** | Real-time NAV pricing | HTTPClient fetches NAV → DON median consensus → on-chain update |
| **Proof of Reserve** | Reserve integrity | `reserveRatio < 98%` triggers circuit breaker via CREReceiver |
| **ACE / CCID** | Compliance enforcement | `ComplianceVerifier.sol` enforces KYC whitelist at swap level |
| **CCIP** | Cross-chain readiness | Architecture supports multi-chain pool deployment |
| **Automation** | Periodic triggers | CronCapability schedules NAV updates every 60 seconds |

### CRE Workflow — How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                  CRE WORKFLOW (Chainlink DON)                │
│                                                             │
│  ① CronCapability     → triggers every 60 seconds          │
│  ② HTTPClient         → fetches NAV from BlackRock feed     │
│  ③ NodeMode consensus → median aggregation across DON nodes │
│  ④ EVMClient          → reads on-chain reserve ratio        │
│  ⑤ runtime.report()  → generates DON-signed report         │
│  ⑥ writeReport()     → submits to CREReceiver contract      │
└───────────────────────────┬─────────────────────────────────┘
                            │ DON-signed report
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                SMART CONTRACTS (Base Sepolia)                │
│                                                             │
│  CREReceiver ──► NAVOracle.updateNAV()                      │
│       └───────► LiquidBridgePool.updateBounds()             │
│                                                             │
│  NAVOracle ──► LiquidBridgePool ◄── ComplianceVerifier      │
│  (NAV data)    (NAV-anchored AMM)   (KYC/AML gate)         │
│                      │                                      │
│              LiquidBridgeRouter ◄── LiquidBridgeFactory     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│                                                             │
│  / Landing ── /trade ── /pool ── /liquidity ── /portfolio   │
│  (hero)       (swap)    (chart)  (LP mgmt)    (faucet+KYC) │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture & Security

### Smart Contracts (8 Deployed on Base Sepolia)

| Contract | Role | Security |
|----------|------|----------|
| `LiquidBridgePool` | Core AMM — NAV-anchored swaps | ReentrancyGuard, circuit breaker, NAV bounds |
| `NAVOracle` | On-chain NAV store with history | Authorized updaters, stale detection (1hr) |
| `CREReceiver` | Chainlink DON report bridge | `onlyForwarder` modifier, KeystoneForwarder pattern |
| `ComplianceVerifier` | KYC/AML whitelist | Checked pre-swap on both sender and recipient |
| `LiquidBridgeRouter` | User-facing entry point | Slippage protection, compliance gateway |
| `LiquidBridgeFactory` | Pool registry & deployer | Ownable, canonical pool registry |
| `MockUSDC` | Test stablecoin with faucet | ERC20, `mint()` for judges |
| `MockRWAToken` | Test BUIDL token with faucet | ERC20, `mint()` for judges |

### Security Properties

- ✅ `ReentrancyGuard` on all state-changing functions
- ✅ `SafeERC20` for all token transfers
- ✅ NAV bounds enforced at contract level (not UI)
- ✅ Circuit breaker auto-activates at `reserveRatio < 9800 bps`
- ✅ Stale oracle detection with 1-hour threshold
- ✅ Access control: `onlyOwner`, `onlyAuthorized`, `onlyForwarder`
- ✅ `Math.mulDiv()` for overflow-safe fixed-point arithmetic

---

## Contract Addresses — Base Sepolia

| Contract | Address | BaseScan |
|----------|---------|----------|
| MockUSDC | `0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd` | [View](https://sepolia.basescan.org/address/0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd) |
| MockRWAToken (mBUILD) | `0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff` | [View](https://sepolia.basescan.org/address/0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff) |
| ComplianceVerifier | `0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095` | [View](https://sepolia.basescan.org/address/0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095) |
| NAVOracle | `0x74ec721De6164Cc203FEa1EcFA2670896C47A90C` | [View](https://sepolia.basescan.org/address/0x74ec721De6164Cc203FEa1EcFA2670896C47A90C) |
| LiquidBridgeFactory | `0x18b70a873cA71682122c6CC58BC401185fefE47f` | [View](https://sepolia.basescan.org/address/0x18b70a873cA71682122c6CC58BC401185fefE47f) |
| LiquidBridgePool | `0x61d60590b5a47628D895F71e072BFA531189Da7F` | [View](https://sepolia.basescan.org/address/0x61d60590b5a47628D895F71e072BFA531189Da7F) |
| LiquidBridgeRouter | `0xCc824965d3624F5a8852dfC46E02a5f497F02967` | [View](https://sepolia.basescan.org/address/0xCc824965d3624F5a8852dfC46E02a5f497F02967) |
| CREReceiver | `0x5a618f0317d4c5514af7775e17795Abd7525F7C7` | [View](https://sepolia.basescan.org/address/0x5a618f0317d4c5514af7775e17795Abd7525F7C7) |

---

## Live Demo — Try It Now

**[liquidbridge.vercel.app](https://liquidbridge.vercel.app)**

### Judge Walkthrough (5 minutes)

**Setup** — Get testnet ETH from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

**Step 1 — Get test tokens** → Go to **My Assets**
- Click **"Get 10,000 USDC"** and **"Get 100 mBUILD"**
- Click **"Complete KYC"** → simulates Chainlink ACE compliance gate

**Step 2 — Trade** → Go to **Trade**
- Enter `1 mBUILD` → observe NAV-anchored quote (`~$99.95`)
- Dynamic Fee shows `0.05%` — pool is balanced, fee is at minimum
- Approve mBUILD → Execute swap → **price stayed within ±0.5% of NAV**

**Step 3 — Observe the oracle** → Go to **Markets**
- Live NAV chart with upper/lower bound bands (±0.5%)
- TVL, volume, and reserve ratio updated in real-time

**Step 4 — Run the CRE Workflow** (separate terminal)
```bash
cd cre-workflow
cp .env.example .env   # add your PRIVATE_KEY
npm install
npm run start:standalone
```
Watch NAV updates propagate on-chain every 60 seconds. The Markets chart updates live.

### What Proves the Innovation

| Action | Expected Result | Why It Matters |
|--------|----------------|----------------|
| Execute small swap | Fee = 0.05% | Pool balanced → minimum fee |
| Execute large swap | Fee increases toward 0.5% | Quadratic scaling activates |
| Attempt swap without KYC | Transaction reverts | Compliance enforced at contract level |
| Watch CRE workflow | NAV updates on-chain every 60s | Live Chainlink DON orchestration |

---

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+

### 1. Smart Contracts

```bash
cd contracts
forge install
forge build
forge test -v
# Expected: 22 tests, 0 failures
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # add NEXT_PUBLIC_WC_PROJECT_ID
npm run dev
# → http://localhost:3000
```

### 3. CRE Workflow

```bash
cd cre-workflow
npm install
cp .env.example .env        # add PRIVATE_KEY
npm run start:standalone    # NAV updates every 60s
```

---

## Test Results

```
Ran 2 test suites in 160ms: 22 tests passed, 0 failed, 0 skipped

contracts/test/LiquidBridgePool.t.sol (14 tests)
  [PASS] test_PoolState()
  [PASS] test_SwapRWAtoUSDC()
  [PASS] test_SwapUSDCtoRWA()
  [PASS] test_SwapRevert_NotCompliant()
  [PASS] test_SwapRevert_CircuitBreaker()
  [PASS] test_SwapRevert_StaleOracle()
  [PASS] test_AddRemoveLiquidity()
  [PASS] test_DynamicFeeIncreasesWithImbalance()
  [PASS] test_NAVUpdate()
  [PASS] test_BoundsUpdate()
  [PASS] test_CircuitBreakerAutoActivate()
  [PASS] test_CircuitBreakerAutoDeactivate()
  [PASS] test_FactoryPoolCreation()
  [PASS] test_SelfWhitelist()

contracts/test/CREReceiver.t.sol (8 tests)
  [PASS] test_OnReport_UpdatesNAVAndBounds()
  [PASS] test_OnReport_OwnerCanCall()
  [PASS] test_OnReport_EmitsEvent()
  [PASS] test_OnReport_RevertsUnauthorized()
  [PASS] test_OnReport_TriggersCircuitBreaker()
  [PASS] test_OnReport_DeactivatesCircuitBreaker()
  [PASS] test_SetForwarder()
  [PASS] test_SetForwarder_RevertsNonOwner()
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin 5 |
| Frontend | Next.js 16, Tailwind CSS v4, RainbowKit v2, wagmi v2, recharts |
| Web3 Client | viem v2, TypeScript |
| CRE Workflow | `@chainlink/cre-sdk` v1.0.7, TypeScript, tsx |
| Chain | Base Sepolia (Chain ID: 84532) |
| Oracle | Chainlink DON — NAVLink, Data Streams, Proof of Reserve |
| Deployment | Vercel (frontend), Foundry broadcast (contracts) |

---

## Repository Structure

```
liquidbridge/
├── contracts/                  # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── pool/               # LiquidBridgePool — core AMM
│   │   ├── oracle/             # NAVOracle + CREReceiver
│   │   ├── compliance/         # ComplianceVerifier (KYC)
│   │   ├── router/             # LiquidBridgeRouter
│   │   ├── factory/            # LiquidBridgeFactory
│   │   ├── libraries/          # NAVMath (fixed-point)
│   │   ├── interfaces/         # ILiquidBridgePool, INAVOracle, ...
│   │   └── mocks/              # MockUSDC, MockRWAToken (testnet)
│   ├── test/                   # Forge tests (22 tests)
│   └── script/                 # Deploy.s.sol, DeployCREReceiver.s.sol
│
├── cre-workflow/               # Chainlink CRE SDK integration
│   └── src/
│       ├── standalone/         # nav-updater.ts — direct wallet mode
│       ├── nav-updater-workflow/ # CRE SDK workflow definition
│       └── mock-api/           # Simulated NAVLink data source
│
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/                # Routes: /, /trade, /pool, /liquidity, /portfolio
│       ├── components/         # UI — swap, pool, liquidity, portfolio, layout
│       ├── hooks/              # usePool, useNAV, useCompliance, useTokenBalances
│       ├── lib/                # contracts.ts (addresses), wagmi.ts (config)
│       └── abis/               # Contract ABIs
│
└── docs/                       # Hackathon materials
    ├── PITCH_DECK.md           # 13-slide deck with voiceover scripts
    ├── VIDEO_DEMO_SCRIPT.md    # 11-scene video script with timing
    ├── SUBMISSION_CHECKLIST.md # Pre-submission verification
    └── live-demo.html          # Self-contained interactive demo
```

---

## Team

Built for the **Chainlink Convergence Hackathon 2026** — DeFi & Tokenization Track.

> *LiquidBridge solves the last unsolved problem in RWA tokenization: secondary market liquidity that respects the fund's real value. Built on Chainlink. Live on Base.*

---

## License

MIT — see [LICENSE](LICENSE)
