import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustSeal } from '../../src/components/verification/TrustSeal';

describe('TrustSeal Component Unit Tests', () => {
  it('should render Verified banner and batch ID for VERIFIED state', () => {
    render(<TrustSeal state="VERIFIED" batchId="ASH-2024-089" />);
    expect(screen.getByText('100% Cryptographically Verified')).toBeInTheDocument();
    expect(screen.getByText('Authentic Botanical Origin Verified')).toBeInTheDocument();
    expect(screen.getByText('ASH-2024-089')).toBeInTheDocument();
    expect(screen.getByText('Quorum: 5/5 Peers Valid')).toBeInTheDocument();
  });

  it('should render QA Rejection Alert for REJECTED state', () => {
    render(<TrustSeal state="REJECTED" batchId="REJ-2024-999" />);
    expect(screen.getByText('QA Rejection Alert • Smart Contract Locked')).toBeInTheDocument();
    expect(screen.getByText('Quality Verification Failed')).toBeInTheDocument();
    expect(screen.getByText('REJ-2024-999')).toBeInTheDocument();
  });

  it('should render Suspicious / Incomplete banner for SUSPICIOUS state', () => {
    render(<TrustSeal state="SUSPICIOUS" batchId="SUS-2024-111" />);
    expect(screen.getByText('Provenance Incomplete • Audit Pending')).toBeInTheDocument();
    expect(screen.getByText('Suspicious / Unverified Batch')).toBeInTheDocument();
    expect(screen.getByText('SUS-2024-111')).toBeInTheDocument();
  });

  it('should render In Progress banner for IN_PROGRESS state', () => {
    render(<TrustSeal state="IN_PROGRESS" batchId="INP-2024-222" />);
    expect(screen.getByText('Active Supply Chain Journey')).toBeInTheDocument();
    expect(screen.getByText('Botanical Batch In Transit / Testing')).toBeInTheDocument();
    expect(screen.getByText('INP-2024-222')).toBeInTheDocument();
  });
});
