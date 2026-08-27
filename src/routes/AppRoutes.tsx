import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

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

      {/* Admin Portal (Protected: ADMIN only) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserApprovalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/explorer"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'CONSUMER', 'FARMER', 'PROCESSOR', 'LABORATORY', 'DISTRIBUTOR', 'RETAILER']}>
            <BlockchainExplorerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SuspiciousReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Farmer Portal (Protected: FARMER or ADMIN) */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/register"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <RegisterProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Processor Portal (Protected: PROCESSOR or ADMIN) */}
      <Route
        path="/processor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR', 'ADMIN']}>
            <ProcessorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processor/process"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR', 'ADMIN']}>
            <ProcessBatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processor/batches"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR', 'ADMIN']}>
            <ProcessorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Laboratory Portal (Protected: LABORATORY or ADMIN) */}
      <Route
        path="/laboratory/dashboard"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY', 'ADMIN']}>
            <LaboratoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/test"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY', 'ADMIN']}>
            <TestProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/reports"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY', 'ADMIN']}>
            <LaboratoryDashboard />
          </ProtectedRoute>
        }
      />

      {/* Distributor Portal (Protected: DISTRIBUTOR or ADMIN) */}
      <Route
        path="/distributor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR', 'ADMIN']}>
            <DistributorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/create-shipment"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR', 'ADMIN']}>
            <CreateShipmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/shipments"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR', 'ADMIN']}>
            <DistributorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Retailer Portal (Protected: RETAILER or ADMIN) */}
      <Route
        path="/retailer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/inventory"
        element={
          <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/generate-qr"
        element={
          <ProtectedRoute allowedRoles={['RETAILER', 'ADMIN']}>
            <GenerateQRPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
