/**
 * IPFS Utility functions for decentralized content addressing in botanical traceability.
 * Provides CID formatting, validation, gateway URLs, and mock CID generation.
 */

// Basic regular expression for IPFS CIDv0 (Qm... 46 chars base58) and CIDv1 (bafy... base32)
// Also supports domain-specific demo mock prefixes (e.g. QmShatavariCert..., QmProcLog..., QmLabReport...)
const IPFS_CID_V0_REGEX = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const IPFS_CID_V1_REGEX = /^bafy[a-z0-9]{55,}$/i;
const MOCK_CID_REGEX = /^Qm[A-Za-z0-9_-]{10,60}$/;

/**
 * Validates whether a given string adheres to IPFS CID format (or mock CID format).
 */
export function isValidIpfsCid(cid: string | null | undefined): boolean {
  if (!cid || typeof cid !== 'string') return false;
  const trimmed = cid.trim();
  return IPFS_CID_V0_REGEX.test(trimmed) || IPFS_CID_V1_REGEX.test(trimmed) || MOCK_CID_REGEX.test(trimmed);
}

/**
 * Generates a mock IPFS CID for offline / local-test pinning simulations.
 * Generates format: `Qm<Prefix><AlphanumericHash>`
 */
export function generateMockIpfsCid(prefix: string = 'BotanicalDoc'): string {
  // Clean prefix to only alphanumeric characters
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9]/g, '');
  const entropy = Array.from({ length: 4 }, () => Math.random().toString(36).substring(2, 10)).join('');
  const combined = `Qm${cleanPrefix}${entropy}`.substring(0, 46);
  return combined;
}

/**
 * Returns public IPFS gateway URL for a given CID.
 */
export function getIpfsGatewayUrl(cid: string, gateway: string = 'https://ipfs.io/ipfs/'): string {
  if (!cid) return '';
  const trimmed = cid.trim();
  return `${gateway.replace(/\/+$/, '')}/${trimmed}`;
}

/**
 * Formats a long IPFS CID for compact display (e.g. "QmXyZ1...89Ab").
 */
export function formatShortCid(cid: string | null | undefined, prefixLen = 6, suffixLen = 4): string {
  if (!cid) return '';
  const trimmed = cid.trim();
  if (trimmed.length <= prefixLen + suffixLen + 3) return trimmed;
  return `${trimmed.slice(0, prefixLen)}...${trimmed.slice(-suffixLen)}`;
}
