import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QRModal } from '../../src/components/common/QRModal';
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
    ],
  },
  timeline: [],
};

describe('QRModal Component Tests', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders QR Modal with batch information and trust tag', () => {
    render(<QRModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    expect(screen.getByText('Product Verification QR Code')).toBeInTheDocument();
    expect(screen.getByText(/Consumer Trust Tag/i)).toBeInTheDocument();
    expect(screen.getByText('Organic Ashwagandha Root Extract')).toBeInTheDocument();
    expect(screen.getByText('Withania somnifera')).toBeInTheDocument();
    expect(screen.getByText(/Batch: ASH-2024-089/i)).toBeInTheDocument();
  });

  it('copies verification URL when Copy button is clicked', () => {
    render(<QRModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const copyBtn = screen.getByRole('button', { name: /Copy/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/verify/BOT-2024-8901')
    );
  });

  it('triggers onShareReport callback when consumer clicks Share Password-Protected QA Monograph', () => {
    const handleShareReport = vi.fn();
    render(
      <QRModal
        isOpen={true}
        onClose={vi.fn()}
        product={mockProduct}
        onShareReport={handleShareReport}
      />
    );

    const shareReportBtn = screen.getByRole('button', {
      name: /Share Password-Protected CoA Monograph/i,
    });
    expect(shareReportBtn).toBeInTheDocument();
    fireEvent.click(shareReportBtn);

    expect(handleShareReport).toHaveBeenCalledTimes(1);
  });
});
