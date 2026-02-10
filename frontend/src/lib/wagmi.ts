import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "LiquidBridge",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo-project-id",
  chains: [baseSepolia, hardhat],
  ssr: true,
});
