/**
 * Mock NAV API Server
 *
 * Simulates the NAVLink / Data Streams API endpoint that the CRE workflow
 * fetches during execution. Uses the same random walk with mean reversion
 * logic as the standalone nav-updater.
 *
 * Endpoints:
 *   GET /api/nav       → { nav, reserveRatio, timestamp }
 *   GET /api/reserves  → { reserveRatio, totalReserve, lastUpdated }
 *   GET /health        → { status: "ok" }
 *
 * Usage:
 *   npm run start:mock-api
 *   # Server runs on http://localhost:3001
 */

import { createServer } from "node:http";

const PORT = 3001;
const INITIAL_NAV = 100.0; // $100.00
let currentNAV = INITIAL_NAV;
let currentReserveRatio = 99.5; // 99.5%

function simulateNAVUpdate(): { nav: number; reserveRatio: number } {
  // Random walk: ±0.05% per request, with mean reversion
  const randomShock = (Math.random() - 0.5) * 0.1;
  const meanReversion = (INITIAL_NAV - currentNAV) * 0.05;
  currentNAV = currentNAV + currentNAV * (randomShock / 100) + meanReversion;

  // Reserve ratio: slight drift between 95-100%
  const reserveShock = (Math.random() - 0.5) * 0.2;
  currentReserveRatio = Math.max(95, Math.min(100, currentReserveRatio + reserveShock));

  return {
    nav: Math.round(currentNAV * 1e6), // 6 decimals (USDC precision)
    reserveRatio: Math.round(currentReserveRatio * 100), // basis points
  };
}

const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url === "/api/nav" && req.method === "GET") {
    const data = simulateNAVUpdate();
    res.writeHead(200);
    res.end(
      JSON.stringify({
        nav: data.nav,
        reserveRatio: data.reserveRatio,
        timestamp: Math.floor(Date.now() / 1000),
        source: "mock-navlink",
      })
    );
  } else if (req.url === "/api/reserves" && req.method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        reserveRatio: Math.round(currentReserveRatio * 100),
        totalReserve: Math.round(currentNAV * 10_000 * 1e6), // Total reserve in USDC
        lastUpdated: Math.floor(Date.now() / 1000),
        source: "mock-proof-of-reserve",
      })
    );
  } else if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log("=== LiquidBridge Mock NAV API ===");
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("");
  console.log("Endpoints:");
  console.log(`  GET http://localhost:${PORT}/api/nav       → NAV data (NAVLink)`);
  console.log(`  GET http://localhost:${PORT}/api/reserves  → Reserve data (Proof of Reserve)`);
  console.log(`  GET http://localhost:${PORT}/health        → Health check`);
  console.log("");
  console.log(`Initial NAV: $${INITIAL_NAV.toFixed(2)}`);
  console.log(`Initial Reserve Ratio: ${currentReserveRatio.toFixed(1)}%`);
});
