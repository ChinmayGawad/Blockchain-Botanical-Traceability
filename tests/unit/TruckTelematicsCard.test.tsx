import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TruckTelematicsCard } from '../../src/components/map/TruckTelematicsCard';

describe('TruckTelematicsCard Component Unit Tests', () => {
  const mockTelematicsData = {
    batchId: 'ASH-2024-089',
    productName: 'Pure Organic Ashwagandha Root Powder',
    vehicleNumber: 'MH-12-CY-8821',
    driverName: 'Vikramjit Singh',
    transportType: 'Cold-Chain Refrigerated Van',
    currentSpeedKmH: 58,
    temperatureC: 18.2,
    targetTempRange: { min: 15.0, max: 25.0 },
    humidityPercent: 52,
    locationName: 'JNPT Freight Corridor, Navi Mumbai',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    currentLeg: 'Leg 4: Processing to Transit',
    progressPercent: 68,
    eta: '17 mins to next checkpoint',
    txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    blockNumber: 10530,
    sealIntegrity: 'SECURE' as 'SECURE' | 'TAMPERED' | 'CHECKING',
    lastTelemetryPing: new Date().toISOString(),
    temperatureHistory: [18.0, 18.1, 18.2, 18.1, 18.3]
  };

  it('should render light theme by default', () => {
    render(
      <TruckTelematicsCard
        data={mockTelematicsData}
        onClose={() => {}}
      />
    );

    // Check that the card has light theme classes
    expect(screen.getByRole('dialog')).toHaveClass(/bg-\[var\(--background\)\]\/95/);
    expect(screen.getByText('IoT Cold-Chain Telematics')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('MH-12-CY-8821')).toBeInTheDocument();
    expect(screen.getByText('ASH-2024-089')).toBeInTheDocument();
    expect(screen.getByText('18.2°C')).toBeInTheDocument();
    expect(screen.getByText('OPTIMAL')).toBeInTheDocument(); // Temperature should be optimal
  });

  it('should render dark theme when specified', () => {
    render(
      <TruckTelematicsCard
        data={mockTelematicsData}
        onClose={() => {}}
        theme="dark"
      />
    );

    // Check that the card has dark theme classes
    expect(screen.getByRole('dialog')).toHaveClass(/bg-\[#022C22\]\/95/);
    expect(screen.getByText('IoT Cold-Chain Telematics')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should render temperature alert when outside optimal range', () => {
    const alertData = {
      ...mockTelematicsData,
      temperatureC: 30.0, // Above optimal range
    };

    render(
      <TruckTelematicsCard
        data={alertData}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('ALERT')).toBeInTheDocument();
    expect(screen.getByText('30.0°C')).toBeInTheDocument();
  });

  it('should render temperature stability sparkline when history is provided', () => {
    render(
      <TruckTelematicsCard
        data={mockTelematicsData}
        onClose={() => {}}
      />
    );

    // Check that sparkline SVG is present
    expect(screen.getByRole('img', { name: /temperature stability/i })).toBeInTheDocument();
    expect(screen.getByText('Temperature Stability')).toBeInTheDocument();
  });

  it('should show message when no temperature history is available', () => {
    const noHistoryData = {
      ...mockTelematicsData,
      temperatureHistory: undefined
    };

    render(
      <TruckTelematicsCard
        data={noHistoryData}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Temperature history not available')).toBeInTheDocument();
  });

  it('should close modal when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <TruckTelematicsCard
        data={mockTelematicsData}
        onClose={handleClose}
      />
    );

    // Simulate Escape key press
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TruckTelematicsCard
        data={mockTelematicsData}
        onClose={handleClose}
      />
    );

    // Find and click the close button
    const closeButton = screen.getByLabelText('Close telemetry card');
    expect(closeButton).toBeInTheDocument();
    closeButton.click();
    expect(handleClose).toHaveBeenCalled();
  });
});