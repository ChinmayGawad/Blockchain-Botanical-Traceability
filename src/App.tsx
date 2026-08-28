import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { Navbar } from './components/layout/Navbar';
import { AppRoutes } from './routes/AppRoutes';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/signup'];
  const isAuthRoute = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {!isAuthRoute && <Navbar />}
      <div className="flex-1 flex flex-col">
        <AppRoutes />
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

