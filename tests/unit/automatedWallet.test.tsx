import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { BlockchainProvider, useBlockchain } from '../../src/context/BlockchainContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { ToastProvider } from '../../src/context/ToastContext';
import { Navbar } from '../../src/components/layout/Navbar';
import '../../src/i18n';

// Helper component to inspect BlockchainContext state
const WalletInspectionConsumer: React.FC = () => {
  const { walletState } = useBlockchain();
  const { role, switchRole } = useAuth();

  return (
    <div>
      <div data-testid="is-connected">{walletState.isConnected ? 'YES' : 'NO'}</div>
      <div data-testid="wallet-address">{walletState.address}</div>
      <div data-testid="wallet-role">{role}</div>
      <button onClick={() => switchRole('FARMER')}>Set Farmer</button>
      <button onClick={() => switchRole('PROCESSOR')}>Set Processor</button>
      <button onClick={() => switchRole('LABORATORY')}>Set Lab</button>
    </div>
  );
};

describe('Automated Web3 Wallet Connection & Navbar Removal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completely removes the manual Connect Wallet button from Navbar', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <BlockchainProvider>
                <Navbar />
              </BlockchainProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    // Verify there is absolutely NO button with text "Connect Wallet"
    expect(screen.queryByRole('button', { name: /connect wallet/i })).toBeNull();
    expect(screen.queryByText(/connect wallet/i)).toBeNull();

    // Verify the automated live node status badge is rendered instead
    const badge = document.getElementById('automated-web3-node-badge');
    expect(badge).toBeInTheDocument();
  });

  it('automatically connects Web3 wallet state without user manual interaction', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BlockchainProvider>
            <WalletInspectionConsumer />
          </BlockchainProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Wallet auto-connect resolves asynchronously (dynamic web3 service load);
    // allow enough time for the promise chain to settle.
    await waitFor(() => {
      expect(screen.getByTestId('is-connected').textContent).toBe('YES');
      expect(screen.getByTestId('wallet-address').textContent).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }, { timeout: 4000 });
  });

  it('automatically maps and switches wallet accounts when stakeholder role changes', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <BlockchainProvider>
            <WalletInspectionConsumer />
          </BlockchainProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Switch to FARMER (Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
    screen.getByText('Set Farmer').click();
    await waitFor(() => {
      expect(screen.getByTestId('wallet-role').textContent).toBe('FARMER');
      expect(screen.getByTestId('wallet-address').textContent?.toLowerCase()).toBe(
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
      );
    }, { timeout: 4000 });

    // Switch to PROCESSOR (Account 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
    screen.getByText('Set Processor').click();
    await waitFor(() => {
      expect(screen.getByTestId('wallet-role').textContent).toBe('PROCESSOR');
      expect(screen.getByTestId('wallet-address').textContent?.toLowerCase()).toBe(
        '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'
      );
    }, { timeout: 4000 });

    // Switch to LABORATORY (Account 3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906)
    screen.getByText('Set Lab').click();
    await waitFor(() => {
      expect(screen.getByTestId('wallet-role').textContent).toBe('LABORATORY');
      expect(screen.getByTestId('wallet-address').textContent?.toLowerCase()).toBe(
        '0x90f79bf6eb2c4f870365e785982e1f101e93b906'
      );
    }, { timeout: 4000 });
  });
});
