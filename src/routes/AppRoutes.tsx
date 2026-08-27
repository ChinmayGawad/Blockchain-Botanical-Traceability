import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

// Root Route Handler: Opens Authentication first when launching the web app
const RootEntryPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role !== 'CONSUMER') {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }
  return <LoginPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Route: Defaults to Authentication First */}
      <Route path="/" element={<RootEntryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Pages */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/verify" element={<VerifyProductPage />} />
      <Route path="/verify/:productId" element={<VerifyProductPage />} />

      {/* Admin Portal (Strictly for ADMIN only) */}
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

      {/* Farmer Portal (Strictly for FARMER only) */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/register"
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <RegisterProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Processor Portal (Strictly for PROCESSOR only) */}
      <Route
        path="/processor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR']}>
            <ProcessorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processor/process"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR']}>
            <ProcessBatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/processor/batches"
        element={
          <ProtectedRoute allowedRoles={['PROCESSOR']}>
            <ProcessorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Laboratory Portal (Strictly for LABORATORY only) */}
      <Route
        path="/laboratory/dashboard"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY']}>
            <LaboratoryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/test"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY']}>
            <TestProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory/reports"
        element={
          <ProtectedRoute allowedRoles={['LABORATORY']}>
            <LaboratoryDashboard />
          </ProtectedRoute>
        }
      />

      {/* Distributor Portal (Strictly for DISTRIBUTOR only) */}
      <Route
        path="/distributor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
            <DistributorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/create-shipment"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
            <CreateShipmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/distributor/shipments"
        element={
          <ProtectedRoute allowedRoles={['DISTRIBUTOR']}>
            <DistributorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Retailer Portal (Strictly for RETAILER only) */}
      <Route
        path="/retailer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['RETAILER']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/inventory"
        element={
          <ProtectedRoute allowedRoles={['RETAILER']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/generate-qr"
        element={
          <ProtectedRoute allowedRoles={['RETAILER']}>
            <GenerateQRPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
