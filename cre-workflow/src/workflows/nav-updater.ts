/**
 * LiquidBridge NAV Updater - Chainlink CRE Workflow Reference
 *
 * The actual CRE SDK implementation lives at: ../nav-updater-workflow/main.ts
 *
 * Architecture:
 *
 *   [CRE DON]                           [Base Sepolia]
 *
 *    Cron Trigger (60s)
 *         │
 *         ▼
 *    Fetch NAV via HTTPClient
 *    (NodeMode + Median Consensus)
 *         │
 *         ▼
 *    Read on-chain state via EVMClient
 *         │
 *         ▼
 *    Generate DON-signed Report
 *         │
 *         ▼
 *    writeReport() ─────────────────►  CREReceiver.onReport()
 *                                           │
 *                                           ├──► NAVOracle.updateNAV()
 *                                           └──► Pool.updateBounds()
 *                                                    └──► Circuit Breaker Check
 *
 * Running Modes:
 *   - Standalone:  npm run start:standalone  (viem wallet client)
 *   - CRE Sim:    npm run simulate          (CRE CLI local simulation)
 *   - Production:  cre workflow deploy       (deploy to Chainlink DON)
 *
 * @see ../nav-updater-workflow/main.ts — Full CRE SDK implementation
 * @see ../standalone/nav-updater.ts — Standalone fallback
 */

export { WORKFLOW_NAME, WORKFLOW_VERSION, CHAINLINK_SERVICES } from "../nav-updater-workflow/main.js";
