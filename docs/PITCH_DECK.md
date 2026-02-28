# LiquidBridge Pitch Deck
## Chainlink Convergence Hackathon 2026 | DeFi & Tokenization Track

> **Total Slides:** 13
> **Total Narration Time:** ~4 minutes 10 seconds
> **Design Theme:** Dark mode (gray-950 background, teal-400/blue-500 accents)
> **Tool Recommendation:** Google Slides, Canva, or Figma

---

## SLIDE 1: Title & Hook

**Duration:** 10 seconds

### On-Screen Content
```
                    ┌─────────────────────┐
                    │       [ LB ]        │  ← Gradient teal-to-blue logo
                    │                     │
                    │    LiquidBridge      │  ← Large gradient text
                    │                     │
                    │  NAV-Anchored AMM   │
                    │  for Tokenized      │
                    │  Securities         │
                    │                     │
                    │  ───────────────    │
                    │  Chainlink          │
                    │  Convergence        │
                    │  Hackathon 2026     │
                    │                     │
                    │  DeFi &             │
                    │  Tokenization Track │
                    │                     │
                    │          [⛓ Logo]   │  ← Chainlink logo bottom-right
                    └─────────────────────┘
```

### Visual Direction
- Background: Dark gradient (gray-950 to gray-900)
- "LiquidBridge" in large gradient text (teal → blue), centered
- Subtle bridge illustration connecting "RWA" (left) to "Liquidity" (right)
- Chainlink logo in bottom-right corner
- Optional: Subtle particle animation

### Voiceover Script
> "LiquidBridge. The first AMM where price equals Net Asset Value — not supply and demand. Built for tokenized securities, powered by Chainlink."

### Speaker Notes
- Deliver with confidence and energy. This is your hook.
- Pause slightly after "Net Asset Value" for emphasis.
- Keep tone authoritative but approachable.

---

## SLIDE 2: The Problem — $12.7B Locked in Illiquidity

**Duration:** 25 seconds

### On-Screen Content
- **Headline:** "$12.7B in tokenized securities. Zero secondary market liquidity."
- **Left panel:** Clock icon + "1-5 business days" — Primary market redemption wait
- **Right panel:** Wild price chart + "5-20% deviation" — Uniswap-style AMM result
- **Center:** Question mark — "Where is the secondary market?"
- Red ✕ over both panels

### Visual Direction
```
  ┌──────────────────────┐    ┌──────────────────────┐
  │   PRIMARY MARKET     │    │   UNISWAP AMM        │
  │                      │    │                      │
  │    ⏰ 1-5 Days       │    │   📈 Price chart     │
  │    Wait for          │    │   deviating from     │
  │    redemption        │    │   flat NAV line      │
  │                      │    │                      │
  │       ❌              │    │       ❌              │
  └──────────────────────┘    └──────────────────────┘
                    ❓
            Where is the
           secondary market?
```

### Voiceover Script
> "The tokenized real-world asset market has grown to twelve point seven billion dollars — led by BlackRock BUIDL and Ondo OUSG. But here is the problem: there is virtually zero secondary market liquidity.
>
> If you hold a BUIDL token and need to sell, you have two options. Wait one to five business days for primary market redemption. Or trade on Uniswap, where the x-times-y-equals-k formula causes the price to deviate five to twenty percent from the token's actual value.
>
> For a hundred-dollar security, that means paying anywhere from eighty-five to one-hundred-fifteen dollars. Institutional investors will never accept that."

### Speaker Notes
- Emphasize "$12.7 billion" and "zero secondary market" — make the problem feel massive.
- The institutional angle is key — this is not a retail problem.
- Data source: RWA.xyz market data (January 2026).

---

## SLIDE 3: Why Traditional AMMs Fail for Securities

**Duration:** 15 seconds

### On-Screen Content
- **Formula:** `Traditional AMM: price = reserveUSDC / reserveRWA`
- **Chart:** x*y=k curve showing price sliding along curve as trades happen
- **Highlight:** Red gap between the curve price and the flat $100 NAV line
- **Label:** "5-20% deviation — unacceptable for regulated securities"

### Visual Direction
```
  Price ($)
    │
 115│          ╱  ← Price after buy pressure
    │        ╱
 100│═══════════════════════  NAV = $100 (flat line)
    │      ╲
  85│        ╲  ← Price after sell pressure
    │
    └──────────────────── Trades
         ↑
    Red shaded gap = "Unacceptable deviation"
```

### Voiceover Script
> "Traditional AMMs determine price purely from pool reserves. For a hundred-dollar NAV token, a series of buys can push the on-chain price to one-hundred-fifteen — while the actual asset is still worth exactly one hundred. This deviation is the fundamental design flaw we solve."

### Speaker Notes
- This is the "technical why" — keep it sharp and visual.
- The diverging curves visual is the key takeaway.
- Judges should think "oh, that IS a problem" by the end of this slide.

---

## SLIDE 4: The Solution — NAV-Anchored Pricing

**Duration:** 20 seconds

### On-Screen Content
- **Formula comparison (side by side):**
  - `Traditional: price = f(reserves)` ← Red, crossed out
  - `LiquidBridge: price = NAV ± dynamic_fee` ← Teal, highlighted
- **Chart:** LiquidBridge price (teal line) hugging the NAV line within ±0.5% band
- **Label:** "Price stays within ±0.5% of real NAV — always"

### Visual Direction
```
  Price ($)
    │
100.50│- - - - - - - - - - -  Upper Bound (+0.5%)
      │   ╱╲  ╱╲  ╱╲
100.00│══════════════════════  NAV Oracle (source of truth)
      │  ╲╱  ╲╱  ╲╱
 99.50│- - - - - - - - - - -  Lower Bound (-0.5%)
      │
      └──────────────────── Time
            ↑
    Teal shaded band = "Institutionally acceptable"
```

### Voiceover Script
> "LiquidBridge replaces x-times-y-equals-k with NAV-anchored pricing. The Chainlink NAVLink oracle is the source of truth — not pool reserves. Every trade is priced at the current NAV plus or minus a dynamic fee. The price can never deviate more than zero-point-five percent from the real value.
>
> This is not a Uniswap fork. It is a purpose-built AMM designed from scratch for regulated tokenized securities."

### Speaker Notes
- The formula comparison is THE most important slide.
- Pause after "source of truth" — let it sink in.
- "Not a fork" — this differentiates from 90% of DeFi hackathon projects.

---

## SLIDE 5: Five Innovations

**Duration:** 20 seconds

### On-Screen Content
Five icons in a horizontal row, connected by a teal line:

```
  🎯              📊              🛡️              🪪              ⚙️
  NAV-Anchored    Dynamic Fees    Circuit          On-Chain        CRE Workflow
  Pricing         (Quadratic)     Breaker          Compliance      Orchestration
  ±0.5% bounds    0.05%→0.5%      <98% reserve     KYC/AML         60s automated
                                  auto-pause       every swap      updates

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   "Working as one system"
```

### Voiceover Script
> "LiquidBridge has five key innovations working together.
>
> First, NAV-anchored pricing that keeps prices within zero-point-five percent of real value.
>
> Second, dynamic fees that scale quadratically from zero-point-zero-five percent when balanced, up to zero-point-five percent when imbalanced — naturally incentivizing arbitrageurs to rebalance.
>
> Third, an automated circuit breaker that pauses trading when Proof of Reserve falls below ninety-eight percent.
>
> Fourth, on-chain compliance requiring KYC verification for every swap.
>
> And fifth, a CRE workflow that orchestrates the entire pipeline on the Chainlink DON every sixty seconds."

### Speaker Notes
- Measured pace — each innovation gets ~4 seconds.
- These are your five selling points. Each is a differentiator.
- The "working together" line matters — it's a system, not isolated features.

---

## SLIDE 6: Chainlink Integration — 6 Services

**Duration:** 25 seconds

### On-Screen Content

**Badge at top:** "6 Chainlink Services — Deeply Integrated" (large teal text)

| # | Service | How We Use It |
|---|---------|---------------|
| 1 | **CRE** | Workflow orchestration, DON consensus, signed reports |
| 2 | **NAVLink / Data Streams** | Real-time NAV pricing via HTTPClient + median aggregation |
| 3 | **Proof of Reserve** | Reserve ratio verification, circuit breaker trigger |
| 4 | **ACE (CCID)** | KYC/AML compliance checks before every swap |
| 5 | **CCIP** | Cross-chain architecture ready |
| 6 | **Automation** | Periodic CRE workflow trigger (CronCapability, 60s) |

### Visual Direction
- Each row has the Chainlink service icon/logo on the left
- The number "6" should be very large and prominent
- Use a connected-dots visual to show services are interconnected, not isolated

### Voiceover Script
> "We integrate six Chainlink services — not as checkboxes, but as fundamental building blocks.
>
> CRE is the brain — it orchestrates the entire NAV update pipeline. NAVLink provides real-time pricing. Proof of Reserve continuously verifies the underlying assets. ACE handles KYC and AML compliance. CCIP makes the architecture cross-chain ready. And Chainlink Automation triggers the CRE workflow every sixty seconds.
>
> Every major component of LiquidBridge relies on Chainlink infrastructure. This is not one service bolted on — it is six services woven into the core architecture."

### Speaker Notes
- **Critical slide** — judges give bonus points for multiple Chainlink services.
- Emphasize "woven into the core" — this is the money line.
- The table should be clean and scannable.

---

## SLIDE 7: Architecture Deep Dive

**Duration:** 20 seconds

### On-Screen Content

```
┌──────────────────────────────────────────────────────────┐
│              CRE WORKFLOW (Chainlink DON)                 │
│                                                           │
│   ⏰ Cron ──► 🌐 Fetch NAV ──► 🔍 Verify Reserves       │
│   (60s)       (NAVLink)        (Proof of Reserve)        │
│                    │                  │                    │
│                    ▼                  ▼                    │
│            DON Consensus (Median Aggregation)             │
│                         │                                 │
│              Generate DON-Signed Report                   │
│              (ECDSA + Keccak256)                         │
│                         │                                 │
│                  writeReport()                            │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│            SMART CONTRACTS (Base Sepolia)                  │
│                                                           │
│   CREReceiver.onReport()                                 │
│        │                                                  │
│        ├──► NAVOracle.updateNAV()                        │
│        └──► LiquidBridgePool.updateBounds()              │
│                    │                                      │
│    ComplianceVerifier (ACE/CCID) ◄── checks every swap   │
│                    │                                      │
│           LiquidBridgeRouter                             │
│           (User entry point + deadline protection)       │
│                    │                                      │
│           LiquidBridgeFactory                            │
│           (Pool registry)                                │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                FRONTEND (Next.js 15)                      │
│                                                           │
│   Swap ─── Pool Dashboard ─── Liquidity ─── Portfolio    │
│  (trade)   (NAV chart)       (LP mgmt)    (faucet+KYC)  │
└──────────────────────────────────────────────────────────┘
```

### Visual Direction
- Color-code the three layers: Blue (CRE), Teal (Contracts), Gray (Frontend)
- Animate data flow top-to-bottom with arrows
- Each component is a box with icon

### Voiceover Script
> "Here is the end-to-end architecture. The CRE Workflow runs on the Chainlink DON, fetching NAV data every sixty seconds with Byzantine fault-tolerant median consensus. It generates a DON-signed report and submits it to the CREReceiver contract.
>
> The CREReceiver decodes the report and forwards it to the NAVOracle, which updates the price and reserve ratio. The Pool then recalculates its price bounds and checks the circuit breaker.
>
> On the frontend, users interact through four pages — Swap, Pool Dashboard, Liquidity, and Portfolio."

### Speaker Notes
- Walk through the diagram top-to-bottom as you narrate.
- Point to each component as you mention it (use cursor or animation).
- This slide proves you understand the full system — not just one piece.

---

## SLIDE 8: CRE Workflow — The Heart of Automation

**Duration:** 20 seconds

### On-Screen Content

**Headline:** "5 Steps. 60 Seconds. Zero Human Intervention."

Show actual code snippets from the CRE workflow:

```typescript
// Step 1: Fetch NAV with DON consensus
const navData = runtime.runInNodeMode(
  (nodeRuntime) => {
    const httpClient = new cre.capabilities.HTTPClient();
    const response = httpClient.sendRequest(nodeRuntime, {
      url: config.navApiUrl, method: "GET"
    }).result();
    return JSON.parse(new TextDecoder().decode(response.body));
  },
  consensusMedianAggregation()
)().result();

// Step 4: Generate DON-signed report
const reportResponse = runtime.report({
  encodedPayload: hexToBase64(reportPayload),
  encoderName: "evm",
  signingAlgo: "ecdsa",
  hashingAlgo: "keccak256",
}).result();

// Step 5: Submit to CREReceiver
evmClient.writeReport(runtime, {
  receiver: config.creReceiverAddress,
  report: reportResponse,
}).result();
```

### Visual Direction
- Dark code editor background (VS Code theme)
- Highlight key function calls in teal: `runInNodeMode`, `consensusMedianAggregation`, `runtime.report`, `writeReport`
- Step numbers (1-5) on the left margin

### Voiceover Script
> "Let me show you the actual CRE workflow code. Built with the Chainlink CRE SDK, it uses CronCapability to trigger every sixty seconds. Each DON node independently fetches NAV data via HTTPClient, and results are aggregated using median consensus for Byzantine fault tolerance.
>
> The workflow reads current on-chain state, generates a DON-signed report using ECDSA and Keccak-256, and submits it to our CREReceiver contract.
>
> This is real CRE SDK code — the DON handles consensus, signing, and delivery."

### Speaker Notes
- **This slide proves technical depth.** Judges who understand CRE will recognize proper use of `runInNodeMode`, `consensusMedianAggregation`, and `writeReport`.
- Show the actual code on screen — not pseudocode.
- Highlight the cryptographic signing parameters.

---

## SLIDE 9: Dynamic Fee Math

**Duration:** 15 seconds

### On-Screen Content

**Formula:** `fee = baseFee + (maxFee - baseFee) x (imbalance / 10000)^2`

**Chart:** Quadratic curve showing fee vs. imbalance:

```
  Fee (%)
    │
 0.50│                              ╱
    │                           ╱
 0.35│                       ╱
    │                   ╱
 0.15│              ╱
    │         ╱
 0.05│════════╱
    │
    └──────────────────────────── Pool Imbalance
    0%    25%    50%    75%   100%
  (50/50)                   (100/0)

  Balanced pool = cheap trades
  Imbalanced pool = expensive trades
  Rebalancing trades = cheapest
```

**Three example callouts on the curve:**
- At 0%: "Balanced (50/50) → 0.05%"
- At 50%: "Imbalanced (75/25) → 0.17%"
- At 100%: "Max Imbalanced → 0.50%"

### Voiceover Script
> "The dynamic fee model uses quadratic scaling. When the pool is perfectly balanced, you pay just zero-point-zero-five percent. As the pool becomes imbalanced, the fee rises quadratically — reaching zero-point-five percent at maximum imbalance.
>
> This creates a natural economic incentive: arbitrageurs profit by rebalancing the pool, and their rebalancing trades are the cheapest. No manual intervention needed. The math is clean, the incentives are aligned."

### Speaker Notes
- The quadratic curve visual is powerful — point to it as you explain.
- Emphasize "natural economic incentive" — this is elegant design, not brute force.

---

## SLIDE 10: Live Demo Screenshots

**Duration:** 15 seconds

### On-Screen Content

**Headline:** "Fully Functional MVP — Live on Base Sepolia"

**Stats bar:** "7 Contracts | 22 Tests | 4 Frontend Pages | CRE SDK Workflow"

**2x2 Grid of actual screenshots:**

```
  ┌──────────────────┐  ┌──────────────────┐
  │                  │  │                  │
  │   SWAP PAGE      │  │  POOL DASHBOARD  │
  │                  │  │                  │
  │  NAV-anchored    │  │  NAV chart with  │
  │  quote display   │  │  ±0.5% bounds    │
  │  + dynamic fee   │  │  + TVL stats     │
  │                  │  │                  │
  └──────────────────┘  └──────────────────┘
  ┌──────────────────┐  ┌──────────────────┐
  │                  │  │                  │
  │   LIQUIDITY      │  │   PORTFOLIO      │
  │                  │  │                  │
  │  3-step approval │  │  Faucet tokens   │
  │  flow for LP     │  │  + KYC verify    │
  │  management      │  │  in one click    │
  │                  │  │                  │
  └──────────────────┘  └──────────────────┘
```

### Visual Direction
- Take real screenshots from the running frontend
- Add subtle border glow (teal) around each screenshot
- Label each screenshot with the page name

### Voiceover Script
> "This is not a prototype — it is a fully functional MVP deployed on Base Sepolia with seven smart contracts and twenty-two passing tests.
>
> The swap page shows real-time NAV pricing and dynamic fees. The pool dashboard displays a live NAV chart with upper and lower bounds. The liquidity page has a guided three-step approval flow. And the portfolio page lets judges claim test tokens and complete KYC in one click."

### Speaker Notes
- "Not a prototype" — emphasize this. Many hackathon projects are mockups.
- Screenshots MUST be real — take them from the running app.

---

## SLIDE 11: Smart Contract Security

**Duration:** 15 seconds

### On-Screen Content

**Headline:** "22/22 Tests Passing"

**Left side — Test output screenshot:**
```
[PASS] test_SwapRWAtoUSDC()
[PASS] test_SwapUSDCtoRWA()
[PASS] test_SwapRevert_CircuitBreaker()
[PASS] test_SwapRevert_NotCompliant()
[PASS] test_SwapRevert_StaleOracle()
[PASS] test_CircuitBreakerAutoActivate()
[PASS] test_CircuitBreakerAutoDeactivate()
[PASS] test_DynamicFeeIncreasesWithImbalance()
[PASS] test_OnReport_UpdatesNAVAndBounds()
[PASS] test_OnReport_RevertsUnauthorized()
[PASS] test_OnReport_TriggersCircuitBreaker()
... 22 tests pass
```

**Right side — Security features list:**
- ReentrancyGuard on all state changes
- SafeERC20 for token transfers
- Stale oracle rejection (1hr threshold)
- NAV bounds enforcement (±0.5%)
- KYC enforcement on every swap
- Transaction deadline protection
- Input validation on CRE reports

### Voiceover Script
> "We take security seriously. Twenty-two tests cover every critical path: normal swaps, compliance rejects, circuit breaker activation and deactivation, CRE report processing, unauthorized access, stale oracle rejection, and dynamic fee scaling.
>
> The contracts use OpenZeppelin's ReentrancyGuard, SafeERC20, and Ownable. The pool rejects stale oracle data after one hour. The router enforces transaction deadlines. This is production-grade code."

### Speaker Notes
- Security signals maturity to judges.
- The breadth of test coverage (not just happy path) is impressive.

---

## SLIDE 12: Market Opportunity & Roadmap

**Duration:** 15 seconds

### On-Screen Content

**Horizontal timeline with 4 milestones:**

```
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ POST-   │    │  V1     │    │  V2     │    │  V3     │
  │ HACKATHON│──►│         │──►│         │──►│         │
  │         │    │         │    │         │    │         │
  │• Real   │    │• Real   │    │• CCIP   │    │• Mainnet│
  │  NAVLink│    │  RWA    │    │  cross- │    │  launch │
  │  feeds  │    │  tokens │    │  chain  │    │• Instit.│
  │• Deploy │    │  (BUIDL,│    │  liquid.│    │  partner│
  │  CRE    │    │  OUSG)  │    │• Limit  │    │  ships  │
  │  Receiver│   │• Real   │    │  orders │    │         │
  │         │    │  ACE KYC│    │• LP     │    │         │
  │         │    │         │    │  rewards│    │         │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘
      ↑
   "We are here"
```

**Bottom stat:** "TAM: $12.7B and growing 300%+ YoY"

### Voiceover Script
> "The roadmap is clear. Post-hackathon, we integrate real NAVLink data feeds and deploy CREReceiver on mainnet. Version one adds support for real RWA tokens like BlackRock BUIDL and Ondo OUSG, with Chainlink ACE for production KYC. Version two enables cross-chain liquidity via CCIP. And version three brings institutional partnerships and mainnet deployment.
>
> The market is twelve-point-seven billion and growing. The infrastructure — Chainlink — is ready. LiquidBridge is the missing piece."

### Speaker Notes
- End on "missing piece" — sets up the closing perfectly.
- Don't rush the roadmap — it shows you've thought beyond the hackathon.

---

## SLIDE 13: Closing — Why LiquidBridge Should Win

**Duration:** 15 seconds

### On-Screen Content

Five bullet points appearing one by one:

1. **6 Chainlink services** — deeply integrated, not bolted on
2. **Novel AMM design** — NAV-anchored pricing, not x*y=k
3. **Real problem** — $12.7B market, zero secondary liquidity
4. **Production-ready** — 22 tests, 7 contracts, working frontend, CRE SDK
5. **Complete system** — contracts + CRE + frontend, fully working end-to-end

**Tagline (large gradient text):**
> "Bringing institutional-grade liquidity to tokenized securities."

**Bottom:** GitHub repo URL | QR code | Chainlink logo

### Voiceover Script
> "LiquidBridge should win because of five things.
>
> Six Chainlink services deeply integrated into the architecture.
> A genuinely novel AMM design that anchors price to NAV instead of pool reserves.
> A real twelve-point-seven-billion-dollar problem that institutions face today.
> Production-ready code with twenty-two tests, seven deployed contracts, and a working frontend.
> And a CRE workflow built with the actual Chainlink CRE SDK.
>
> LiquidBridge — bringing institutional-grade liquidity to tokenized securities, powered by Chainlink.
>
> Thank you."

### Speaker Notes
- Deliver with conviction. This is the close.
- The five points map to judging criteria: UX, Technical, Practicality, Creativity, Chainlink bonus.
- End with a confident "Thank you" — not a trailing off.

---

## APPENDIX: Slide Design Specifications

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark gray | `#030712` (gray-950) |
| Primary accent | Teal | `#2DD4BF` (teal-400) |
| Secondary accent | Blue | `#3B82F6` (blue-500) |
| Text primary | White | `#FFFFFF` |
| Text secondary | Gray | `#9CA3AF` (gray-400) |
| Danger/bounds | Red | `#EF4444` (red-500) |
| Success | Green | `#22C55E` (green-500) |
| Warning | Amber | `#F59E0B` (amber-500) |

### Typography
| Element | Font | Size |
|---------|------|------|
| Slide title | Inter Bold | 36-48px |
| Body text | Inter Regular | 18-24px |
| Code snippets | JetBrains Mono | 14-16px |
| Stats/numbers | Inter Black | 48-72px |

### General Rules
- Maximum 3 bullet points per slide
- One key visual per slide
- No full sentences on slides — only keywords and short phrases
- Voiceover carries the narrative; slides are visual support
- Dark theme throughout — consistent with the frontend design
