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
  LogOut,
  LogIn,
  User,
  PlusCircle,
  Cog,
  FlaskConical,
  Truck,
  Store,
  Sparkles,
} from 'lucide-react';
import { QRScannerModal } from '../verification/QRScannerModal';
import { WalletConnectButton } from '../common/WalletConnectButton';

export const Navbar: React.FC = () => {
  const { currentUser, role, isAuthenticated, switchRole, logout } = useAuth();
  const { networkStats, resetToDefaultData } = useBlockchain();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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
    navigate('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/verify/${searchQuery.trim()}`);
    setSearchQuery('');
  };

  const publicLinks = [
    { to: '/home', label: 'Overview' },
    { to: '/verify', label: 'Verify Batch' },
    { to: '/admin/explorer', label: 'Ledger Explorer', icon: Blocks },
  ];

  if (['/login', '/register', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-2xs">
        {/* Simple, Readable Network Ticker + Demo Login Toggle */}
        <div className="h-9 bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 flex items-center border-b border-slate-800">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>Blockchain Active</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-300 whitespace-nowrap">
                Block <strong className="text-white font-mono font-bold">#{networkStats.blockHeight}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Quick 1-Click Demo Login Role Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 rounded-lg px-2 py-0.5">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-300 hidden md:inline whitespace-nowrap">Demo Login:</span>
                <select
                  value={role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    switchRole(newRole);
                    if (newRole === 'CONSUMER') {
                      navigate('/home');
                    } else {
                      navigate(`/${newRole.toLowerCase()}/dashboard`);
                    }
                  }}
                  className="bg-transparent text-emerald-400 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="FARMER" className="bg-slate-900 text-white">🌾 Farmer (Rajesh)</option>
                  <option value="PROCESSOR" className="bg-slate-900 text-white">⚙️ Processor (Dr. Sunita)</option>
                  <option value="LABORATORY" className="bg-slate-900 text-white">🧪 Lab QA (Marcus)</option>
                  <option value="DISTRIBUTOR" className="bg-slate-900 text-white">🚚 Logistics (Klaus)</option>
                  <option value="RETAILER" className="bg-slate-900 text-white">🏪 Retailer (Emma)</option>
                  <option value="ADMIN" className="bg-slate-900 text-white">🛡️ Admin (Dr. Evelyn)</option>
                  <option value="CONSUMER" className="bg-slate-900 text-white">👤 Consumer Guest</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Reset all demo state to initial seed data?')) {
                    resetToDefaultData();
                    window.location.reload();
                  }
                }}
                className="text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap"
                title="Reset state to initial seed data"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to={isAuthenticated && role !== 'CONSUMER' ? `/${role.toLowerCase()}/dashboard` : '/home'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform shrink-0">
                <Sprout size={22} />
              </div>
              <div className="shrink-0">
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center whitespace-nowrap">
                  Flora<span className="text-emerald-700">Chain</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-800 -mt-0.5 whitespace-nowrap">
                  {isAuthenticated && role !== 'CONSUMER' ? `${role} Portal` : 'Botanical Traceability'}
                </span>
              </div>
            </Link>

            {/* Public-only Navigation Links (when NOT inside a dashboard) */}
            {(!isAuthenticated || role === 'CONSUMER') && (
              <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700">
                {publicLinks.map(link => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'text-emerald-900 bg-emerald-50 border border-emerald-200 font-extrabold shadow-2xs'
                          : 'hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {Icon && <Icon size={14} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full"
            >
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                placeholder="Search Batch ID (e.g. ASH-2024-089)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs font-medium pl-9 pr-12 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono placeholder:text-slate-400"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
                ⌘K
              </span>
            </form>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="shrink-0">
              <WalletConnectButton />
            </div>

            {/* Quick QR Scanner */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs group cursor-pointer shrink-0 whitespace-nowrap"
              title="Launch QR Camera Scanner"
            >
              <QrCode size={15} className="text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Scan QR</span>
            </button>

            {/* User Account Dropdown */}
            {isAuthenticated && role !== 'CONSUMER' ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-800 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <RoleIcon size={14} className="text-emerald-400 shrink-0" />
                  <span className="capitalize whitespace-nowrap">{role.toLowerCase()}</span>
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
                          <LayoutDashboard size={15} className="text-emerald-700 shrink-0" />
                          <span className="whitespace-nowrap">My {role} Dashboard</span>
                        </Link>

                        {currentRoleCfg.actionPath && (
                          <Link
                            to={currentRoleCfg.actionPath}
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                          >
                            <PlusCircle size={15} className="text-emerald-700 shrink-0" />
                            <span className="whitespace-nowrap">{currentRoleCfg.actionLabel}</span>
                          </Link>
                        )}

                        <Link
                          to="/verify"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
                          <span className="whitespace-nowrap">Audit Provenance Record</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer text-xs"
                        >
                          <LogOut size={15} className="shrink-0" />
                          <span className="whitespace-nowrap">Sign Out of {role} Node</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogIn size={15} className="shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
};
