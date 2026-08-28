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
  LogOut,
  LogIn,
  User,
  PlusCircle,
  Cog,
  FlaskConical,
  Truck,
  Store,
} from 'lucide-react';
import { QRScannerModal } from '../verification/QRScannerModal';
import { WalletConnectButton } from '../common/WalletConnectButton';

export const Navbar: React.FC = () => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const { networkStats, resetToDefaultData } = useBlockchain();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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

  const roleConfigs: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; actionPath?: string; actionLabel?: string }> = {
    CONSUMER: { label: 'Public Consumer', icon: User, color: 'text-emerald-800', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    FARMER: { label: 'Organic Farmer', icon: Sprout, color: 'text-emerald-800', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', actionPath: '/farmer/register', actionLabel: 'Register Harvest' },
    PROCESSOR: { label: 'Bio Processor', icon: Cog, color: 'text-purple-800', bg: 'bg-purple-100 text-purple-900 border-purple-300', actionPath: '/processor/process', actionLabel: 'Process Raw Batch' },
    LABORATORY: { label: 'QA Testing Lab', icon: FlaskConical, color: 'text-indigo-800', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', actionPath: '/laboratory/test', actionLabel: 'Conduct QA Inspection' },
    DISTRIBUTOR: { label: 'Cold-Chain Distributor', icon: Truck, color: 'text-sky-800', bg: 'bg-sky-100 text-sky-900 border-sky-300', actionPath: '/distributor/create-shipment', actionLabel: 'Create Shipment' },
    RETAILER: { label: 'Apothecary Retailer', icon: Store, color: 'text-emerald-900', bg: 'bg-teal-100 text-teal-900 border-teal-300', actionPath: '/retailer/generate-qr', actionLabel: 'QR Label Studio' },
    ADMIN: { label: 'Consortium Admin', icon: ShieldCheck, color: 'text-slate-900', bg: 'bg-slate-100 text-slate-900 border-slate-300', actionPath: '/admin/approvals', actionLabel: 'User Approvals' },
  };

  const currentRoleCfg = roleConfigs[role] || roleConfigs.CONSUMER;
  const RoleIcon = currentRoleCfg.icon;

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
    setSearchQuery('');
  };

  const getNavLinks = () => {
    if (!isAuthenticated || role === 'CONSUMER') {
      return [
        { to: '/home', label: 'Overview', isExact: true },
        { to: '/verify', label: 'Verify Batch', isExact: false },
        { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
      ];
    }

    switch (role) {
      case 'FARMER':
        return [
          { to: '/farmer/dashboard', label: '🌾 My Farm Portal', isExact: true, isHighlight: true },
          { to: '/farmer/register', label: 'Register Harvest', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      case 'PROCESSOR':
        return [
          { to: '/processor/dashboard', label: '⚙️ Bio-Refining Portal', isExact: true, isHighlight: true },
          { to: '/processor/process', label: 'Process Raw Batch', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      case 'LABORATORY':
        return [
          { to: '/laboratory/dashboard', label: '🧪 QA Lab Station', isExact: true, isHighlight: true },
          { to: '/laboratory/test', label: 'Conduct QA Inspection', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      case 'DISTRIBUTOR':
        return [
          { to: '/distributor/dashboard', label: '🚚 Logistics Portal', isExact: true, isHighlight: true },
          { to: '/distributor/create-shipment', label: 'Create Shipment', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      case 'RETAILER':
        return [
          { to: '/retailer/dashboard', label: '🏪 Apothecary Store', isExact: true, isHighlight: true },
          { to: '/retailer/generate-qr', label: 'QR Label Studio', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: '🛡️ Admin Console', isExact: true, isHighlight: true },
          { to: '/admin/approvals', label: 'User Approvals', isExact: true },
          { to: '/admin/reports', label: 'Fraud Reports', isExact: true },
          { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks, isExact: false },
        ];
      default:
        return [
          { to: '/home', label: 'Overview', isExact: true },
          { to: '/verify', label: 'Verify Batch', isExact: false },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-2xs">
        {/* Simple, Readable Network Ticker */}
        <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Blockchain Network Active</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-300">
                Block <strong className="text-white font-mono font-bold">#{networkStats.blockHeight}</strong>
              </span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset all demo state to initial seed data?')) {
                  resetToDefaultData();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              title="Reset state to initial seed data"
            >
              <RefreshCw size={12} />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated && role !== 'CONSUMER' ? `/${role.toLowerCase()}/dashboard` : '/'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
                <Sprout size={22} />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center">
                  Flora<span className="text-emerald-700">Chain</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-800 -mt-0.5">
                  {isAuthenticated && role !== 'CONSUMER' ? `${role} Portal` : 'Botanical Traceability'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700">
              {navLinks.map(link => {
                const isActive = link.isExact
                  ? location.pathname === link.to
                  : location.pathname.startsWith(link.to);
                const Icon = (link as any).icon;
                const isHighlight = (link as any).isHighlight;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      isActive
                        ? isHighlight
                          ? 'text-emerald-900 bg-emerald-100 border border-emerald-300 font-extrabold shadow-2xs'
                          : 'text-emerald-900 bg-emerald-50 border border-emerald-200 font-extrabold shadow-2xs'
                        : isHighlight
                        ? 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200'
                        : 'hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    {Icon && <Icon size={15} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search Batch ID (e.g. ASH-2024-089)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs font-medium pl-9 pr-12 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono placeholder:text-slate-400"
            />
            <span className="absolute right-2.5 text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
              ⌘K
            </span>
          </form>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>

            {/* Quick QR Scanner */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              title="Launch QR Camera Scanner"
            >
              <QrCode size={16} className="text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* User Account Dropdown */}
            {isAuthenticated && role !== 'CONSUMER' ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-800 cursor-pointer"
                >
                  <RoleIcon size={15} className="text-emerald-400" />
                  <span className="capitalize">{role.toLowerCase()}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                      {/* Identity Card */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">{currentUser.organization}</p>
                        <p className="text-xs text-emerald-800 font-mono font-semibold">{currentUser.email}</p>
                      </div>

                      {/* Links */}
                      <div className="space-y-1 text-xs font-bold">
                        <Link
                          to={`/${role.toLowerCase()}/dashboard`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-emerald-700" />
                          <span>My {role} Dashboard</span>
                        </Link>
                        {currentRoleCfg.actionPath && (
                          <Link
                            to={currentRoleCfg.actionPath}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <PlusCircle size={15} className="text-emerald-700" />
                            <span>{currentRoleCfg.actionLabel}</span>
                          </Link>
                        )}
                      </div>

                      {/* Sign Out */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-rose-200"
                        >
                          <LogOut size={14} />
                          <span>Sign Out ({role})</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Search Batch ID (e.g. ASH-2024-089)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0"
              >
                Search
              </button>
            </form>

            <nav className="space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              {isAuthenticated && role !== 'CONSUMER' ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <LogOut size={14} />
                  <span>Sign Out ({role})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Sign In
                </Link>
              )}
            </div>
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
