import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ShareLabReportModal } from '../../src/components/verification/ShareLabReportModal';
import { BotanicalProduct } from '../../src/types';
import * as pdfGen from '../../src/utils/pdfGenerator';

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
      { name: 'Lead (Pb) ICP-MS', value: '0.05', unit: 'ppm', standardLimit: '< 3.0 ppm', passed: true }
    ],
  },
  timeline: [],
};

describe('ShareLabReportModal Component Tests', () => {
  let originalClipboard: any;
  let originalShare: any;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    originalShare = navigator.share;

    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: originalClipboard,
    });
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: originalShare,
    });
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ShareLabReportModal isOpen={false} onClose={vi.fn()} product={mockProduct} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, product info, and password protection section when open', () => {
    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    expect(screen.getByText('Share Laboratory QA Report')).toBeInTheDocument();
    expect(screen.getByText('Organic Ashwagandha Root Extract')).toBeInTheDocument();
    expect(screen.getByText('Eurofins AgriBio Analytics Lab • Tested on 2024-03-20')).toBeInTheDocument();
    expect(screen.getByText('PDF Password Protection')).toBeInTheDocument();
    expect(screen.getByText('128-Bit Encryption')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Encrypted PDF/i })).toBeInTheDocument();
  });

  it('allows customizing and toggling the PDF password visibility', () => {
    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const passwordInput = screen.getByPlaceholderText('Enter PDF password...') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.type).toBe('password');
    expect(passwordInput.value).toBe('ASH-2024-089');

    // Change password value
    fireEvent.change(passwordInput, { target: { value: 'SecretKey#2025' } });
    expect(passwordInput.value).toBe('SecretKey#2025');

    // Toggle visibility
    const showButton = screen.getByTitle('Show passcode');
    fireEvent.click(showButton);
    expect(passwordInput.type).toBe('text');

    const hideButton = screen.getByTitle('Hide passcode');
    fireEvent.click(hideButton);
    expect(passwordInput.type).toBe('password');
  });

  it('copies passcode to clipboard when Copy Passcode button is clicked', async () => {
    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const copyPassBtn = screen.getByTitle('Copy passcode to clipboard');
    fireEvent.click(copyPassBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ASH-2024-089');
    await waitFor(() => {
      expect(screen.getByText('Passcode copied to clipboard!')).toBeInTheDocument();
    });
  });

  it('copies verification URL when Copy Verification URL button is clicked', async () => {
    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const copyUrlBtn = screen.getByRole('button', { name: /Copy Verification URL/i });
    fireEvent.click(copyUrlBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/verify/BOT-2024-8901')
    );
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('copies full monograph text when Copy Monograph Text is clicked', async () => {
    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const copySummaryBtn = screen.getByRole('button', { name: /Copy Monograph Text/i });
    fireEvent.click(copySummaryBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('FloraChain Botanical QA Certificate of Analysis')
    );
  });

  it('invokes downloadProtectedPdf when Download Encrypted PDF is clicked', () => {
    const downloadSpy = vi.spyOn(pdfGen, 'downloadProtectedPdf').mockImplementation(() => {});

    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const downloadBtn = screen.getByRole('button', { name: /Download Encrypted PDF/i });
    fireEvent.click(downloadBtn);

    expect(downloadSpy).toHaveBeenCalledWith(mockProduct, 'ASH-2024-089');
  });

  it('triggers native Web Share API when supported', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: mockShare,
    });

    render(<ShareLabReportModal isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    const shareBtn = screen.getByRole('button', { name: /Mobile Share Sheet/i });
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('FloraChain Lab QA Monograph'),
        url: expect.stringContaining('/verify/BOT-2024-8901'),
      })
    );
  });
});
