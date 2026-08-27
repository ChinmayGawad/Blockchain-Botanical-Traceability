import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { UserRole } from '../../types';
import {
  Sprout,
  ShieldCheck,
  QrCode,
  Blocks,
  ChevronDown,
  LayoutDashboard,
  Search,
  RefreshCw,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { QRScannerModal } from '../verification/QRScannerModal';
import { WalletConnectButton } from '../common/WalletConnectButton';

export const Navbar: React.FC = () => {
  const { currentUser, role, switchRole } = useAuth();
  const { networkStats, resetToDefaultData } = useBlockchain();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut listener for CMD+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roles: { role: UserRole; label: string; desc: string; color: string; badgeBg: string }[] = [
    { role: 'CONSUMER', label: 'Public Consumer', desc: 'Scan & verify botanical origin', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' },
    { role: 'FARMER', label: 'Farmer Portal', desc: 'Harvest & GPS registration', color: 'text-teal-700', badgeBg: 'bg-teal-50 border-teal-200' },
    { role: 'PROCESSOR', label: 'Bio Processor', desc: 'Milling & extraction logs', color: 'text-purple-700', badgeBg: 'bg-purple-50 border-purple-200' },
    { role: 'LABORATORY', label: 'Testing Lab', desc: 'HPLC potency & certificates', color: 'text-indigo-700', badgeBg: 'bg-indigo-50 border-indigo-200' },
    { role: 'DISTRIBUTOR', label: 'Distributor', desc: 'Cold-chain GPS transit', color: 'text-sky-700', badgeBg: 'bg-sky-50 border-sky-200' },
    { role: 'RETAILER', label: 'Retailer', desc: 'Shelf inventory & QR tags', color: 'text-emerald-800', badgeBg: 'bg-emerald-50 border-emerald-300' },
    { role: 'ADMIN', label: 'Consortium Admin', desc: 'Governance & fraud audit', color: 'text-slate-900', badgeBg: 'bg-slate-100 border-slate-300' },
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

  const navLinks = [
    { to: '/', label: 'Home', isExact: true },
    { to: '/verify', label: 'Verify Batch', isExact: false },
    { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
  ];

  const currentRoleInfo = roles.find(r => r.role === role) || roles[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        {/* Top Network Status Ticker */}
        <div className="bg-slate-950 text-slate-400 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>EVM Chain Active</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono text-slate-300">
                Block <strong className="text-white">#{networkStats.blockHeight}</strong>
              </span>
              <span className="text-slate-700 hidden md:inline">•</span>
              <span className="hidden md:inline text-slate-400">
                Contract: <span className="text-emerald-300 font-mono font-medium">{networkStats.contractAddress ? `${networkStats.contractAddress.substring(0, 8)}...${networkStats.contractAddress.substring(networkStats.contractAddress.length - 6)}` : '0x5FbDB2...'}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Reset all demo state to initial seed data?')) {
                    resetToDefaultData();
                    window.location.reload();
                  }
                }}
                className="text-slate-400 hover:text-emerald-300 text-[10px] flex items-center gap-1 font-medium transition-colors"
                title="Reset local state to clean seed data"
              >
                <RefreshCw size={11} />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <Sprout size={22} className="text-emerald-100" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center">
                  Flora<span className="text-emerald-600">Chain</span>
                </span>
                <span className="block text-[9px] uppercase font-bold tracking-widest text-emerald-800 -mt-0.5">
                  Botanical Provenance
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              {navLinks.map(link => {
                const isActive = link.isExact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/80 font-bold shadow-2xs'
                        : 'hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {Icon && <Icon size={14} className={isActive ? 'text-emerald-700' : 'text-slate-400'} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search Batch ID (e.g. ASH-2024-089)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs pl-9 pr-14 py-2 rounded-xl border border-slate-200/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono"
            />
            <span className="absolute right-2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
              ⌘K
            </span>
          </form>

          {/* Right Action Tools & Interactive Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Web3 Wallet Connect Button */}
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>

            {/* Quick QR Scanner Trigger */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              title="Launch QR Camera Scanner"
            >
              <QrCode size={15} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Sandbox Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm border border-slate-800 cursor-pointer"
                title="Switch active stakeholder portal persona"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="capitalize">{role.toLowerCase()}</span>
                </div>
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} className="text-emerald-600" /> Stakeholder Sandbox
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          1-Click Switch
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Switch persona to simulate verified actions across all 5 supply chain nodes:
                      </p>
                    </div>

                    <div className="py-1.5 space-y-1 max-h-72 overflow-y-auto">
                      {roles.map(r => {
                        const isSelected = role === r.role;
                        return (
                          <button
                            key={r.role}
                            onClick={() => handleRoleChange(r.role)}
                            className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50/80 border border-emerald-200 shadow-2xs'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 border ${r.badgeBg} ${r.color}`}
                            >
                              {r.role}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                <span>{r.label}</span>
                                {isSelected && <CheckCircle2 size={13} className="text-emerald-600" />}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {r.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {role !== 'CONSUMER' && (
                      <div className="pt-2 border-t border-slate-100">
                        <Link
                          to={`/${role.toLowerCase()}/dashboard`}
                          onClick={() => setIsRoleDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                          <LayoutDashboard size={14} />
                          <span>Open {role} Dashboard</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search Batch ID (e.g. ASH-2024-089)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-200 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shrink-0"
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
                Verify Product Batch
              </Link>
              <Link
                to="/admin/explorer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hyperledger Explorer
              </Link>
              {role !== 'CONSUMER' && (
                <Link
                  to={`/${role.toLowerCase()}/dashboard`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200"
                >
                  My {role} Dashboard →
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
};
