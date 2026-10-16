import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUploadDropzone } from '../../src/components/common/DocumentUploadDropzone';

describe('DocumentUploadDropzone Component', () => {
  const mockOnIpfsHashChange = vi.fn();
  const mockOnDocumentChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preloaded document state when initial ipfsHash is provided', () => {
    render(
      <DocumentUploadDropzone
        ipfsHash="QmShatavariCert6r01i29zatzpj8com27xbvuto6nq2ns"
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
        sampleDocName="NPOP_Organic_Certificate_2024.pdf"
      />
    );

    expect(screen.getByText('NPOP_Organic_Certificate_2024.pdf')).toBeInTheDocument();
    expect(screen.getByText('PINNED TO IPFS CLUSTER ✓')).toBeInTheDocument();
    expect(screen.getByText(/uploaded securely/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview document/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove document/i })).toBeInTheDocument();
  });

  it('allows removing document to return to empty dropzone', async () => {
    const TestParent = () => {
      const [hash, setHash] = React.useState('QmShatavariCert6r01i29zatzpj8com27xbvuto6nq2ns');
      return (
        <DocumentUploadDropzone
          ipfsHash={hash}
          onIpfsHashChange={(newHash) => {
            setHash(newHash);
            mockOnIpfsHashChange(newHash);
          }}
          onDocumentChange={mockOnDocumentChange}
        />
      );
    };

    render(<TestParent />);

    const removeBtn = screen.getByRole('button', { name: /remove document/i });
    fireEvent.click(removeBtn);

    expect(mockOnIpfsHashChange).toHaveBeenCalledWith('');
    expect(mockOnDocumentChange).toHaveBeenCalledWith(null);
    await waitFor(() => {
      expect(screen.getByText(/drag & drop certificate pdf \/ doc here/i)).toBeInTheDocument();
    });
  });

  it('processes and accepts a real PDF file upload', async () => {
    render(
      <DocumentUploadDropzone
        ipfsHash=""
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
      />
    );

    const file = new File(['%PDF-1.4 mock content'], 'apeda_inspection_cert.pdf', {
      type: 'application/pdf',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnIpfsHashChange).toHaveBeenCalled();
      const generatedCid = mockOnIpfsHashChange.mock.calls[0][0];
      expect(generatedCid).toMatch(/^Qm/);
      expect(screen.getByText('apeda_inspection_cert.pdf')).toBeInTheDocument();
      expect(screen.getByText('PINNED TO IPFS CLUSTER ✓')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('rejects unsupported file extensions with error alert', async () => {
    render(
      <DocumentUploadDropzone
        ipfsHash=""
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
      />
    );

    const maliciousFile = new File(['binary content'], 'trojan.exe', {
      type: 'application/x-msdownload',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [maliciousFile] } });

    await waitFor(() => {
      expect(screen.getByText(/unsupported file format/i)).toBeInTheDocument();
      expect(mockOnIpfsHashChange).not.toHaveBeenCalled();
    });
  });

  it('rejects files exceeding 15MB size limit', async () => {
    render(
      <DocumentUploadDropzone
        ipfsHash=""
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
      />
    );

    // Mock an oversized 16MB file
    const oversizedFile = new File(['content'], 'giant_scan.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(oversizedFile, 'size', { value: 16 * 1024 * 1024 });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file is too large/i)).toBeInTheDocument();
      expect(mockOnIpfsHashChange).not.toHaveBeenCalled();
    });
  });

  it('supports 1-click loading of sample certificate when empty', async () => {
    render(
      <DocumentUploadDropzone
        ipfsHash=""
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
        sampleDocName="Sample_Ayush_Certificate.pdf"
      />
    );

    const loadSampleBtn = screen.getByRole('button', { name: /use sample verified certificate/i });
    fireEvent.click(loadSampleBtn);

    await waitFor(() => {
      expect(mockOnIpfsHashChange).toHaveBeenCalled();
      expect(screen.getByText('Sample_Ayush_Certificate.pdf')).toBeInTheDocument();
      expect(screen.getByText('PINNED TO IPFS CLUSTER ✓')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('opens in-app preview modal when clicking Preview Document and closes on request', async () => {
    render(
      <DocumentUploadDropzone
        ipfsHash="QmShatavariCert6r01i29zatzpj8com27xbvuto6nq2ns"
        onIpfsHashChange={mockOnIpfsHashChange}
        onDocumentChange={mockOnDocumentChange}
        sampleDocName="NPOP_Organic_Certificate_2024.pdf"
      />
    );

    const previewBtn = screen.getByRole('button', { name: /preview document/i });
    fireEvent.click(previewBtn);

    expect(screen.getByText(/Document Preview/i)).toBeInTheDocument();
    expect(screen.getAllByText('NPOP_Organic_Certificate_2024.pdf').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTitle('NPOP_Organic_Certificate_2024.pdf').length).toBeGreaterThanOrEqual(1);

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Document Preview/i)).not.toBeInTheDocument();
    });
  });
});
