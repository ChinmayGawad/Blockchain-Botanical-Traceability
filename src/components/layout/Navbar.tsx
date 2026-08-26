import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { UserRole } from '../../types';
import {
  Sprout,
  ShieldCheck,
  QrCode,
  Blocks,
  Users,
  ChevronDown,
  LayoutDashboard,
  Search,
  RefreshCw,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { QRScannerModal } from '../verification/QRScannerModal';
import { WalletConnectButton } from '../common/WalletConnectButton';

export const Navbar: React.FC = () => {
  const { currentUser, role, switchRole, logout } = useAuth();
  const { networkStats, resetToDefaultData } = useBlockchain();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'CONSUMER', label: 'Public Consumer', desc: 'Scan & verify product provenance', color: 'bg-gray-100 text-gray-800' },
    { role: 'FARMER', label: 'Farmer Portal', desc: 'Harvest & crop batch registration', color: 'bg-emerald-100 text-emerald-800' },
    { role: 'PROCESSOR', label: 'Processor Portal', desc: 'Bio-refining & extraction methods', color: 'bg-purple-100 text-purple-800' },
    { role: 'LABORATORY', label: 'Quality Lab Portal', desc: 'HPLC purity testing & certificates', color: 'bg-indigo-100 text-indigo-800' },
    { role: 'DISTRIBUTOR', label: 'Distributor Portal', desc: 'Cold-chain shipment & transport', color: 'bg-sky-100 text-sky-800' },
    { role: 'RETAILER', label: 'Retailer Portal', desc: 'Inventory receipt & QR tags', color: 'bg-teal-100 text-teal-800' },
    { role: 'ADMIN', label: 'Consortium Admin', desc: 'Network oversight & fraud monitoring', color: 'bg-zinc-800 text-white' },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setIsRoleDropdownOpen(false);
    setIsMobileMenuOpen(false);

    if (newRole === 'CONSUMER') {
      navigate('/');
    } else {
      navigate(`/${newRole.toLowerCase()}/dashboard`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
    setSearchQuery('');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        {/* Top Mini Network Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Solidity EVM Chain: Active
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline font-mono text-slate-400">
              Block Height #{networkStats.blockHeight}
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">
              Contract: <span className="text-emerald-300 font-mono">{networkStats.contractAddress ? `${networkStats.contractAddress.substring(0, 8)}...${networkStats.contractAddress.substring(networkStats.contractAddress.length - 6)}` : '0x5FbDB2...'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo state to fresh mock dataset?')) {
                  resetToDefaultData();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-emerald-400 text-[10px] flex items-center gap-1 transition-colors"
              title="Reset state to initial mock data"
            >
              <RefreshCw size={10} />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Sprout size={22} className="text-emerald-100" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                  Flora<span className="text-emerald-600">Chain</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                  Botanical Traceability
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/' ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/verify"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname.startsWith('/verify')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Verify Product
              </Link>
              <Link
                to="/admin/explorer"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  location.pathname === '/admin/explorer'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Blocks size={14} className="text-indigo-600" />
                <span>Ledger Explorer</span>
              </Link>
            </nav>
          </div>

          {/* Center Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <Search size={16} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Batch ID (e.g. ASH-2024-089)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs pl-9 pr-3 py-2 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
            />
          </form>

          {/* Right Action Tools & Interactive Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Web3 Wallet Connect */}
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>

            {/* Quick QR Scanner Button */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all shadow-2xs group"
              title="Open QR Scanner"
            >
              <QrCode size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Quick Portal Switcher Sandbox Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm border border-slate-700"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="capitalize">{role.toLowerCase()} Portal</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" /> Role Sandbox Switcher
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Switch persona to test full end-to-end supply chain actions:
                      </p>
                    </div>

                    <div className="py-1 space-y-1">
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => handleRoleChange(r.role)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                            role === r.role
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${r.color}`}
                          >
                            {r.role}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {r.label}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight">
                              {r.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {role !== 'CONSUMER' && (
                      <div className="pt-2 border-t border-slate-100">
                        <Link
                          to={`/${role.toLowerCase()}/dashboard`}
                          onClick={() => setIsRoleDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <LayoutDashboard size={14} />
                          <span>Open Active Portal Dashboard</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search Batch ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Search
              </button>
            </form>

            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                to="/verify"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Verify Product
              </Link>
              <Link
                to="/admin/explorer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ledger Explorer
              </Link>
              {role !== 'CONSUMER' && (
                <Link
                  to={`/${role.toLowerCase()}/dashboard`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50"
                >
                  My {role} Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Reusable QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
};
