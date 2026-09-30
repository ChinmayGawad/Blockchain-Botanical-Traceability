import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { Navbar } from './components/layout/Navbar';
import { AnimatePresence } from 'framer-motion';
import { AppRoutes } from './routes/AppRoutes';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/signup'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground w-full max-w-full bg-blobs relative selection:bg-accent selection:text-white transition-colors duration-500">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px] z-[-1] pointer-events-none"></div>
      {!isAuthRoute && <Navbar />}
      <div className="flex-1 flex flex-col relative z-0">
        <AnimatePresence mode="wait">
          <AppRoutes location={location} key={location.pathname} />
        </AnimatePresence>
      </div>
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

