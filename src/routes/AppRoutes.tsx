import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
const HomePage = React.lazy(() => import('../pages/public/HomePage').then(m => ({ default: m.HomePage })));
const VerifyProductPage = React.lazy(() => import('../pages/public/VerifyProductPage').then(m => ({ default: m.VerifyProductPage })));

// Auth Pages
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

// Admin Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserApprovalsPage = React.lazy(() => import('../pages/admin/UserApprovalsPage').then(m => ({ default: m.UserApprovalsPage })));
const BlockchainExplorerPage = React.lazy(() => import('../pages/admin/BlockchainExplorerPage').then(m => ({ default: m.BlockchainExplorerPage })));
const SuspiciousReportsPage = React.lazy(() => import('../pages/admin/SuspiciousReportsPage').then(m => ({ default: m.SuspiciousReportsPage })));

// Farmer Pages
const FarmerDashboard = React.lazy(() => import('../pages/farmer/FarmerDashboard').then(m => ({ default: m.FarmerDashboard })));
const RegisterProductPage = React.lazy(() => import('../pages/farmer/RegisterProductPage').then(m => ({ default: m.RegisterProductPage })));

// Processor Pages
const ProcessorDashboard = React.lazy(() => import('../pages/processor/ProcessorDashboard').then(m => ({ default: m.ProcessorDashboard })));
const ProcessBatchPage = React.lazy(() => import('../pages/processor/ProcessBatchPage').then(m => ({ default: m.ProcessBatchPage })));

// Laboratory Pages
const LaboratoryDashboard = React.lazy(() => import('../pages/laboratory/LaboratoryDashboard').then(m => ({ default: m.LaboratoryDashboard })));
const TestProductPage = React.lazy(() => import('../pages/laboratory/TestProductPage').then(m => ({ default: m.TestProductPage })));

// Distributor Pages
const DistributorDashboard = React.lazy(() => import('../pages/distributor/DistributorDashboard').then(m => ({ default: m.DistributorDashboard })));
const CreateShipmentPage = React.lazy(() => import('../pages/distributor/CreateShipmentPage').then(m => ({ default: m.CreateShipmentPage })));

// Retailer Pages
const RetailerDashboard = React.lazy(() => import('../pages/retailer/RetailerDashboard').then(m => ({ default: m.RetailerDashboard })));
const GenerateQRPage = React.lazy(() => import('../pages/retailer/GenerateQRPage').then(m => ({ default: m.GenerateQRPage })));

// Fleet Command & Animated Journey Map Pages (Option 3 & Showcase)
const DemoFleetCommandPage = React.lazy(() => import('../pages/demo/DemoFleetCommandPage').then(m => ({ default: m.DemoFleetCommandPage })));
const DemoVerificationHeroPage = React.lazy(() => import('../pages/demo/DemoVerificationHeroPage').then(m => ({ default: m.DemoVerificationHeroPage })));
const DemoShowcaseHubPage = React.lazy(() => import('../pages/demo/DemoShowcaseHubPage').then(m => ({ default: m.DemoShowcaseHubPage })));

// Root Route Handler: Opens Authentication first when launching the web app
const RootEntryPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated && role !== 'CONSUMER') {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
};

import { motion } from 'framer-motion';

// Loading fallback spinner for lazy-loaded route views
const PageLoadingSpinner: React.FC = () => (
  <div className="flex-1 min-h-[350px] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs text-muted-foreground font-medium">Loading view...</span>
    </div>
  </div>
);

// Page Transition Wrapper
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex-1 flex flex-col w-full h-full"
  >
    <React.Suspense fallback={<PageLoadingSpinner />}>
      {children}
    </React.Suspense>
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
