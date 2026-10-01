import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterProductPage } from '../../src/pages/farmer/RegisterProductPage';

// Mock contexts
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 'USR-FRM-01',
      name: 'Rajesh Kumar',
      email: 'rajesh@vedicfarms.org',
      role: 'FARMER',
      organization: 'Vedic Agro Organic Cooperative',
      status: 'VERIFIED',
    },
    role: 'FARMER',
  }),
}));

vi.mock('../../src/context/BlockchainContext', () => ({
  useBlockchain: () => ({
    registerProduct: vi.fn(),
  }),
}));

// Mock LocalPartnerSelector to avoid mapbox rendering in jsdom
vi.mock('../../src/components/map/LocalPartnerSelector', () => ({
  LocalPartnerSelector: () => <div data-testid="mock-partner-selector">Mock Partner Selector</div>,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('RegisterProductPage Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <RegisterProductPage />
      </BrowserRouter>
    );
  };

  it('renders all 5 navigation tabs with icons and labels', () => {
    renderComponent();

    // Check tabs
    expect(screen.getByRole('tab', { name: /crop specs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /farm & gps/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /local partners/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /certificates/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /commit on-chain/i })).toBeInTheDocument();

    // Direct tab navigation guidance hint
    expect(screen.getByText(/click previous tabs to edit/i)).toBeInTheDocument();
  });

  it('starts on Step 1 (Botanical Information) by default', () => {
    renderComponent();

    expect(screen.getByText('Step 1: Botanical Information')).toBeInTheDocument();
    const tab1 = screen.getByRole('tab', { name: /crop specs/i });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  it('allows jumping forward when current step is filled', () => {
    renderComponent();

    // Initial state has Step 1 filled
    const certsTab = screen.getByRole('tab', { name: /certificates/i });
    fireEvent.click(certsTab);

    // Should now be on Step 4
    expect(screen.getByText('Step 4: Certificates & IPFS Storage')).toBeInTheDocument();
    expect(certsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Step 4 of 5')).toBeInTheDocument();
  });

  it('prevents jumping forward if current step has required fields missing', () => {
    renderComponent();

    // Clear required name on Step 1
    const nameInput = screen.getByPlaceholderText('e.g. Pure Organic Ashwagandha Root');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to click Step 2 tab
    const farmTab = screen.getByRole('tab', { name: /farm & gps/i });
    fireEvent.click(farmTab);

    // Should STILL be on Step 1 and display validation error
    expect(screen.getByText('Step 1: Botanical Information')).toBeInTheDocument();
    expect(screen.getByText(/please complete step 1/i)).toBeInTheDocument();
  });

  it('allows jumping directly back to Step 1 from Step 4 by clicking on Step 1 tab without pressing Back repeatedly', () => {
    renderComponent();

    // Navigate to step 4
    const certsTab = screen.getByRole('tab', { name: /certificates/i });
    fireEvent.click(certsTab);
    expect(screen.getByText('Step 4: Certificates & IPFS Storage')).toBeInTheDocument();

    // Click back to step 1 directly
    const cropSpecsTab = screen.getByRole('tab', { name: /crop specs/i });
    fireEvent.click(cropSpecsTab);

    // Should be back on Step 1 directly
    expect(screen.getByText('Step 1: Botanical Information')).toBeInTheDocument();
    expect(cropSpecsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('prevents jumping forward from Step 2 to Step 3 if Step 2 is incomplete', () => {
    renderComponent();

    // Go to Step 2
    const farmTab = screen.getByRole('tab', { name: /farm & gps/i });
    fireEvent.click(farmTab);
    expect(screen.getByText('Step 2: Farm Location & Soil Telemetry')).toBeInTheDocument();

    // Clear location in Step 2
    const locationInput = screen.getByDisplayValue('Vedic Farms Sector 8, Neemuch, Madhya Pradesh, India');
    fireEvent.change(locationInput, { target: { value: '' } });

    // Try to click Step 3
    const partnersTab = screen.getByRole('tab', { name: /local partners/i });
    fireEvent.click(partnersTab);

    // Should still be on Step 2 and show error
    expect(screen.getByText('Step 2: Farm Location & Soil Telemetry')).toBeInTheDocument();
    expect(screen.getByText(/please complete step 2/i)).toBeInTheDocument();

    // But clicking back to Step 1 IS allowed!
    const cropSpecsTab = screen.getByRole('tab', { name: /crop specs/i });
    fireEvent.click(cropSpecsTab);
    expect(screen.getByText('Step 1: Botanical Information')).toBeInTheDocument();
  });
});
