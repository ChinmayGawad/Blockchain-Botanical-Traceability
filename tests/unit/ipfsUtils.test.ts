import { describe, it, expect } from 'vitest';
import { generateMockIpfsCid, isValidIpfsCid, getIpfsGatewayUrl, formatShortCid } from '../../src/utils/ipfsUtils';

describe('ipfsUtils', () => {
  it('generates valid mock CIDs with customizable prefix', () => {
    const cidDefault = generateMockIpfsCid();
    expect(cidDefault.startsWith('QmBotanicalDoc')).toBe(true);
    expect(isValidIpfsCid(cidDefault)).toBe(true);

    const cidCustom = generateMockIpfsCid('LabReport');
    expect(cidCustom.startsWith('QmLabReport')).toBe(true);
    expect(isValidIpfsCid(cidCustom)).toBe(true);
  });

  it('validates CIDs correctly', () => {
    // Valid mock
    expect(isValidIpfsCid('QmTestHash1234567890')).toBe(true);
    // Invalid CIDs
    expect(isValidIpfsCid('')).toBe(false);
    expect(isValidIpfsCid('not-a-cid')).toBe(false);
    expect(isValidIpfsCid(null as any)).toBe(false);
    expect(isValidIpfsCid(undefined as any)).toBe(false);
  });

  it('generates gateway URLs properly', () => {
    const cid = 'QmShatavariCert12345';
    expect(getIpfsGatewayUrl(cid)).toBe('https://ipfs.io/ipfs/QmShatavariCert12345');
    expect(getIpfsGatewayUrl(cid, 'https://gateway.pinata.cloud/ipfs')).toBe(
      'https://gateway.pinata.cloud/ipfs/QmShatavariCert12345'
    );
    expect(getIpfsGatewayUrl('')).toBe('');
  });

  it('formats short CIDs cleanly', () => {
    const cid = 'QmShatavariOrganicCertificate2024VerifiableLedgerHash123';
    expect(formatShortCid(cid, 6, 4)).toBe('QmShat...h123');
    expect(formatShortCid('Qm123', 6, 4)).toBe('Qm123');
    expect(formatShortCid(null)).toBe('');
  });
});
