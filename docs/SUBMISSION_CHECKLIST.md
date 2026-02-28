# LiquidBridge — Submission Checklist
## Chainlink Convergence Hackathon 2026 | DeFi & Tokenization Track

> Use this checklist to ensure everything is ready before submitting.
> Check off each item as you complete it.

---

## 1. PRE-SUBMISSION TECHNICAL VERIFICATION

### Smart Contracts
- [ ] `cd contracts && forge build` — compiles without errors
- [ ] `cd contracts && forge test -v` — 22/22 tests pass
- [ ] All 7 contracts verified on BaseScan Sepolia
- [ ] Contract addresses in README.md match `frontend/src/lib/contracts.ts`

### Frontend
- [ ] `cd frontend && npm install` — no errors
- [ ] `cd frontend && npm run build` — builds successfully
- [ ] `cd frontend && npm run dev` — loads at `http://localhost:3000`
- [ ] All 4 pages load: Swap (`/`), Pool (`/pool`), Liquidity (`/liquidity`), Portfolio (`/portfolio`)
- [ ] Connect wallet works (RainbowKit + MetaMask)
- [ ] Faucet works (claim USDC + mBUILD)
- [ ] KYC self-whitelist works
- [ ] Full swap flow works: Approve → Swap → Balance updates
- [ ] Pool Dashboard shows NAV chart with data
- [ ] Liquidity add/remove works (Step 1 → Step 2 → Add Liquidity)

### CRE Workflow
- [ ] `cd cre-workflow && npm install` — no errors
- [ ] `npm run start:standalone` — runs without crash
- [ ] Standalone updates NAV oracle on-chain (verify via dashboard)
- [ ] `npm run start:mock-api` — mock API runs on port 3001
- [ ] CRE workflow code compiles: `npx tsx src/nav-updater-workflow/main.ts`

### End-to-End Demo Flow (do this with a FRESH wallet)
- [ ] Connect fresh wallet to Base Sepolia
- [ ] Get testnet ETH from Base Sepolia faucet
- [ ] Go to Portfolio → Claim 10,000 USDC ✓
- [ ] Go to Portfolio → Claim 100 mBUILD ✓
- [ ] Go to Portfolio → Complete KYC ✓
- [ ] Go to Swap → Enter 1 mBUILD → Quote shows ~$99.95 ✓
- [ ] Approve mBUILD → Execute Swap ✓
- [ ] Go to Pool Dashboard → Chart has data ✓
- [ ] Start CRE standalone → Dashboard updates within 60s ✓

---

## 2. GITHUB REPOSITORY

### Required Files
- [ ] `README.md` — project description with all Chainlink integrations
- [ ] `LICENSE` — MIT license file
- [ ] `.gitignore` — excludes node_modules, .env, build artifacts
- [ ] `PROJECT_OVERVIEW.md` — detailed hackathon submission doc

### README.md Must Include
- [ ] Project name and one-line description
- [ ] Problem statement
- [ ] Solution overview
- [ ] **Chainlink services table** (6 services with usage description)
- [ ] Architecture diagram
- [ ] Tech stack
- [ ] Quick Start instructions (contracts, frontend, CRE workflow)
- [ ] **Contract addresses** on Base Sepolia (all 7)
- [ ] Demo flow for judges (step-by-step)
- [ ] Test instructions (`forge test -v`)
- [ ] License

### Code Quality
- [ ] No hardcoded private keys or secrets in committed code
- [ ] `.env.example` file provided (if applicable)
- [ ] Clean commit history (no "fix typo" x50)
- [ ] No unnecessary files (node_modules, build folders, .DS_Store)
- [ ] Code is well-commented on complex logic
- [ ] Smart contracts have NatSpec comments on public functions

### Bonus GitHub Items
- [ ] `docs/PITCH_DECK.md` — pitch deck with voiceover scripts
- [ ] `docs/VIDEO_DEMO_SCRIPT.md` — video demo script
- [ ] `docs/SUBMISSION_CHECKLIST.md` — this file
- [ ] Architecture diagram as image in README (PNG/SVG)
- [ ] Demo GIF showing a swap in action (optional but impactful)

---

## 3. DEMO VIDEO

### Production
- [ ] Duration: 3-5 minutes (target 4:40)
- [ ] Resolution: 1080p minimum
- [ ] Clear voiceover audio (USB mic recommended)
- [ ] Mix of slides and live demo
- [ ] Shows ALL 4 frontend pages
- [ ] Shows CRE workflow running in terminal
- [ ] Shows actual swap transaction with NAV-anchored pricing

### Content Coverage
- [ ] Problem statement (12.7B market, no secondary liquidity)
- [ ] Solution explanation (NAV-anchored pricing)
- [ ] 5 innovations mentioned
- [ ] 6 Chainlink services listed
- [ ] Architecture diagram shown
- [ ] CRE SDK code snippets shown
- [ ] Live swap demo with NAV quote proof
- [ ] Pool Dashboard with NAV chart
- [ ] CRE workflow running live (terminal + dashboard sync)
- [ ] Test results mentioned (22/22)
- [ ] Closing with "why we should win"

### Upload
- [ ] Uploaded to YouTube (Unlisted) or Loom (Public)
- [ ] Anyone with the link can view (test in incognito browser)
- [ ] Video title includes project name and hackathon name
- [ ] Description includes GitHub URL and contract addresses

---

## 4. SUBMISSION FORM FIELDS

Fill in these fields when submitting:

| Field | Value |
|-------|-------|
| **Project Name** | LiquidBridge |
| **Track** | DeFi & Tokenization |
| **Tagline** | NAV-Anchored AMM for Tokenized Securities — price = NAV, not x*y=k |
| **Chain** | Base Sepolia |
| **Team Size** | [Your team size, 1-5] |
| **GitHub URL** | [Your GitHub repo URL] |
| **Demo Video URL** | [YouTube/Loom URL] |
| **Live Demo URL** | [Vercel/deployed frontend URL, if applicable] |

### Description (copy-paste ready):

```
LiquidBridge is a NAV-Anchored AMM specifically designed for tokenized securities.

Problem: The $12.7B tokenized RWA market has virtually zero secondary market liquidity.
Traditional AMMs (Uniswap x*y=k) cause 5-20% price deviation from Net Asset Value,
making them unsuitable for institutional securities trading.

Solution: LiquidBridge anchors all prices to the Chainlink NAVLink oracle, keeping
prices within ±0.5% of real NAV. Dynamic fees scale quadratically (0.05% → 0.5%) to
incentivize pool rebalancing. An automated circuit breaker pauses trading when Proof
of Reserve falls below 98%. Every swap requires KYC verification via Chainlink ACE.

The entire NAV update pipeline is orchestrated by a CRE workflow running on the
Chainlink DON every 60 seconds, using DON-signed reports for Byzantine fault tolerance.

Chainlink Services (6): CRE, NAVLink/Data Streams, Proof of Reserve, ACE/CCID,
CCIP (cross-chain ready), Automation.

Tech: Solidity 0.8.24, Foundry, Next.js 15, wagmi v2, @chainlink/cre-sdk.
Tests: 22/22 passing. Contracts: 7 deployed on Base Sepolia.
```

### Chainlink Services Used (select all that apply):
- [x] CRE (Runtime Environment)
- [x] Data Streams / NAVLink
- [x] Proof of Reserve
- [x] ACE / CCID
- [x] CCIP
- [x] Automation

---

## 5. JUDGING CRITERIA ALIGNMENT

The hackathon uses **equally weighted criteria** with a two-stage process:

### Stage 1: Pass/Fail
- [x] Project fits the DeFi & Tokenization theme ✓
- [x] Project uses Chainlink to make a state change on blockchain ✓
- [x] Project is not a past hackathon submission ✓
- [x] Demo video is publicly viewable ✓
- [x] Source code is publicly accessible ✓

### Stage 2: Scoring (Equally Weighted)

| Criterion | How LiquidBridge Scores | Evidence |
|-----------|------------------------|----------|
| **UX** | Clean dark-mode frontend, 4 pages, one-click faucet+KYC, step-by-step approval, real-time quotes | Demo Scenes 5-7 |
| **Technical Implementation** | 9 contracts, NAVMath library, CRE SDK workflow, CREReceiver bridge, 22 tests | Slide 8, Scene 10 |
| **Practicality** | $12.7B market, real liquidity gap, institutional-grade safety | Slides 2-3, Scene 2 |
| **Creativity** | Novel NAV-anchored pricing (not x*y=k fork), quadratic dynamic fees, automated circuit breaker | Slides 4, 9 |
| **Bonus: Chainlink** | 6 services deeply integrated (CRE, NAVLink, PoR, ACE, CCIP, Automation) | Slide 6, Scene 9 |

---

## 6. CONTRACT ADDRESSES (BASE SEPOLIA)

Include these in your submission and verify all BaseScan links work:

| Contract | Address | BaseScan |
|----------|---------|----------|
| MockUSDC | `0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd` | [View](https://sepolia.basescan.org/address/0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd) |
| MockRWAToken (mBUILD) | `0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff` | [View](https://sepolia.basescan.org/address/0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff) |
| ComplianceVerifier | `0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095` | [View](https://sepolia.basescan.org/address/0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095) |
| NAVOracle | `0x74ec721De6164Cc203FEa1EcFA2670896C47A90C` | [View](https://sepolia.basescan.org/address/0x74ec721De6164Cc203FEa1EcFA2670896C47A90C) |
| LiquidBridgeFactory | `0x18b70a873cA71682122c6CC58BC401185fefE47f` | [View](https://sepolia.basescan.org/address/0x18b70a873cA71682122c6CC58BC401185fefE47f) |
| LiquidBridgePool | `0x61d60590b5a47628D895F71e072BFA531189Da7F` | [View](https://sepolia.basescan.org/address/0x61d60590b5a47628D895F71e072BFA531189Da7F) |
| LiquidBridgeRouter | `0xCc824965d3624F5a8852dfC46E02a5f497F02967` | [View](https://sepolia.basescan.org/address/0xCc824965d3624F5a8852dfC46E02a5f497F02967) |
| CREReceiver | TBD (deploy with `Deploy.s.sol`) | TBD |

---

## 7. RECORDING TIPS & BEST PRACTICES

### Environment Setup
- **Browser:** Chrome Incognito Mode (clean, no extensions visible)
- **Browser zoom:** 110% for readability on 1080p
- **Window size:** Maximize browser, no OS taskbar visible
- **Terminal:** Use iTerm2 or VS Code terminal with large font (16pt)
- **Split screen:** Use macOS Split View for Scene 8 (terminal + browser)

### Audio
- Use a USB condenser mic (Blue Yeti, AT2020, or similar)
- Record in a quiet room (no AC, no fans, no outside noise)
- Speak clearly, at a moderate pace (~150 words per minute)
- Record voiceover separately in Audacity or GarageBand if possible
- Normalize audio to -6dB, add noise reduction

### Video Editing (if separate recording)
- Use DaVinci Resolve (free) or iMovie
- Add smooth zoom animations on key UI elements
- Crossfade transitions between slides (0.5s)
- Sharp cut for slide-to-demo transitions (creates energy)
- Add subtle background music at -20dB (barely audible)

### Common Mistakes to Avoid
- [ ] Don't show bookmarks bar or personal tabs
- [ ] Don't show desktop notifications during recording
- [ ] Don't leave MetaMask popup open longer than needed
- [ ] Don't mumble or speak too fast — clarity beats speed
- [ ] Don't say "sorry" or "I forgot" — reshoot instead
- [ ] Don't exceed 5 minutes — judges will stop watching
- [ ] Don't show loading spinners for more than 5 seconds without narrating
- [ ] Don't use a laptop mic — audio quality matters

---

## 8. FINAL SUBMISSION TIMELINE

### T-3 Days: Preparation
- [ ] Verify all contracts work on Base Sepolia
- [ ] Run full end-to-end demo with fresh wallet
- [ ] Finalize pitch deck slides (Google Slides/Canva/Figma)
- [ ] Practice voiceover script 5 times
- [ ] Set up recording environment (mic, screen, browser)

### T-2 Days: Recording
- [ ] Pre-run CRE standalone for 10 minutes (builds NAV chart history)
- [ ] Record pitch slides portion
- [ ] Record live demo portion (Portfolio → Swap → Pool → CRE)
- [ ] Record terminal footage (forge test, CRE workflow)
- [ ] Record voiceover separately if needed

### T-1 Day: Post-Production
- [ ] Edit video (combine slides + demo + voiceover)
- [ ] Add zoom effects and text overlays
- [ ] Add background music (subtle)
- [ ] Review total runtime (must be under 5:00)
- [ ] Upload to YouTube (Unlisted)
- [ ] Test video link in incognito browser
- [ ] Review GitHub repo one final time

### T-0: Submission Day
- [ ] Push final code to GitHub (ensure repo is public)
- [ ] Verify video link works
- [ ] Fill in submission form with all details
- [ ] Double-check all contract addresses
- [ ] Submit before deadline
- [ ] Celebrate!

---

## 9. KEY TALKING POINTS FOR Q&A (If judges ask questions)

### "How is this different from Uniswap?"
> "Uniswap uses x*y=k where price is purely a function of reserves. LiquidBridge anchors price to the Chainlink NAV oracle — the real value. Price can never deviate more than 0.5%. It's designed specifically for regulated securities where accurate pricing is a legal requirement."

### "Why not just use a centralized exchange?"
> "Centralized exchanges require custody transfer and 1-5 day settlement. LiquidBridge enables instant, on-chain, non-custodial trading with compliance built in. It's DeFi with institutional safeguards."

### "How do you handle a flash crash or oracle failure?"
> "Three layers of protection: (1) Stale oracle check — if no update for 1 hour, all swaps revert. (2) NAV bounds — price can't move more than ±0.5% from last valid NAV. (3) Circuit breaker — if reserve ratio drops below 98%, trading auto-pauses."

### "How deep is the Chainlink integration really?"
> "Six services: CRE orchestrates the entire NAV pipeline. NAVLink provides real-time pricing. Proof of Reserve verifies backing. ACE handles KYC compliance. CCIP is architected for cross-chain. Automation triggers CRE every 60 seconds. Remove Chainlink and the product doesn't exist — that's how deep it is."

### "What's the path to mainnet?"
> "Post-hackathon: real NAVLink feeds, deploy CREReceiver. V1: integrate real RWA tokens (BUIDL, OUSG), production KYC via Chainlink ACE. V2: CCIP cross-chain liquidity. V3: institutional partnerships."

### "Why mBUILD and not real BUIDL?"
> "For the hackathon, we use mock tokens that replicate BUIDL's properties (18 decimals, ERC20). The architecture is designed so swapping to real BUIDL is a configuration change — just update the token address in the Factory."

---

## QUICK REFERENCE: What Judges See First

1. **Video thumbnail** — make it professional
2. **First 15 seconds of video** — hook them immediately
3. **README.md** — first thing they open on GitHub
4. **Submission description** — in the submission form
5. **Contract addresses** — they may check BaseScan
6. **Test output** — they may run `forge test`

Optimize for these six touchpoints. If judges stop at step 2, you've already lost.
