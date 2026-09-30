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

// Fleet Command & Animated Journey Map Pages (Option 3 & Showcase)
import { DemoFleetCommandPage } from '../pages/demo/DemoFleetCommandPage';
import { DemoVerificationHeroPage } from '../pages/demo/DemoVerificationHeroPage';
import { DemoShowcaseHubPage } from '../pages/demo/DemoShowcaseHubPage';

// Root Route Handler: Opens Authentication first when launching the web app
const RootEntryPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role !== 'CONSUMER') {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
};

import { motion } from 'framer-motion';

// Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex-1 flex flex-col w-full h-full"
  >
    {children}
  </motion.div>
);

export const AppRoutes: React.FC<{ location?: any }> = ({ location }) => {
  return (
    <Routes location={location} key={location?.pathname}>
      {/* Root Route: Defaults to Authentication First */}
      <Route path="/" element={<PageTransition><RootEntryPage /></PageTransition>} />
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

      {/* Public Pages */}
      <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
      <Route path="/verify" element={<PageTransition><VerifyProductPage /></PageTransition>} />
      <Route path="/verify/:productId" element={<PageTransition><VerifyProductPage /></PageTransition>} />

      {/* Fleet Command & Interactive Journey Map (Option 3) */}
      <Route path="/fleet-map" element={<PageTransition><DemoFleetCommandPage /></PageTransition>} />
      <Route path="/demo/fleet-map" element={<PageTransition><DemoFleetCommandPage /></PageTransition>} />
      <Route path="/demo/verify-map" element={<PageTransition><DemoVerificationHeroPage /></PageTransition>} />
      <Route path="/demo/verify-map/:productId" element={<PageTransition><DemoVerificationHeroPage /></PageTransition>} />
      <Route path="/demo" element={<PageTransition><DemoShowcaseHubPage /></PageTransition>} />

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
