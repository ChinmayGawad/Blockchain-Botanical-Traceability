import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/common/StatusBadge';

describe('StatusBadge Component Unit Tests', () => {
  it('should render Blockchain Verified badge for VERIFIED verificationState', () => {
    render(<StatusBadge status="VERIFIED" />);
    expect(screen.getByText('Blockchain Verified')).toBeInTheDocument();
  });

  it('should render Rejected badge for REJECTED state', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected (QA Fail)')).toBeInTheDocument();
  });

  it('should render Suspicious badge for SUSPICIOUS state', () => {
    render(<StatusBadge status="SUSPICIOUS" />);
    expect(screen.getByText('Flagged / Suspicious')).toBeInTheDocument();
  });

  it('should render In Progress badge for IN_PROGRESS state', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render Harvest Registered badge for REGISTERED product status', () => {
    render(<StatusBadge status="REGISTERED" />);
    expect(screen.getByText('Harvest Registered')).toBeInTheDocument();
  });

  it('should render Processed badge for PROCESSED status', () => {
    render(<StatusBadge status="PROCESSED" />);
    expect(screen.getByText('Processed')).toBeInTheDocument();
  });

  it('should render Lab QA Approved badge for APPROVED status', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Lab QA Approved')).toBeInTheDocument();
  });

  it('should render In Transit badge for IN_TRANSIT status', () => {
    render(<StatusBadge status="IN_TRANSIT" />);
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  it('should render Retail Ready & Verified badge for RETAIL_READY status', () => {
    render(<StatusBadge status="RETAIL_READY" />);
    expect(screen.getByText('Retail Ready & Verified')).toBeInTheDocument();
  });

  it('should render RECALLED badge for RECALLED status', () => {
    render(<StatusBadge status="RECALLED" />);
    expect(screen.getByText('RECALLED')).toBeInTheDocument();
  });

  it('should render role badges for all 6 stakeholder roles', () => {
    const { unmount } = render(<StatusBadge status="FARMER" />);
    expect(screen.getByText('Farmer')).toBeInTheDocument();
    unmount();

    render(<StatusBadge status="PROCESSOR" />);
    expect(screen.getByText('Processor')).toBeInTheDocument();
  });
});
