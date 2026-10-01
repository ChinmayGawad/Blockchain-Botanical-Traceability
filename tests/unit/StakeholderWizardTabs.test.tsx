import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProcessBatchPage } from '../../src/pages/processor/ProcessBatchPage';
import { TestProductPage } from '../../src/pages/laboratory/TestProductPage';
import { CreateShipmentPage } from '../../src/pages/distributor/CreateShipmentPage';
import { BotanicalProduct } from '../../src/types';

const mockProduct: BotanicalProduct = {
  id: 'PROD-001',
  batchId: 'BATCH-101',
  name: 'Organic Shatavari',
  botanicalName: 'Asparagus racemosus',
  category: 'MEDICINAL_HERB',
  cultivationMethod: 'ORGANIC',
  quantityKg: 300,
  harvestDate: '2024-03-01',
  farmLocation: 'Neemuch, MP',
  gpsCoordinates: { lat: 24.47, lng: 74.88 },
  farmerId: 'USR-FRM-01',
  farmerName: 'Rajesh Kumar',
  farmerOrg: 'Vedic Farms',
  description: 'Test harvest',
  activeCompounds: ['Saponins'],
  certificates: [],
  status: 'REGISTERED',
  verificationState: 'IN_PROGRESS',
  qrCodeValue: 'MOCK-QR-001',
  timeline: [],
  blockchainTransactions: [],
  createdTimestamp: '2024-03-01T00:00:00Z',
};

const mockApprovedProduct: BotanicalProduct = {
  ...mockProduct,
  id: 'PROD-002',
  batchId: 'BATCH-102',
  status: 'APPROVED',
};

const mockProcessedProduct: BotanicalProduct = {
  ...mockProduct,
  id: 'PROD-003',
  batchId: 'BATCH-103',
  status: 'PROCESSED',
};

// Mock Auth
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      id: 'USR-TEST-01',
      name: 'Test Stakeholder',
      email: 'test@florachain.org',
      role: 'PROCESSOR',
      organization: 'PhytoExtracts',
      status: 'VERIFIED',
    },
    role: 'PROCESSOR',
  }),
}));

// Mock Blockchain
vi.mock('../../src/context/BlockchainContext', () => ({
  useBlockchain: () => ({
    products: [mockProduct, mockApprovedProduct, mockProcessedProduct],
    processBatch: vi.fn(),
    submitLabResult: vi.fn(),
    createShipment: vi.fn(),
    getProductById: (id: string) => {
      if (id === 'PROD-002') return mockApprovedProduct;
      if (id === 'PROD-003') return mockProcessedProduct;
      return mockProduct;
    },
  }),
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('Processor ProcessBatchPage Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProcessorPage = () => {
    return render(
      <BrowserRouter>
        <ProcessBatchPage />
      </BrowserRouter>
    );
  };

  it('renders all 5 processor navigation tabs', () => {
    renderProcessorPage();

    expect(screen.getByRole('tab', { name: /batch intake/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /method & facility/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /mass & yield/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sop & ipfs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /review & sign/i })).toBeInTheDocument();
  });

  it('allows clicking forward to step 2 when step 1 has selected product', () => {
    renderProcessorPage();

    const facilityTab = screen.getByRole('tab', { name: /method & facility/i });
    fireEvent.click(facilityTab);

    expect(screen.getByText('Step 2: Bio-Refining & Facility Details')).toBeInTheDocument();
    expect(facilityTab).toHaveAttribute('aria-selected', 'true');
  });

  it('allows jumping back from Step 2 to Step 1 directly', () => {
    renderProcessorPage();

    // Go to step 2
    const facilityTab = screen.getByRole('tab', { name: /method & facility/i });
    fireEvent.click(facilityTab);
    expect(screen.getByText('Step 2: Bio-Refining & Facility Details')).toBeInTheDocument();

    // Click back to step 1
    const intakeTab = screen.getByRole('tab', { name: /batch intake/i });
    fireEvent.click(intakeTab);
    expect(screen.getByText('Step 1: Raw Harvest Batch Intake')).toBeInTheDocument();
  });

  it('blocks jumping forward from Step 2 to Step 3 if Step 2 method is cleared', () => {
    renderProcessorPage();

    // Go to step 2
    const facilityTab = screen.getByRole('tab', { name: /method & facility/i });
    fireEvent.click(facilityTab);

    // Clear method
    const methodInput = screen.getByDisplayValue(/Cryogenic Milling/i);
    fireEvent.change(methodInput, { target: { value: '' } });

    // Try to click Step 3 tab
    const massTab = screen.getByRole('tab', { name: /mass & yield/i });
    fireEvent.click(massTab);

    // Should remain on Step 2 and show validation error
    expect(screen.getByText('Step 2: Bio-Refining & Facility Details')).toBeInTheDocument();
    expect(screen.getByText(/please complete step 2/i)).toBeInTheDocument();
  });
});

describe('Laboratory TestProductPage Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLabPage = () => {
    return render(
      <BrowserRouter>
        <TestProductPage />
      </BrowserRouter>
    );
  };

  it('renders all 5 laboratory navigation tabs', () => {
    renderLabPage();

    expect(screen.getByRole('tab', { name: /batch intake/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /assay specs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /safety screen/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign-off & ipfs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ledger decision/i })).toBeInTheDocument();
  });

  it('allows moving forward and jumping back directly', () => {
    renderLabPage();

    const assayTab = screen.getByRole('tab', { name: /assay specs/i });
    fireEvent.click(assayTab);
    expect(screen.getByText('Step 2: Phytochemical Potency & Moisture Assay')).toBeInTheDocument();

    const intakeTab = screen.getByRole('tab', { name: /batch intake/i });
    fireEvent.click(intakeTab);
    expect(screen.getByText('Step 1: Botanical Batch Inspection Target')).toBeInTheDocument();
  });
});

describe('Distributor CreateShipmentPage Tab Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDistributorPage = () => {
    return render(
      <BrowserRouter>
        <CreateShipmentPage />
      </BrowserRouter>
    );
  };

  it('renders all 5 distributor navigation tabs', () => {
    renderDistributorPage();

    expect(screen.getByRole('tab', { name: /batch intake/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /route hubs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fleet & cold-chain/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /schedule & manifest/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /review & dispatch/i })).toBeInTheDocument();
  });

  it('blocks jumping forward from Step 2 to Step 3 if route is empty', () => {
    renderDistributorPage();

    // Go to step 2
    const routeTab = screen.getByRole('tab', { name: /route hubs/i });
    fireEvent.click(routeTab);
    expect(screen.getByText('Step 2: Logistics Route Origin & Destination')).toBeInTheDocument();

    // Clear origin
    const originInput = screen.getByDisplayValue(/Bangalore Central/i);
    fireEvent.change(originInput, { target: { value: '' } });

    // Try to jump to step 3
    const fleetTab = screen.getByRole('tab', { name: /fleet & cold-chain/i });
    fireEvent.click(fleetTab);

    // Should remain on Step 2 with validation alert
    expect(screen.getByText('Step 2: Logistics Route Origin & Destination')).toBeInTheDocument();
    expect(screen.getByText(/please complete step 2/i)).toBeInTheDocument();
  });
});
