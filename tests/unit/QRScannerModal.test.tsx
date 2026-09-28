import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QRScannerModal } from '../../src/components/verification/QRScannerModal';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../src/context/BlockchainContext', () => ({
  useBlockchain: () => ({
    products: [
      {
        id: 'BOT-2024-8901',
        name: 'Organic Ashwagandha Root Extract',
        batchId: 'ASH-2024-089',
        status: 'RETAIL_READY',
        verificationState: 'VERIFIED',
      },
      {
        id: 'BOT-2024-9002',
        name: 'Turmeric Curcumin 95%',
        batchId: 'TUR-2024-012',
        status: 'IN_TRANSIT',
        verificationState: 'IN_PROGRESS',
      },
    ],
  }),
}));

describe('QRScannerModal Component Tests', () => {
  let originalMediaDevices: any;

  beforeEach(() => {
    mockNavigate.mockClear();
    originalMediaDevices = navigator.mediaDevices;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices,
    });
    vi.restoreAllMocks();
  });

  it('renders closed modal without throwing', () => {
    const { container } = render(<QRScannerModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal with title, activate camera button, and manual input when open', () => {
    render(<QRScannerModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Scan Botanical QR Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Activate Camera Scanner/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. BOT-2024-8901 or ASH-2024-089/i)).toBeInTheDocument();
    expect(screen.getByText(/Organic Ashwagandha Root Extract/i)).toBeInTheDocument();
  });

  it('prompts user and accesses camera stream when "Activate Camera Scanner" is clicked', async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
    };

    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    });

    render(<QRScannerModal isOpen={true} onClose={vi.fn()} />);

    const activateBtn = screen.getByRole('button', { name: /Activate Camera Scanner/i });
    fireEvent.click(activateBtn);

    // Expect requesting permission message
    expect(screen.getByText(/Camera Permission Requested/i)).toBeInTheDocument();
    expect(screen.getByText(/Requesting camera permission/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      expect(screen.getByText(/Live Camera Active/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Stop Camera/i })).toBeInTheDocument();
    });
  });

  it('displays permission denied alert message when camera access is rejected', async () => {
    const permissionError = new Error('Permission denied');
    permissionError.name = 'NotAllowedError';

    const mockGetUserMedia = vi.fn().mockRejectedValue(permissionError);
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    });

    render(<QRScannerModal isOpen={true} onClose={vi.fn()} />);

    const activateBtn = screen.getByRole('button', { name: /Activate Camera Scanner/i });
    fireEvent.click(activateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Camera Permission Blocked/i)).toBeInTheDocument();
      expect(screen.getByText(/Camera permission was denied/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Camera Permission/i })).toBeInTheDocument();
    });
  });

  it('displays unavailable message when mediaDevices is not supported', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: undefined,
    });

    render(<QRScannerModal isOpen={true} onClose={vi.fn()} />);

    const activateBtn = screen.getByRole('button', { name: /Activate Camera Scanner/i });
    fireEvent.click(activateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Camera Not Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Camera access is not supported on this browser/i)).toBeInTheDocument();
    });
  });

  it('navigates when manual input form is submitted', () => {
    const handleClose = vi.fn();
    render(<QRScannerModal isOpen={true} onClose={handleClose} />);

    const input = screen.getByPlaceholderText(/e.g. BOT-2024-8901/i);
    fireEvent.change(input, { target: { value: 'BOT-2024-9999' } });

    const submitBtn = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(submitBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/verify/BOT-2024-9999');
  });

  it('navigates when demo product item is clicked', () => {
    const handleClose = vi.fn();
    render(<QRScannerModal isOpen={true} onClose={handleClose} />);

    const demoProductBtn = screen.getByText(/Organic Ashwagandha Root Extract/i).closest('button');
    expect(demoProductBtn).toBeTruthy();
    if (demoProductBtn) {
      fireEvent.click(demoProductBtn);
    }

    expect(handleClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/verify/BOT-2024-8901');
  });

  it('stops media stream tracks when Stop Camera is clicked', async () => {
    const mockTrack = { stop: vi.fn() };
    const mockStream = {
      getTracks: () => [mockTrack],
    };

    const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream);
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    });

    render(<QRScannerModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Activate Camera Scanner/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Camera/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Stop Camera/i }));

    expect(mockTrack.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Activate Camera Scanner/i })).toBeInTheDocument();
  });
});
