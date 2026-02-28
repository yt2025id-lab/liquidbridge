# LiquidBridge — Video Demo Script
## Chainlink Convergence Hackathon 2026 | DeFi & Tokenization Track

> **Total Runtime:** 4 minutes 40 seconds (buffer: 20 seconds under 5-min limit)
> **Format:** Screen recording + voiceover narration (mix of slides and live demo)
> **Resolution:** 1080p minimum, 60fps recommended
> **Tools:** OBS Studio or Loom for recording, separate mic for voiceover
> **Upload:** YouTube (Unlisted) or Loom (Public link)

---

## PRE-RECORDING SETUP CHECKLIST

Before you hit record:

- [ ] **Browser:** Chrome incognito mode, no bookmarks bar, no other tabs
- [ ] **URL:** `http://localhost:3000` loaded and working
- [ ] **MetaMask:** Fresh wallet connected to Base Sepolia with testnet ETH
- [ ] **Wallet state:** NO tokens yet (you'll claim them live during demo)
- [ ] **Terminal:** Ready to run `npm run start:standalone` (but don't start yet)
- [ ] **CRE workflow:** Pre-run the standalone for ~5 minutes before recording so NAVChart has historical data points
- [ ] **Screen:** 1920x1080 resolution, zoom browser to 110% for readability
- [ ] **Microphone:** USB mic plugged in and tested, quiet room
- [ ] **Slides:** Pitch deck open in separate window (Cmd+Tab to switch)
- [ ] **Practice:** Run through the full demo 3 times before recording

---

## SCENE 1: Cold Open — The Hook

**Duration:** 15 seconds
**Timestamp:** 0:00 — 0:15

### What's On Screen
Black screen. White text types out letter by letter (typewriter effect):

```
Frame 1 (0:00-0:03): "A $100 token."
Frame 2 (0:03-0:06): "You sell it on Uniswap."
Frame 3 (0:06-0:09): "You get $85."
Frame 4 (0:09-0:11): [pause — let it sink in]
Frame 5 (0:11-0:13): "That is the problem."
Frame 6 (0:13-0:15): Text fades → LiquidBridge logo animates in
```

### Voiceover Script
> "Imagine holding a hundred-dollar tokenized security. You need to sell. On Uniswap, you get eighty-five dollars — because the AMM formula lets the price drift fifteen percent from real value. That is the problem LiquidBridge solves."

### Recording Instructions
- Record the text animation separately (use Canva/After Effects/Keynote)
- Or use a simple black slide with text appearing on click
- The timing matters — let "$85" land hard before the pause
- Keep voice calm but authoritative

### Wow Moment
The "$85" reveal — the visceral gap between $100 value and $85 received.

### Transition
Logo dissolves into Slide 2 (Problem).

---

## SCENE 2: Problem & Market Context

**Duration:** 25 seconds
**Timestamp:** 0:15 — 0:40

### What's On Screen
Show Pitch Deck **Slide 2** (Problem) for first 15 seconds, then **Slide 3** (Why AMMs Fail) for remaining 10 seconds.

### Voiceover Script
> "The tokenized RWA market is twelve-point-seven billion dollars — with BlackRock, Ondo, and Franklin leading the way. But there is no efficient secondary market.
>
> Primary market redemption takes one to five business days. And traditional AMMs use x-times-y-equals-k, where price is determined purely by pool reserves — not the actual value of the underlying asset.
>
> A few large trades can push the price five to twenty percent away from NAV. For regulated securities, that is completely unacceptable."

### Recording Instructions
- Switch slides smoothly (click or Cmd+Tab)
- Let the x*y=k chart visual appear as you say "x-times-y-equals-k"
- Voice should build urgency toward "completely unacceptable"

### Wow Moment
The "$12.7 billion" stat paired with "zero secondary market" — scale meets gap.

### Transition
Wipe transition to Slide 4 (Solution).

---

## SCENE 3: The Solution — NAV-Anchored Pricing

**Duration:** 20 seconds
**Timestamp:** 0:40 — 1:00

### What's On Screen
Show Pitch Deck **Slide 4** (Solution) — the comparison chart showing LiquidBridge's tight band vs. Uniswap's wild deviation.

### Voiceover Script
> "LiquidBridge replaces x-times-y-equals-k with NAV-anchored pricing. The Chainlink NAVLink oracle is the source of truth. Every trade is priced at the current NAV plus or minus a dynamic fee. The price can never deviate more than zero-point-five percent from real value.
>
> This is not a fork of Uniswap — it is a purpose-built AMM designed from scratch for tokenized securities."

### Recording Instructions
- If possible, animate the comparison chart: show Uniswap curve deviating first (red), then LiquidBridge line staying tight (teal)
- Emphasize "source of truth" with a brief pause

### Wow Moment
The visual contrast between the two charts — wild deviation vs. tight band.

### Transition
Quick transition to innovations montage.

---

## SCENE 4: Five Innovations Quick Montage

**Duration:** 15 seconds
**Timestamp:** 1:00 — 1:15

### What's On Screen
Show Pitch Deck **Slide 5** — five icons appearing one by one (1 icon every ~2 seconds).

### Voiceover Script
> "Five innovations working together. NAV-anchored pricing. Quadratic dynamic fees. Automated circuit breaker. On-chain KYC compliance. And CRE workflow orchestration.
>
> Let me show you how they work — live."

### Recording Instructions
- This is the energy transition from pitch to demo
- Speed up slightly — this is a montage
- "Let me show you" should feel like a shift in energy — you're about to prove it

### Wow Moment
"Let me show you — live." The confidence of proving your claims.

### Transition
**Sharp cut** (not fade) to browser showing the frontend. The abrupt cut creates energy.

---

## SCENE 5: Live Demo — Portfolio Setup

**Duration:** 40 seconds
**Timestamp:** 1:15 — 1:55

### What's On Screen
Browser showing `http://localhost:3000/portfolio` — the Portfolio page.

### Step-by-Step Actions

```
0:00 (1:15) — Browser is showing Portfolio page, wallet not connected
0:03 (1:18) — Click "Connect Wallet" (RainbowKit button in header)
0:06 (1:21) — RainbowKit modal opens → Select MetaMask
0:09 (1:24) — MetaMask popup → Approve connection
0:12 (1:27) — Connected! Show wallet address in header. Portfolio page shows $0.00
0:15 (1:30) — Click "Get 10,000 USDC" green button
0:18 (1:33) — MetaMask popup → Confirm transaction
0:22 (1:37) — Wait for confirmation → Balance shows "10,000.00 USDC"
0:25 (1:40) — Click "Get 100 mBUILD" blue button
0:28 (1:43) — MetaMask popup → Confirm → Balance shows "100.0000 mBUILD"
0:31 (1:46) — Click "Complete KYC Verification" yellow button
0:34 (1:49) — MetaMask popup → Confirm
0:37 (1:52) — Badge flips from yellow "Verify KYC" to teal shield "KYC Verified" ✨
0:40 (1:55) — Portfolio shows total value ($20,000+)
```

### Voiceover Script
> "Let me walk you through the live demo. First, I connect my wallet to Base Sepolia.
>
> On the Portfolio page, I claim test tokens — ten-thousand USDC and one-hundred mBUILD, our mock BlackRock BUIDL token.
>
> Now I complete KYC verification — this simulates Chainlink ACE compliance. Notice the badge turns from yellow to teal, showing I am verified.
>
> Without KYC, the system will not let me trade — compliance is enforced at the smart contract level, not just the frontend."

### Recording Instructions
- **Zoom in** slightly when clicking buttons so judges can see the text
- **Pause briefly** after each transaction confirms — let the balance update be visible
- When KYC badge flips, **slow down** — this is a wow moment
- If MetaMask takes time, narrate: "The transaction is confirming on Base Sepolia..."

### Wow Moment
The KYC badge flip from yellow "Verify KYC" to teal "KYC Verified" with the shield icon — proves compliance is real, not just UI decoration.

### Transition
Click on "Swap" tab in the navigation bar. Camera follows the cursor.

---

## SCENE 6: Live Demo — The Core Swap (MOST IMPORTANT SCENE)

**Duration:** 50 seconds
**Timestamp:** 1:55 — 2:45

### What's On Screen
Browser showing `http://localhost:3000` — the Swap page with SwapCard.

### Step-by-Step Actions

```
0:00 (1:55) — Swap page loaded, "mBUILD → USDC" direction shown
0:03 (1:58) — Click on input field, type "1" (one mBUILD)
0:06 (2:01) — Quote appears: ~$99.95 USDC ← THIS IS THE PROOF
0:10 (2:05) — ZOOM INTO the info panel below:
              • Oracle NAV: $100.00
              • Dynamic Fee: 0.05%
              • Fee Amount: ~$0.05
              • Reserve Ratio: 99.5% (green)
0:18 (2:13) — Hold on this view for 3 seconds. Let judges read.
0:21 (2:16) — Click "Approve mBUILD" teal button
0:24 (2:19) — MetaMask popup → Confirm approval
0:27 (2:22) — Button changes to "Swap mBUILD → USDC" gradient button
0:30 (2:25) — Click swap button
0:33 (2:28) — MetaMask popup → Confirm swap
0:37 (2:32) — Transaction confirms! Balance updates.
0:40 (2:35) — Pause. Then say the key insight about NAV.

OPTIONAL BONUS (if time allows):
0:43 (2:38) — Clear input, type "50" mBUILD
0:46 (2:41) — Show dynamic fee INCREASED (e.g., 0.15% instead of 0.05%)
0:50 (2:45) — Point this out verbally
```

### Voiceover Script
> "Now for the core innovation. I'm on the Swap page. I enter one mBUILD token.
>
> Watch the quote — ninety-nine dollars and ninety-five cents. Look at the details below: the Oracle NAV is exactly one hundred dollars, the dynamic fee is just zero-point-zero-five percent because the pool is balanced, and the reserve ratio is ninety-nine-point-five percent.
>
> I approve the token and execute the swap.
>
> [wait for confirmation]
>
> The price stayed within zero-point-five percent of the real NAV. This is the fundamental difference from Uniswap. On a traditional AMM, this same trade could give you anywhere from ninety-five to one-hundred-five dollars depending on pool depth.
>
> [If showing larger trade:] Now watch what happens when I enter fifty mBUILD — the dynamic fee jumps from zero-point-zero-five to zero-point-fifteen percent. The quadratic fee model discourages pool imbalance automatically."

### Recording Instructions
- **This is the most important scene.** Take your time.
- **ZOOM IN** to the quote ($99.95) and the info panel — judges must be able to read every number
- **Hold for 3 full seconds** on the info panel before continuing
- The "$99.95 vs $100 NAV" is your proof — make it unmissable
- If a transaction takes time to confirm, narrate calmly: "Confirming on Base Sepolia..."

### Wow Moment
The $99.95 quote for a $100 NAV token — near-perfect alignment. This is the moment judges should think "oh, this actually works."

### Transition
Click on "Pool" tab in navigation.

---

## SCENE 7: Live Demo — Pool Dashboard

**Duration:** 35 seconds
**Timestamp:** 2:45 — 3:20

### What's On Screen
Browser showing `http://localhost:3000/pool` — the Pool Dashboard.

### Step-by-Step Actions

```
0:00 (2:45) — Pool Dashboard loads, showing full dashboard
0:03 (2:48) — Pan/scroll to show the 4 stat cards at top:
              TVL | 24h Volume | Total Swaps | Total Fees
0:08 (2:53) — ZOOM INTO the NAV Chart:
              • Teal line = NAV price (~$100)
              • Red dashed lines = Upper bound ($100.50) & Lower bound ($99.50)
              • The teal line stays WITHIN the bounds
0:18 (3:03) — Hold on chart for 5 seconds. Let it update if possible.
0:23 (3:08) — Scroll down to show:
              • Price Information panel (Oracle NAV, Market Price, Deviation %)
              • Proof of Reserve panel (Reserve Ratio with green progress bar)
              • Pool Reserves panel (mBUILD + USDC amounts)
0:35 (3:20) — End on the reserve ratio display
```

### Voiceover Script
> "The Pool Dashboard gives full transparency. At the top, you see total value locked, trading volume, and swap count.
>
> The NAV chart is the centerpiece — that teal line is the real-time NAV price, staying tightly within the upper and lower bounds shown as red dashed lines at plus and minus zero-point-five percent.
>
> [Hold on chart]
>
> The deviation between market price and NAV is near zero. The Proof of Reserve bar shows ninety-nine-point-five percent — well above the ninety-eight percent circuit breaker threshold.
>
> This dashboard gives institutional-grade visibility into pool health — something no traditional AMM provides."

### Recording Instructions
- **The NAVChart is visually striking** — let it breathe on screen
- If the chart has multiple data points from pre-recording CRE runs, it looks much better
- Scroll smoothly — no jerky mouse movements
- Zoom into the deviation percentage (should show ~0.00% or ~0.05%)

### Wow Moment
The NAV chart with the price line hugging the center between bounds — visual proof the system works.

### Transition
Switch to terminal view (Cmd+Tab or split screen).

---

## SCENE 8: Live Demo — CRE Workflow in Action (SECOND MOST IMPORTANT)

**Duration:** 30 seconds
**Timestamp:** 3:20 — 3:50

### What's On Screen
**Split screen:**
- Left half: Terminal running the CRE standalone workflow
- Right half: Browser showing Pool Dashboard (NAVChart)

### Step-by-Step Actions

```
0:00 (3:20) — Show split screen: terminal (left) + dashboard (right)
0:03 (3:23) — Terminal shows the workflow output:
              ═══════════════════════════════════════
              LiquidBridge NAV Update Cycle #42
              ═══════════════════════════════════════
              Step 1: NAV Data Fetched
                New NAV: $100.02 | Reserve: 99.4%
              Step 2: NAV Oracle Updated ✓
                TX: 0xabc123...
              Step 3: Pool Bounds Updated ✓
                Upper: $100.52 | Lower: $99.52
              Step 4: Circuit Breaker: Normal ✓
              ═══════════════════════════════════════
0:10 (3:30) — Wait for next cycle (60s timer in terminal)
              ... or show a previous cycle if timing is tight
0:15 (3:35) — On the RIGHT side, the NAV chart adds a new data point
              The teal line extends with the updated price
0:20 (3:40) — ZOOM into the terminal showing the DON-signed report logging
0:25 (3:45) — ZOOM into the chart showing bounds adjusting
0:30 (3:50) — Pull back to show both sides synced
```

### Voiceover Script
> "Now watch the CRE workflow in action. In the terminal, you see the automated pipeline executing every sixty seconds.
>
> Step one: NAV data is fetched — in production, this is Chainlink NAVLink with median consensus across DON nodes.
> Step two: the NAV Oracle is updated on-chain.
> Step three: pool bounds recalculate.
> Step four: circuit breaker check.
>
> On the right, watch the Pool Dashboard chart update in real-time as new NAV data flows in. This entire pipeline runs autonomously — zero human intervention, powered by the Chainlink CRE SDK."

### Recording Instructions
- **Pre-run the standalone workflow** for at least 5 minutes before recording so there's history
- The split-screen sync is the most technically impressive visual — make sure both sides are visible
- If timing doesn't work perfectly, you can show a pre-recorded terminal output
- Terminal font should be large enough to read (14-16pt)

### Wow Moment
The **live sync** — terminal logs "NAV Oracle Updated" and the chart on the right adds a new data point. This proves the entire pipeline is real and working.

### Transition
Fade to Slide 6 (Chainlink Integration).

---

## SCENE 9: Chainlink Integration Recap

**Duration:** 20 seconds
**Timestamp:** 3:50 — 4:10

### What's On Screen
Show Pitch Deck **Slide 6** (6 Chainlink Services table) then **Slide 7** (Architecture diagram).

### Voiceover Script
> "To recap the Chainlink integration: six services, all deeply woven into the architecture.
>
> CRE orchestrates everything. NAVLink provides pricing. Proof of Reserve verifies backing. ACE handles compliance. CCIP enables cross-chain. Automation triggers the workflow.
>
> This is the deepest Chainlink integration you will see in this hackathon."

### Recording Instructions
- Show the "6" prominently
- Switch from table to architecture diagram halfway through
- "Deepest Chainlink integration" should be delivered with quiet confidence, not arrogance

### Wow Moment
"Deepest Chainlink integration" — bold claim backed by evidence.

### Transition
Fade to Slide 11 (Security).

---

## SCENE 10: Technical Credibility — Tests

**Duration:** 15 seconds
**Timestamp:** 4:10 — 4:25

### What's On Screen
Option A: Show Pitch Deck **Slide 11** (test output + security features)
Option B: Show actual terminal running `forge test -v` with all 22 green [PASS] results

### Voiceover Script
> "Twenty-two tests, one hundred percent passing. The test suite covers swaps, compliance rejects, circuit breaker activation and deactivation, CRE report processing, unauthorized access, stale oracle rejection, and dynamic fee scaling. Every edge case is handled. This is production-grade code."

### Recording Instructions
- If showing live terminal: run `forge test -v` and let the green [PASS] results scroll
- The scrolling green text is satisfying and proves quality
- Speed through this — it's supporting evidence, not the main show

### Wow Moment
22 green [PASS] results scrolling in terminal — visual proof of quality.

### Transition
Fade to closing slide.

---

## SCENE 11: Closing — Why We Should Win

**Duration:** 15 seconds
**Timestamp:** 4:25 — 4:40

### What's On Screen
Show Pitch Deck **Slide 13** (5 reasons to win + tagline).

The five bullet points appear one by one:
1. 6 Chainlink services — deeply integrated
2. Novel AMM design — NAV-anchored
3. Real $12.7B problem
4. Production-ready — 22 tests, 7 contracts, working frontend
5. Complete system — CRE + contracts + frontend

**Then tagline fades in:**
> "Bringing institutional-grade liquidity to tokenized securities."

**End card:** GitHub URL + "Built for Chainlink Convergence Hackathon 2026"

### Voiceover Script
> "LiquidBridge should win because of five things.
>
> Six Chainlink services deeply integrated into the architecture.
> A genuinely novel AMM design that anchors price to NAV.
> A real twelve-point-seven-billion-dollar problem that institutions face today.
> Production-ready code with twenty-two tests and seven deployed contracts.
> And a CRE workflow built with the actual Chainlink CRE SDK.
>
> LiquidBridge — bringing institutional-grade liquidity to tokenized securities, powered by Chainlink.
>
> Thank you."

### Recording Instructions
- Deliver with conviction — this is the close
- Bullet points appear one by one as you say each one
- Pause slightly before "Thank you"
- Hold the end card for 3 seconds after "Thank you"
- Fade to black

### Wow Moment
The cumulative weight of all five points hitting the judges together.

### Transition
Fade to black. Hold for 2 seconds. End.

---

## VIDEO TIMELINE SUMMARY

```
0:00 ─── SCENE 1: Cold Open Hook ──────────── 0:15
0:15 ─── SCENE 2: Problem & Market ─────────── 0:40
0:40 ─── SCENE 3: Solution ────────────────── 1:00
1:00 ─── SCENE 4: Innovations Montage ──────── 1:15
         ┄┄┄ SHIFT FROM SLIDES TO LIVE DEMO ┄┄┄
1:15 ─── SCENE 5: Demo: Portfolio Setup ────── 1:55
1:55 ─── SCENE 6: Demo: Core Swap ★ ────────── 2:45
2:45 ─── SCENE 7: Demo: Pool Dashboard ────── 3:20
3:20 ─── SCENE 8: Demo: CRE Workflow ★ ────── 3:50
         ┄┄┄ SHIFT BACK TO SLIDES ┄┄┄
3:50 ─── SCENE 9: Chainlink Recap ──────────── 4:10
4:10 ─── SCENE 10: Tests ──────────────────── 4:25
4:25 ─── SCENE 11: Closing ────────────────── 4:40

★ = Most important scenes (spend extra time here)
Total: 4:40 (20 seconds under 5-minute limit)
```

---

## POST-PRODUCTION TIPS

### Audio
- Record voiceover separately using Audacity or GarageBand
- Remove background noise with noise reduction filter
- Normalize audio levels to -6dB
- Add subtle background music (royalty-free, cinematic, low volume -20dB)
  - Suggestion: Epidemic Sound "Tech Corporate" or similar
  - Music should be barely noticeable — voiceover is primary

### Video Editing
- Use DaVinci Resolve (free) or iMovie for editing
- Add smooth zoom animations on key UI elements
- Crossfade transitions between slides (0.5s)
- Sharp cut for Scene 4→5 transition (pitch to demo)
- Add subtle highlight/glow on UI elements you're pointing out

### Text Overlays
- Add scene labels in bottom-left corner (e.g., "LIVE DEMO: Swap")
- Add key stats as pop-ups: "$99.95 output for $100 NAV" when showing the quote
- Add "6 Chainlink Services" badge in corner during demo scenes
- Consider adding subtitles/captions for accessibility

### Thumbnail
Create a YouTube thumbnail showing:
- LiquidBridge logo (gradient)
- "NAV-Anchored AMM" text
- Chainlink logo
- "$12.7B Problem" stat
- Dark theme background matching the app

### Upload Settings
- **Title:** "LiquidBridge — NAV-Anchored AMM for Tokenized Securities | Chainlink Convergence 2026"
- **Description:** Include GitHub URL, contract addresses, and brief project description
- **Tags:** Chainlink, DeFi, RWA, Tokenization, AMM, CRE, NAVLink, hackathon
- **Visibility:** Unlisted (anyone with the link can view)

---

## BACKUP PLANS

### If MetaMask is slow during recording:
- Pre-approve tokens before recording, then show the swap directly
- Or record MetaMask popups separately and splice in

### If CRE workflow doesn't sync perfectly with dashboard:
- Pre-record the split-screen scene separately
- Or show terminal output first, then switch to dashboard showing the result

### If the demo app has a bug:
- Have a backup screen recording from a previous successful run
- Always have screenshots ready as fallback

### If you exceed 5 minutes:
- Cut Scene 10 (Tests) — mention "22 tests passing" verbally in the closing instead
- Reduce Scene 2 from 25s to 15s (skip the Ondo/BlackRock names)
- Scene 4 can be cut to 10s

### If you're under 4 minutes:
- Expand Scene 6 by showing a second swap (USDC → mBUILD direction)
- Add the "large trade → higher fee" demo in Scene 6
- Show the Liquidity page briefly (add/remove liquidity)
