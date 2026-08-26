import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { VerifyProductPage } from '../pages/public/VerifyProductPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserApprovalsPage } from '../pages/admin/UserApprovalsPage';
import { BlockchainExplorerPage } from '../pages/admin/BlockchainExplorerPage';
import { SuspiciousReportsPage } from '../pages/admin/SuspiciousReportsPage';

// Farmer Pages
import { FarmerDashboard } from '../pages/farmer/FarmerDashboard';
import { RegisterProductPage } from '../pages/farmer/RegisterProductPage';

// Processor Pages
import { ProcessorDashboard } from '../pages/processor/ProcessorDashboard';
import { ProcessBatchPage } from '../pages/processor/ProcessBatchPage';

// Laboratory Pages
import { LaboratoryDashboard } from '../pages/laboratory/LaboratoryDashboard';
import { TestProductPage } from '../pages/laboratory/TestProductPage';

// Distributor Pages
import { DistributorDashboard } from '../pages/distributor/DistributorDashboard';
import { CreateShipmentPage } from '../pages/distributor/CreateShipmentPage';

// Retailer Pages
import { RetailerDashboard } from '../pages/retailer/RetailerDashboard';
import { GenerateQRPage } from '../pages/retailer/GenerateQRPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public / Consumer Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/verify" element={<VerifyProductPage />} />
      <Route path="/verify/:productId" element={<VerifyProductPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Portal */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/approvals" element={<UserApprovalsPage />} />
      <Route path="/admin/products" element={<AdminDashboard />} />
      <Route path="/admin/explorer" element={<BlockchainExplorerPage />} />
      <Route path="/admin/reports" element={<SuspiciousReportsPage />} />

      {/* Farmer Portal */}
      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/register" element={<RegisterProductPage />} />
      <Route path="/farmer/products" element={<FarmerDashboard />} />

      {/* Processor Portal */}
      <Route path="/processor/dashboard" element={<ProcessorDashboard />} />
      <Route path="/processor/process" element={<ProcessBatchPage />} />
      <Route path="/processor/batches" element={<ProcessorDashboard />} />

      {/* Laboratory Portal */}
      <Route path="/laboratory/dashboard" element={<LaboratoryDashboard />} />
      <Route path="/laboratory/test" element={<TestProductPage />} />
      <Route path="/laboratory/reports" element={<LaboratoryDashboard />} />

      {/* Distributor Portal */}
      <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
      <Route path="/distributor/create-shipment" element={<CreateShipmentPage />} />
      <Route path="/distributor/shipments" element={<DistributorDashboard />} />

      {/* Retailer Portal */}
      <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
      <Route path="/retailer/inventory" element={<RetailerDashboard />} />
      <Route path="/retailer/generate-qr" element={<GenerateQRPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
