/**
 * LiquidBridge CRE Workflow - Standalone Fallback
 *
 * This script simulates what the Chainlink CRE Workflow does:
 * 1. Periodically fetches NAV data (simulated with random walk)
 * 2. Verifies reserve status (simulated Proof of Reserve)
 * 3. Updates NAV Oracle on-chain
 * 4. Updates pool bounds
 * 5. Checks circuit breaker conditions
 *
 * In production, this would be a CRE Workflow deployed to a Chainlink DON.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  type Hex,
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// Configuration - update these after deployment
const CONFIG = {
  chain: baseSepolia,
  rpcUrl: "https://sepolia.base.org",
  navOracleAddress: "0x74ec721De6164Cc203FEa1EcFA2670896C47A90C" as Hex,
  poolAddress: "0x61d60590b5a47628D895F71e072BFA531189Da7F" as Hex,
  privateKey: (() => {
    const key = process.env.PRIVATE_KEY;
    if (!key) throw new Error("PRIVATE_KEY environment variable is required. Set it in .env file.");
    return key as Hex;
  })(),
  updateIntervalMs: 60_000, // 60 seconds
  initialNAV: 100.0, // $100.00
};

const NAV_ORACLE_ABI = parseAbi([
  "function updateNAV(uint256 newNAV, uint256 newReserveRatio) external",
  "function getLatestNAV() external view returns (tuple(uint256 nav, uint256 timestamp, uint256 reserveRatio, bool isStale))",
]);

const POOL_ABI = parseAbi([
  "function updateBounds() external",
  "function circuitBreakerActive() external view returns (bool)",
]);

// NAV Simulation: Random walk with mean reversion
let currentNAV = CONFIG.initialNAV;
let currentReserveRatio = 99.5; // 99.5%

function simulateNAVUpdate(): { nav: number; reserveRatio: number } {
  // Random walk: ±0.05% per update, with mean reversion to initial
  const randomShock = (Math.random() - 0.5) * 0.1; // ±0.05%
  const meanReversion = (CONFIG.initialNAV - currentNAV) * 0.05;
  currentNAV = currentNAV + currentNAV * (randomShock / 100) + meanReversion;

  // Reserve ratio: slight drift
  const reserveShock = (Math.random() - 0.5) * 0.2;
  currentReserveRatio = Math.max(
    95,
    Math.min(100, currentReserveRatio + reserveShock)
  );

  return {
    nav: Math.round(currentNAV * 1e6), // 6 decimals
    reserveRatio: Math.round(currentReserveRatio * 100), // basis points
  };
}

async function runWorkflow() {
  const account = privateKeyToAccount(CONFIG.privateKey);

  const publicClient = createPublicClient({
    chain: CONFIG.chain,
    transport: http(CONFIG.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: CONFIG.chain,
    transport: http(CONFIG.rpcUrl),
  });

  console.log("=== LiquidBridge CRE Workflow (Standalone) ===");
  console.log(`Chain: ${CONFIG.chain.name}`);
  console.log(`NAV Oracle: ${CONFIG.navOracleAddress}`);
  console.log(`Pool: ${CONFIG.poolAddress}`);
  console.log(`Update Interval: ${CONFIG.updateIntervalMs / 1000}s`);
  console.log(`Updater: ${account.address}`);
  console.log("---");

  async function update() {
    try {
      const timestamp = new Date().toISOString();

      // Step 1: Simulate NAV data fetch (would be HTTP fetch in CRE)
      const { nav, reserveRatio } = simulateNAVUpdate();
      console.log(
        `\n[${timestamp}] Step 1: NAV Data Fetched`
      );
      console.log(
        `  NAV: $${(nav / 1e6).toFixed(4)} | Reserve: ${(reserveRatio / 100).toFixed(1)}%`
      );

      // Step 2: Update NAV Oracle on-chain
      const updateHash = await walletClient.writeContract({
        address: CONFIG.navOracleAddress,
        abi: NAV_ORACLE_ABI,
        functionName: "updateNAV",
        args: [BigInt(nav), BigInt(reserveRatio)],
      });
      console.log(`[${timestamp}] Step 2: NAV Oracle Updated (tx: ${updateHash.slice(0, 10)}...)`);

      // Step 3: Update pool bounds
      const boundsHash = await walletClient.writeContract({
        address: CONFIG.poolAddress,
        abi: POOL_ABI,
        functionName: "updateBounds",
      });
      console.log(`[${timestamp}] Step 3: Pool Bounds Updated (tx: ${boundsHash.slice(0, 10)}...)`);

      // Step 4: Check circuit breaker
      const cbActive = await publicClient.readContract({
        address: CONFIG.poolAddress,
        abi: POOL_ABI,
        functionName: "circuitBreakerActive",
      });

      if (cbActive) {
        console.log(`[${timestamp}] Step 4: CIRCUIT BREAKER ACTIVE - Trading paused`);
      } else {
        console.log(`[${timestamp}] Step 4: Circuit Breaker: Normal`);
      }

      console.log(`[${timestamp}] Workflow cycle complete`);
    } catch (error) {
      console.error(`[ERROR] Workflow failed:`, (error as Error).message);
    }
  }

  // Initial update
  await update();

  // Schedule periodic updates
  setInterval(update, CONFIG.updateIntervalMs);
  console.log(`\nWorkflow running. Updating every ${CONFIG.updateIntervalMs / 1000}s...`);
}

runWorkflow().catch(console.error);
