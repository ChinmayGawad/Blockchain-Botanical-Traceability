import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateLaboratoryPdfBytes, generateProtectedPdfBlob, downloadProtectedPdf } from '../../src/utils/pdfGenerator';
import { BotanicalProduct } from '../../src/types';

const mockProduct: BotanicalProduct = {
  id: 'BOT-2024-8901',
  batchId: 'ASH-2024-089',
  name: 'Organic Ashwagandha Root Extract',
  botanicalName: 'Withania somnifera',
  category: 'EXTRACT',
  quantityKg: 250,
  harvestDate: '2024-03-15',
  farmLocation: 'Uttarakhand, India',
  gpsCoordinates: { lat: 30.3165, lng: 78.0322 },
  farmerId: 'FARM-01',
  farmerName: 'Devraj Rawat',
  farmerOrg: 'Himalayan Organic Herbals',
  status: 'RETAIL_READY',
  verificationState: 'VERIFIED',
  cultivationMethod: 'ORGANIC',
  qrCodeValue: 'https://florachain.app/verify/BOT-2024-8901',
  certificates: [],
  blockchainTransactions: [],
  createdTimestamp: '2024-03-15T00:00:00Z',
  description: 'Pure certified organic ashwagandha extract',
  labReport: {
    labName: 'Eurofins AgriBio Analytics Lab',
    labId: 'LAB-EU-01',
    testedBy: 'Dr. Ananya Sharma',
    testDate: '2024-03-20',
    purityPercentage: 99.2,
    moisturePercentage: 4.5,
    heavyMetalsStatus: 'PASS',
    microbialTestStatus: 'PASS',
    pesticideResidueStatus: 'PASS',
    overallResult: 'APPROVED',
    notes: 'Meets monograph standards',
    certificateIpfsCid: 'QmTestIpfsCertificateHash123456789',
    txHash: '0x9b7c8e9b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    parameters: [
      { name: 'Withanolide Content (HPLC)', value: '5.8', unit: '%', standardLimit: '>= 2.5%', passed: true },
      { name: 'Lead (Pb) ICP-MS', value: '0.05', unit: 'ppm', standardLimit: '< 3.0 ppm', passed: true },
      { name: 'Total Aerobic Microbial', value: '450', unit: 'CFU/g', standardLimit: '< 10000 CFU/g', passed: true }
    ],
  },
  timeline: [],
};

describe('PDF Generator & Encryption Unit Tests', () => {
  it('generates standard unencrypted PDF bytes when no password is provided', () => {
    const bytes = generateLaboratoryPdfBytes(mockProduct);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(500);

    const pdfString = new TextDecoder('latin1').decode(bytes);
    expect(pdfString).toContain('%PDF-1.4');
    expect(pdfString).toContain('FLORACHAIN BOTANICAL CERTIFICATE OF ANALYSIS');
    expect(pdfString).toContain('ASH-2024-089');
    expect(pdfString).toContain('Eurofins AgriBio Analytics Lab');
    expect(pdfString).toContain('%%EOF');
  });

  it('generates password-protected encrypted PDF bytes when password is provided', () => {
    const password = 'BotanicalSecret2025!';
    const bytes = generateLaboratoryPdfBytes(mockProduct, password);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(500);

    const pdfString = new TextDecoder('latin1').decode(bytes);
    expect(pdfString).toContain('%PDF-1.4');
    // Checks for standard PDF 128-bit encryption dictionary entries
    expect(pdfString).toContain('/Filter /Standard');
    expect(pdfString).toContain('/V 2');
    expect(pdfString).toContain('/R 3');
    expect(pdfString).toContain('/Length 128');
    expect(pdfString).toContain('/Encrypt 8 0 R');
    expect(pdfString).toContain('%%EOF');
  });

  it('generates PDF Blob of type application/pdf', () => {
    const blob = generateProtectedPdfBlob(mockProduct, 'Pass123');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(500);
  });

  it('executes downloadProtectedPdf without error and triggers browser download', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:mock-url-12345');
    URL.revokeObjectURL = vi.fn();

    downloadProtectedPdf(mockProduct, 'Pass123');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url-12345');

    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });
});
