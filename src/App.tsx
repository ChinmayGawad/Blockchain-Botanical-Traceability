import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BlockchainProvider } from './context/BlockchainContext';
import { Navbar } from './components/layout/Navbar';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BlockchainProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <AppRoutes />
            </div>
          </div>
        </BlockchainProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
