import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SupplyChainJourneyMap } from '../../src/components/map/SupplyChainJourneyMap';

describe('SupplyChainJourneyMap Component Unit Tests', () => {
  const mockBatchId = 'ASH-2024-089';
  const mockProductName = 'Pure Organic Ashwagandha Root Powder';
  const mockBotanicalName = 'Withania somnifera';

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with light theme by default', () => {
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Check that the map container has light theme classes
    expect(screen.getByRole('region')).toHaveClass(/bg-white/);
    expect(screen.getByText('Live Provenance Journey')).toBeInTheDocument();
    expect(screen.getByText(`${mockProductName}`)).toBeInTheDocument();
    expect(screen.getByText(`${mockBatchId}`)).toBeInTheDocument();
  });

  it('should render with dark theme when specified', () => {
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
        theme="dark"
      />
    );

    // Check that the map container has dark theme classes
    expect(screen.getByRole('region')).toHaveClass(/bg-slate-950/);
    expect(screen.getByText('Live Provenance Journey')).toBeInTheDocument();
  });

  it('should auto-detect theme based on system preferences', () => {
    // Mock window.matchMedia to return dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
        theme="auto"
      />
    );

    // Should render dark theme based on mocked preference
    expect(screen.getByRole('region')).toHaveClass(/bg-slate-950/);
  });

  it('should display truck animation controls', () => {
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Check for playback controls
    expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/play transit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/replay from farm origin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle playback speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jump to previous checkpoint/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jump to next checkpoint/i)).toBeInTheDocument();
  });

  it('should display temperature pill button', () => {
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Check for temperature pill button
    expect(screen.getByTitle(/click to inspect real-time iot cargo telematics/i)).toBeInTheDocument();
    expect(screen.getByText(/cargo:/i)).toBeInTheDocument();
    expect(screen.getByText(/°c/i)).toBeInTheDocument();
  });

  it('should open telematics modal when truck is clicked', () => {
    const handleClose = vi.fn();
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Find and click the truck (should open telematics modal)
    const truckElement = screen.getByLabelText(/click truck to inspect live iot telematics/i);
    expect(truckElement).toBeInTheDocument();
    truckElement.click();

    // Check that telematics modal is open
    expect(screen.getByText(/iot cold-chain telematics/i)).toBeInTheDocument();
  });

  it('should open milestone modal when facility is clicked', () => {
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Find and click a facility (first stage)
    const facilityElement = screen.getByLabelText(/inspect farm harvest origin facility/i);
    expect(facilityElement).toBeInTheDocument();
    facilityElement.click();

    // Check that milestone modal is open
    expect(screen.getByText(/checkpoint 1 audit/i)).toBeInTheDocument();
    expect(screen.getByText(/vedic agro organic cooperative/i)).toBeInTheDocument();
  });

  it('should close modals when escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <SupplyChainJourneyMap
        batchId={mockBatchId}
        productName={mockProductName}
        botanicalName={mockBotanicalName}
      />
    );

    // Open telematics modal first
    const truckElement = screen.getByLabelText(/click truck to inspect live iot telematics/i);
    truckElement.click();
    expect(screen.getByText(/iot cold-chain telematics/i)).toBeInTheDocument();

    // Press Escape key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    // Should close the telematics modal
    expect(screen.queryByText(/iot cold-chain telematics/i)).not.toBeInTheDocument();
  });

  it('should support different botanical crops', () => {
    // Test with Turmeric batch
    render(
      <SupplyChainJourneyMap
        batchId="TUR-2024-102"
        productName="Lakadong High-Curcumin Turmeric"
        botanicalName="Curcuma longa"
      />
    );

    expect(screen.getByText(/lakadong high-curcumin turmeric/i)).toBeInTheDocument();
    expect(screen.getByText(/curcuma longa/i)).toBeInTheDocument();

    // Test with Tulsi batch
    render(
      <SupplyChainJourneyMap
        batchId="TUL-2024-033"
        productName="Biodynamic Krishna Tulsi Leaves"
        botanicalName="Ocimum sanctum"
      />
    );

    expect(screen.getByText(/biodynamic krishna tulsi leaves/i)).toBeInTheDocument();
    expect(screen.getByText(/ocimum sanctum/i)).toBeInTheDocument();
  });
});