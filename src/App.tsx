import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { Navbar } from './components/layout/Navbar';
import { AnimatePresence, motion } from 'framer-motion';
import { AppRoutes } from './routes/AppRoutes';
import { useTranslation } from 'react-i18next';

const AppLayout: React.FC = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/signup'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground w-full max-w-full bg-blobs relative selection:bg-accent selection:text-white transition-colors duration-500">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] z-[-1] pointer-events-none"></div>

      {!isAuthRoute && <Navbar />}

      {/* Smooth Content Dissolve on Language Switch */}
      <motion.div
        key={i18n.language}
        initial={{ opacity: 0.88, filter: 'blur(0.8px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex-1 flex flex-col relative z-0"
      >
        <AnimatePresence mode="wait">
          <AppRoutes location={location} key={location.pathname} />
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BlockchainProvider>
          <AppLayout />
        </BlockchainProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

