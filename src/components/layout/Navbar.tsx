import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Menu,
  X,
  Package,
  Users,
  AlertTriangle,
  FileCheck,
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

  const getRoleNavLinks = (userRole: UserRole) => {
    switch (userRole) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview Dashboard' },
          { to: '/admin/approvals', icon: Users, label: 'Stakeholder Approvals' },
          { to: '/admin/products', icon: Package, label: 'Consortium Batches' },
          { to: '/admin/explorer', icon: Blocks, label: 'Ledger Explorer' },
          { to: '/admin/reports', icon: AlertTriangle, label: 'Fraud / Suspicious Reports' },
        ];
      case 'FARMER':
        return [
          { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Farmer Dashboard' },
          { to: '/farmer/register', icon: PlusCircle, label: 'Register Botanical Crop' },
          { to: '/farmer/products', icon: Sprout, label: 'My Registered Crops' },
        ];
      case 'PROCESSOR':
        return [
          { to: '/processor/dashboard', icon: LayoutDashboard, label: 'Processing Queue' },
          { to: '/processor/process', icon: Cog, label: 'Process Raw Batch' },
          { to: '/processor/batches', icon: Package, label: 'Processed Inventory' },
        ];
      case 'LABORATORY':
        return [
          { to: '/laboratory/dashboard', icon: LayoutDashboard, label: 'Testing Dashboard' },
          { to: '/laboratory/test', icon: FlaskConical, label: 'Inspect & QA Test' },
          { to: '/laboratory/reports', icon: FileCheck, label: 'Issued Certificates' },
        ];
      case 'DISTRIBUTOR':
        return [
          { to: '/distributor/dashboard', icon: LayoutDashboard, label: 'Logistics Dashboard' },
          { to: '/distributor/create-shipment', icon: PlusCircle, label: 'Create Cold Shipment' },
          { to: '/distributor/shipments', icon: Truck, label: 'Shipment Tracking' },
        ];
      case 'RETAILER':
        return [
          { to: '/retailer/dashboard', icon: LayoutDashboard, label: 'Store Overview' },
          { to: '/retailer/inventory', icon: Store, label: 'Retail Inventory' },
          { to: '/retailer/generate-qr', icon: QrCode, label: 'Generate QR Labels' },
        ];
      default:
        return [];
    }
  };

  const roleNavLinks = getRoleNavLinks(role);

  if (['/login', '/register', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-2xs">
        {/* Simple, Readable Network Ticker + Demo Login Toggle */}
        <div className="h-9 bg-slate-900 text-slate-300 text-xs px-3 sm:px-6 flex items-center border-b border-slate-800 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 font-medium min-w-0">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>Blockchain Active</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-300 whitespace-nowrap">
                Block <strong className="text-white font-mono font-bold">#{networkStats.blockHeight}</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Quick 1-Click Demo Login Role Switcher */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 border border-slate-700/80 rounded-lg px-1.5 sm:px-2 py-0.5 max-w-[125px] xs:max-w-[160px] sm:max-w-none">
                <Sparkles size={11} className="text-amber-400 shrink-0" />
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
                  className="bg-transparent text-emerald-400 text-[11px] sm:text-xs font-bold focus:outline-none cursor-pointer pr-1 truncate"
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
                className="text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer whitespace-nowrap p-1"
                title="Reset state to initial seed data"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 shrink">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={22} />
            </button>
            <Link to={isAuthenticated && role !== 'CONSUMER' ? `/${role.toLowerCase()}/dashboard` : '/home'} className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform shrink-0">
                <Sprout size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center whitespace-nowrap">
                  Flora<span className="text-emerald-700">Chain</span>
                </span>
                <span className="hidden xs:block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-800 -mt-0.5 whitespace-nowrap truncate max-w-[130px] sm:max-w-none">
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="shrink-0">
              <WalletConnectButton />
            </div>

            {/* Quick QR Scanner */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs group cursor-pointer shrink-0 whitespace-nowrap"
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
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-800 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <RoleIcon size={14} className="text-emerald-400 shrink-0" />
                  <span className="capitalize whitespace-nowrap text-[11px] sm:text-xs">{role.toLowerCase()}</span>
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
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogIn size={15} className="shrink-0" />
                <span className="whitespace-nowrap">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && createPortal(
          <div className="md:hidden fixed inset-0 z-[9999] flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <Sprout size={16} />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-sm">FloraChain</span>
                    <span className="block text-[10px] text-emerald-800 font-bold -mt-0.5">Mobile Menu</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* User Identity Card if Authenticated */}
                {isAuthenticated && role !== 'CONSUMER' && (
                  <div className="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">{currentUser.organization}</p>
                    <p className="text-[10px] text-emerald-800 font-mono font-semibold">{currentUser.email}</p>
                  </div>
                )}

                {/* Search in Drawer */}
                <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Batch ID (e.g. ASH-2024-089)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </form>

                {/* Mobile Quick Action Buttons (QR Scanner & Wallet) */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsQRScannerOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    <QrCode size={15} className="text-emerald-700" />
                    <span>Launch Camera QR Scanner</span>
                  </button>
                </div>

                {/* Role-Specific Navigation Links if Authenticated */}
                {isAuthenticated && role !== 'CONSUMER' && roleNavLinks.length > 0 && (
                  <nav className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block px-2">
                      {role} Workspace
                    </span>
                    {roleNavLinks.map(link => {
                      const Icon = link.icon;
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={16} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                )}

                {/* Public Navigation Links */}
                <nav className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block px-2">
                    Public Provenance
                  </span>
                  {publicLinks.map(link => {
                    const isActive = location.pathname === link.to;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {Icon && <Icon size={16} className={isActive ? 'text-emerald-700' : 'text-slate-400'} />}
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Demo Role Switcher */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2">Demo Tools</span>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500">Switch Stakeholder Node</label>
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
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="FARMER">🌾 Farmer (Rajesh)</option>
                        <option value="PROCESSOR">⚙️ Processor (Dr. Sunita)</option>
                        <option value="LABORATORY">🧪 Lab QA (Marcus)</option>
                        <option value="DISTRIBUTOR">🚚 Logistics (Klaus)</option>
                        <option value="RETAILER">🏪 Retailer (Emma)</option>
                        <option value="ADMIN">🛡️ Admin (Dr. Evelyn)</option>
                        <option value="CONSUMER">👤 Consumer Guest</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Reset all demo state to initial seed data?')) {
                          resetToDefaultData();
                          window.location.reload();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Reset Demo Seed Data</span>
                    </button>
                  </div>
                </div>

                {/* Account Action: Sign In or Sign Out */}
                <div className="pt-2 border-t border-slate-100">
                  {isAuthenticated && role !== 'CONSUMER' ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out ({role})</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <LogIn size={15} />
                      <span>Sign In to Stakeholder Node</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
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
