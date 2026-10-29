import contractConfig from '../contracts/contractConfig.json';

/**
 * Web3 configuration that does **not** depend on ethers.
 *
 * Keeping the contract address and the demo accounts in a separate, dependency
 * free module allows the application shell to render without pulling the ~100 kB
 * (gzipped) ethers bundle into the initial payload. The heavy service is loaded
 * on demand through `import('../services/web3Service')`.
 */

export const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

/** Returns the configured contract address (env var wins over the deploy config). */
export function getConfiguredContractAddress(): string {
  const envAddr = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddr) return envAddr;
  return (contractConfig as any).contractAddress || DEFAULT_CONTRACT_ADDRESS;
}

/** True when a browser wallet (MetaMask & compatible) is available. */
export function isBrowserWalletInstalled(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
}

// ─────────────────────────────────────────────────────────
// Local Hardhat Demo Accounts (for local development only)
// NEVER expose real private keys here; only use well-known
// Hardhat default test accounts that have no real funds.
// ─────────────────────────────────────────────────────────
export const HARDHAT_DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    label: 'Consortium Admin (Deployer)',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  },
  {
    role: 'FARMER',
    label: 'Organic Farmer Account',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  },
  {
    role: 'PROCESSOR',
    label: 'Bio-Processing Facility',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  },
  {
    role: 'LABORATORY',
    label: 'Quality Testing Laboratory',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  },
  {
    role: 'DISTRIBUTOR',
    label: 'Logistics & Cold-Chain',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  },
  {
    role: 'RETAILER',
    label: 'Retail Wellness Store',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  },
];
