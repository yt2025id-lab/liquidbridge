import LiquidBridgePoolABI from "../abis/LiquidBridgePool.json";
import MockUSDCABI from "../abis/MockUSDC.json";
import MockRWATokenABI from "../abis/MockRWAToken.json";
import NAVOracleABI from "../abis/NAVOracle.json";
import ComplianceVerifierABI from "../abis/ComplianceVerifier.json";
import LiquidBridgeRouterABI from "../abis/LiquidBridgeRouter.json";
import LiquidBridgeFactoryABI from "../abis/LiquidBridgeFactory.json";

// Base Sepolia deployed addresses
export const CONTRACTS = {
  mockUSDC: "0xeBA98Eb71E273C88EaA6194af3ea87647F734DAd" as `0x${string}`,
  mockRWAToken: "0x44334f4bD549eACD3eB4ed7fCD6D2Be0eDa868ff" as `0x${string}`,
  complianceVerifier: "0x21FcdFb3dB6f2Dd97B7bAcB68A355ce3288BD095" as `0x${string}`,
  navOracle: "0x74ec721De6164Cc203FEa1EcFA2670896C47A90C" as `0x${string}`,
  factory: "0x18b70a873cA71682122c6CC58BC401185fefE47f" as `0x${string}`,
  pool: "0x61d60590b5a47628D895F71e072BFA531189Da7F" as `0x${string}`,
  router: "0xCc824965d3624F5a8852dfC46E02a5f497F02967" as `0x${string}`,
  creReceiver: "0x5a618f0317d4c5514af7775e17795Abd7525F7C7" as `0x${string}`,
} as const;

export const ABIS = {
  pool: LiquidBridgePoolABI,
  usdc: MockUSDCABI,
  rwaToken: MockRWATokenABI,
  navOracle: NAVOracleABI,
  compliance: ComplianceVerifierABI,
  router: LiquidBridgeRouterABI,
  factory: LiquidBridgeFactoryABI,
} as const;

export const TOKENS = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: CONTRACTS.mockUSDC,
  },
  mBUILD: {
    symbol: "mBUILD",
    name: "Mock BUIDL Token",
    decimals: 18,
    address: CONTRACTS.mockRWAToken,
  },
} as const;
