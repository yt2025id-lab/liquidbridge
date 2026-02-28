# LiquidBridge — Project Overview

**NAV-Anchored Compliant AMM for Tokenized Securities**

> Chainlink Convergence Hackathon 2026 — DeFi & Tokenization Track

---

## TL;DR

LiquidBridge solves the **$12.7B liquidity gap** in tokenized securities by building a decentralized exchange (DEX) where Real World Asset (RWA) tokens can be traded **instantly** — with prices guaranteed to stay within ±0.5% of their real Net Asset Value (NAV). Think of it as **Uniswap, but purpose-built for tokenized securities** — with Chainlink as the trust layer.

---

## The Problem We're Solving

### Tokenized Securities Have No Liquid Secondary Market

The tokenized RWA market has grown to **$12.7B** (led by BlackRock BUIDL, Ondo OUSG, Franklin OnChain), but there's a critical gap:

| What Exists Today | What's Missing |
|---|---|
| Primary market issuance (Ondo, Securitize) | Efficient secondary market trading |
| Mint/redeem through centralized issuers | Instant on-chain liquidity |
| 1-5 business day redemption wait | Real-time price discovery near NAV |

**Why can't we just use Uniswap?** Because traditional AMMs use the `x*y=k` formula where price is determined purely by pool reserves. For a $100 NAV token, a few large trades could push the price to $115 or $85 — **completely unacceptable for regulated securities**.

```
The Gap:
  - Ondo/BlackRock mint RWA tokens ✅
  - Users hold these tokens ✅
  - Users want to sell quickly... ❌ Wait 1-5 business days for redemption
  - Or trade on Uniswap... ❌ Price deviates 5-20% from NAV

LiquidBridge fills this gap.
```

---

## Our Solution

### NAV-Anchored AMM with Institutional-Grade Safety

LiquidBridge replaces the `x*y=k` pricing model with **NAV-anchored pricing** — where the price oracle (Chainlink NAVLink) is the source of truth, not pool reserves:

```
Traditional AMM:   price = reserveUSDC / reserveRWA     → drifts from NAV ❌
LiquidBridge:      price = NAV ± dynamic_fee             → stays within ±0.5% ✅
```

### Five Key Innovations

**1. NAV-Anchored Pricing (±0.5% bounds)**
Every trade is priced based on the latest NAV from the Chainlink oracle, not pool supply/demand. Price can never deviate more than 0.5% from true NAV — ensuring fair pricing for all participants.

**2. Dynamic Fee Model (Quadratic Scaling)**
Fees range from 0.05% (pool balanced) to 0.5% (pool imbalanced). This creates natural economic incentives for arbitrageurs to rebalance the pool — maintaining healthy liquidity without manual intervention.

```
Fee = baseFee + (maxFee - baseFee) × (imbalance²)

Pool Balanced (50/50):     Fee = 0.05%  → Cheap to trade
Pool Imbalanced (80/20):   Fee = 0.35%  → Expensive (discourages further imbalance)
Rebalancing Trade:         Fee = 0.05%  → Cheap (encourages rebalancing)
```

**3. Automated Circuit Breaker**
If the reserve ratio drops below 98% (detected via Chainlink Proof of Reserve), trading is automatically paused. No human intervention needed — the smart contract protects all participants instantly.

**4. On-Chain Compliance (KYC/AML)**
Every swap requires both sender and recipient to be verified through Chainlink ACE (Automated Compliance Engine). This makes LiquidBridge compatible with securities regulations from day one.

**5. CRE Workflow Orchestration**
The entire NAV update pipeline runs on the Chainlink Decentralized Oracle Network (DON) — not a centralized server:

```
CRE DON (every 60s):
  1. Fetch NAV data (HTTPClient + median consensus)
  2. Verify reserves (Proof of Reserve)
  3. Generate DON-signed report
  4. Submit to CREReceiver contract
  5. NAVOracle + Pool bounds auto-update
  6. Circuit breaker auto-check
```

---

## Chainlink Integration (6 Services)

This project maximizes Chainlink service usage — every major component relies on Chainlink infrastructure:

| # | Service | How We Use It |
|---|---------|---------------|
| 1 | **CRE (Runtime Environment)** | Orchestrates the entire NAV update workflow on the DON. CronCapability triggers every 60s. HTTPClient fetches data with BFT consensus. EVMClient reads/writes on-chain. DON-signed reports ensure data integrity. |
| 2 | **NAVLink / Data Streams** | Provides real-time NAV pricing for tokenized securities. The CRE workflow fetches NAV via HTTPClient in NodeMode with `consensusMedianAggregation()` — each DON node fetches independently, results are aggregated for Byzantine fault tolerance. |
| 3 | **Proof of Reserve** | Continuously verifies the reserve ratio backing the tokenized asset. When reserves drop below 98%, the CRE workflow triggers the circuit breaker via the CREReceiver contract. |
| 4 | **ACE / CCID** | On-chain compliance verification. The `ComplianceVerifier` contract checks KYC/AML status before every swap. In production, this integrates with Chainlink's Automated Compliance Engine for institutional-grade identity verification. |
| 5 | **CCIP** | Cross-chain architecture ready. The pool and oracle contracts are designed for multi-chain deployment. CCIP enables RWA token transfers and NAV data propagation across networks. |
| 6 | **Automation** | Periodic trigger for the CRE workflow. Ensures NAV updates happen reliably every 60 seconds without manual intervention. |

### CRE Workflow — Deep Dive

The CRE workflow is the heart of LiquidBridge's automation. Built with `@chainlink/cre-sdk`:

```typescript
// Simplified workflow structure (see cre-workflow/src/nav-updater-workflow/main.ts)

const onCronTrigger = (runtime: Runtime<Config>, payload: CronPayload) => {
  // Step 1: Fetch NAV with DON consensus
  const navData = runtime.runInNodeMode(
    (nodeRuntime) => {
      const httpClient = new cre.capabilities.HTTPClient();
      const response = httpClient.sendRequest(nodeRuntime, {
        url: config.navApiUrl, method: "GET"
      }).result();
      return JSON.parse(new TextDecoder().decode(response.body));
    },
    consensusMedianAggregation()  // BFT: median of all DON nodes
  )().result();

  // Step 2: Read current on-chain state
  const evmClient = new EVMClient(chainSelector);
  evmClient.callContract(runtime, { ... }).result();

  // Step 3: Generate DON-signed report
  const report = runtime.report({
    encodedPayload: hexToBase64(encodedNAVUpdate),
    encoderName: "evm",
    signingAlgo: "ecdsa",
    hashingAlgo: "keccak256",
  }).result();

  // Step 4: Submit to CREReceiver contract
  evmClient.writeReport(runtime, {
    receiver: config.creReceiverAddress,
    report: report,
  }).result();
};
```

The `CREReceiver` contract receives the DON-signed report and forwards it:
```
CREReceiver.onReport()
  → abi.decode(report) → (newNAV, newReserveRatio)
  → NAVOracle.updateNAV(newNAV, newReserveRatio)
  → LiquidBridgePool.updateBounds()
  → Auto circuit breaker check
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│              CRE WORKFLOW (Chainlink DON)                  │
│                                                           │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │  Cron   │───►│  Fetch NAV   │───►│ Fetch Reserve  │   │
│  │ (60s)   │    │  (NAVLink)   │    │ (Proof of Res) │   │
│  └─────────┘    └──────┬───────┘    └───────┬────────┘   │
│                        │                     │            │
│                        ▼                     ▼            │
│               ┌────────────────────────────────┐          │
│               │  DON Consensus (BFT Median)    │          │
│               └──────────────┬─────────────────┘          │
│                              ▼                            │
│               ┌──────────────────────────┐                │
│               │  DON-Signed Report       │                │
│               │  (ECDSA + Keccak256)     │                │
│               └────────────┬─────────────┘                │
│                            │ writeReport()                │
└────────────────────────────┼──────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                SMART CONTRACTS (Base Sepolia)                │
│                                                             │
│  ┌──────────────┐                                          │
│  │ CREReceiver  │◄── KeystoneForwarder verifies DON sigs   │
│  │ .onReport()  │                                          │
│  └──────┬───────┘                                          │
│         │                                                  │
│    ┌────┴────┐                                             │
│    ▼         ▼                                             │
│  ┌────────┐ ┌──────────────────┐    ┌───────────────────┐ │
│  │NAVOracle│ │LiquidBridgePool │◄───│ComplianceVerifier │ │
│  │        │─►│ (NAV-Anchored   │    │ (ACE / CCID)      │ │
│  │        │  │  AMM Engine)    │    │                   │ │
│  └────────┘  └───────┬────────┘    └───────────────────┘ │
│                      │                                     │
│              ┌───────┴────────┐                            │
│              │LiquidBridge    │                            │
│              │Router          │                            │
│              └───────┬────────┘                            │
│                      │                                     │
│              ┌───────┴────────┐                            │
│              │LiquidBridge    │                            │
│              │Factory         │                            │
│              └────────────────┘                            │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                                                             │
│  ┌────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│  │  Swap  │  │   Pool    │  │ Liquidity │  │ Portfolio │ │
│  │ (trade)│  │ Dashboard │  │   (LP)    │  │ (faucet)  │ │
│  └────────┘  └───────────┘  └───────────┘  └───────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| **LiquidBridgePool** | Core AMM engine with NAV-anchored pricing | `swap()`, `addLiquidity()`, `removeLiquidity()`, `updateBounds()` |
| **NAVOracle** | Stores NAV data with 48-point history | `updateNAV()`, `getLatestNAV()`, `getHistoricalNAV()` |
| **CREReceiver** | Bridge between CRE DON and on-chain contracts | `onReport()` → decodes DON-signed report → forwards to Oracle + Pool |
| **ComplianceVerifier** | KYC/AML whitelist (simulates ACE) | `isCompliant()`, `checkTransferCompliance()` |
| **LiquidBridgeRouter** | User-facing entry point with deadline protection | `swapExactInput()`, `addLiquidity()`, `getQuote()` |
| **LiquidBridgeFactory** | Pool creation and registry | `createPool()`, `getPool()` |
| **NAVMath** | Fixed-point math library for pricing | `rwaToUsdc()`, `usdcToRwa()`, `calculateDynamicFee()` |
| **MockUSDC** | Test stablecoin (6 decimals) | `mint()`, `faucet()` |
| **MockRWAToken** | Test RWA token — mBUILD (18 decimals) | `mint()`, `faucet()` |

---

## Testing

**22 tests — 100% passing:**

```
Smart Contract Tests (Foundry):

  LiquidBridgePool (14 tests):
  ✅ test_PoolState                        — Pool initializes correctly
  ✅ test_SwapRWAtoUSDC                    — RWA→USDC swap at NAV price
  ✅ test_SwapUSDCtoRWA                    — USDC→RWA swap at NAV price
  ✅ test_SwapRevert_NotCompliant          — Non-KYC user blocked
  ✅ test_SwapRevert_CircuitBreaker        — Trading halted when CB active
  ✅ test_SwapRevert_StaleOracle           — Rejects stale NAV data
  ✅ test_AddRemoveLiquidity               — LP operations work correctly
  ✅ test_NAVUpdate                        — Oracle updates properly
  ✅ test_BoundsUpdate                     — Bounds recalculate on NAV change
  ✅ test_CircuitBreakerAutoActivate       — CB triggers at <98% reserve
  ✅ test_CircuitBreakerAutoDeactivate     — CB deactivates when reserves recover
  ✅ test_SelfWhitelist                    — Demo KYC flow works
  ✅ test_FactoryPoolCreation              — Factory creates pools correctly
  ✅ test_DynamicFeeIncreasesWithImbalance — Fee scales with pool imbalance

  CREReceiver (8 tests):
  ✅ test_OnReport_UpdatesNAVAndBounds     — CRE report updates NAV + bounds
  ✅ test_OnReport_OwnerCanCall            — Owner authorized as caller
  ✅ test_OnReport_EmitsEvent              — Proper event emission
  ✅ test_OnReport_RevertsUnauthorized     — Unauthorized caller rejected
  ✅ test_OnReport_TriggersCircuitBreaker  — Low reserve activates CB
  ✅ test_OnReport_DeactivatesCircuitBreaker — Recovery deactivates CB
  ✅ test_SetForwarder                     — Admin can update forwarder
  ✅ test_SetForwarder_RevertsNonOwner     — Only owner can set forwarder
```

---

## Contract Addresses (Base Sepolia — Live)

| Contract | Address |
|----------|---------|
| MockUSDC | `0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd` |
| MockRWAToken (mBUILD) | `0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff` |
| ComplianceVerifier | `0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095` |
| NAVOracle | `0x74ec721De6164Cc203FEa1EcFA2670896C47A90C` |
| LiquidBridgeFactory | `0x18b70a873cA71682122c6CC58BC401185fefE47f` |
| LiquidBridgePool | `0x61d60590b5a47628D895F71e072BFA531189Da7F` |
| LiquidBridgeRouter | `0xCc824965d3624F5a8852dfC46E02a5f497F02967` |
| CREReceiver | Deploy pending (included in Deploy.s.sol) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Foundry, OpenZeppelin |
| Frontend | Next.js 16, React 19, TypeScript 5, TailwindCSS 4 |
| Web3 Integration | wagmi v2, viem v2, RainbowKit v2 |
| Data Visualization | Recharts v3 |
| CRE Workflow | @chainlink/cre-sdk, TypeScript, Zod |
| Chain | Base Sepolia (testnet) |

---

## Demo Flow

```
Step 1: Connect wallet to Base Sepolia
Step 2: Portfolio → Claim faucet tokens (10,000 USDC + 100 mBUILD)
Step 3: Portfolio → Click "Complete KYC Verification"
Step 4: Swap → Enter amount → See NAV price + dynamic fee
Step 5: Execute swap → Price stays within ±0.5% of NAV
Step 6: Pool Dashboard → See live NAV chart with bounds
Step 7: Observe CRE Workflow updating NAV every 60 seconds
```

---

## Why We Should Win

1. **Deep Chainlink Integration** — 6 Chainlink services working together, not just one. CRE workflow is the central orchestrator, not an afterthought.

2. **Real Problem, Real Solution** — The $12.7B RWA market genuinely needs secondary market liquidity. Ondo's 1-5 day redemption window is the proof.

3. **Novel AMM Design** — NAV-anchored pricing with quadratic dynamic fees is a genuine innovation over x*y=k. This isn't a fork — it's purpose-built for securities.

4. **Production-Ready Code** — 22 passing tests, deployed contracts, working frontend, proper CRE SDK integration. Not a prototype — a functional MVP.

5. **Institutional-Grade Safety** — Circuit breaker, compliance layer, DON-signed reports. Built for the institutions that will actually use it.

---

## Future Roadmap

| Phase | Features |
|-------|---------|
| **Post-Hackathon** | Deploy CREReceiver to Base Sepolia, integrate real NAVLink data feeds |
| **V1** | Integration with real RWA tokens (OUSG, BUIDL), Chainlink ACE for real KYC, multi-pool support |
| **V2** | CCIP cross-chain liquidity, limit orders, LP incentive programs |
| **V3** | Institutional partnerships, mainnet deployment, regulatory compliance framework |

---

## Team

Built for the Chainlink Convergence Hackathon 2026.

---

*LiquidBridge — Bringing institutional-grade liquidity to tokenized securities, powered by Chainlink.*
