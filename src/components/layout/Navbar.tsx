import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBlockchain } from '../../context/BlockchainContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { ROLE_NAV_LINKS, PUBLIC_NAV_LINKS } from '../../config/navigation';
import {
  Sprout,
  ShieldCheck,
  QrCode,
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
  Menu,
  X,
} from 'lucide-react';
import { QRScannerModal } from '../verification/QRScannerModal';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { ThemeToggle } from '../common/ThemeToggle';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, role, isAuthenticated, switchRole, logout } = useAuth();
  const { resetToDefaultData, walletState } = useBlockchain();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
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

  // Close the user dropdown with Escape
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserDropdownOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserDropdownOpen]);

  const roleConfigs: Record<UserRole, { label: string; icon: React.ElementType; color: string; bg: string; actionPath?: string; actionLabel?: string }> = {
    CONSUMER: { label: t('roles.CONSUMER'), icon: User, color: 'text-emerald-800', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    FARMER: { label: t('roles.FARMER'), icon: Sprout, color: 'text-emerald-800', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', actionPath: '/farmer/register', actionLabel: t('roles.actionRegisterHarvest') },
    PROCESSOR: { label: t('roles.PROCESSOR'), icon: Cog, color: 'text-purple-800', bg: 'bg-purple-100 text-purple-900 border-purple-300', actionPath: '/processor/process', actionLabel: t('roles.actionProcessRawBatch') },
    LABORATORY: { label: t('roles.LABORATORY'), icon: FlaskConical, color: 'text-indigo-800', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', actionPath: '/laboratory/test', actionLabel: t('roles.actionConductInspection') },
    DISTRIBUTOR: { label: t('roles.DISTRIBUTOR'), icon: Truck, color: 'text-sky-800', bg: 'bg-sky-100 text-sky-900 border-sky-300', actionPath: '/distributor/create-shipment', actionLabel: t('roles.actionCreateShipment') },
    RETAILER: { label: t('roles.RETAILER'), icon: Store, color: 'text-emerald-900', bg: 'bg-teal-100 text-teal-900 border-teal-300', actionPath: '/retailer/generate-qr', actionLabel: t('roles.actionQrStudio') },
    ADMIN: { label: t('roles.ADMIN'), icon: ShieldCheck, color: 'text-slate-900', bg: 'bg-slate-100 text-slate-900 border-slate-300', actionPath: '/admin/approvals', actionLabel: t('roles.actionUserApprovals') },
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

  const handleResetDemo = () => {
    resetToDefaultData();
    setIsResetConfirmOpen(false);
    setIsMobileMenuOpen(false);
    toast.success({
      title: t('nav.demoResetDone', 'Demo data reset'),
      description: t('nav.demoResetDoneDesc', 'All state was restored to the initial seed data.'),
    });
    window.location.reload();
  };

  const publicLinks = PUBLIC_NAV_LINKS.map(link => ({
    ...link,
    label: t(link.labelKey),
  }));

  const roleNavLinks =
    isAuthenticated && role !== 'CONSUMER'
      ? ROLE_NAV_LINKS[role].map(link => ({ ...link, label: t(link.labelKey) }))
      : [];

  if (['/login', '/register', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 shrink">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('nav.openMenu', 'Open Menu')}
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={22} />
            </button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Link to={isAuthenticated && role !== 'CONSUMER' ? `/${role.toLowerCase()}/dashboard` : '/home'} className="flex items-center gap-2 sm:gap-3 group min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform shrink-0">
                  <Sprout size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="text-base sm:text-lg font-black tracking-tight flex items-center whitespace-nowrap">
                    <span className="text-slate-900 dark:text-white">Flora</span><span className="text-gradient">Chain</span>
                  </span>
                  <span className="hidden xs:block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 -mt-0.5 whitespace-nowrap truncate max-w-[130px] sm:max-w-none">
                    {isAuthenticated && role !== 'CONSUMER' ? `${currentRoleCfg.label} ${t('nav.portalSuffix')}` : t('nav.brandTagline')}
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Public-only Navigation Links (when NOT inside a dashboard) */}
            {(!isAuthenticated || role === 'CONSUMER') && (
              <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300" aria-label={t('nav.publicNav', 'Public navigation')}>
                {publicLinks.map(link => {
                  const isActive = location.pathname === link.to;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 font-extrabold shadow-2xs'
                          : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      {Icon && <Icon size={14} className={isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'} aria-hidden="true" />}
                      <span>{link.label}</span>
                      {link.isLive && (
                        <span className="relative flex h-1.5 w-1.5 ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                      )}
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
              role="search"
            >
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="global-search-input"
                type="text"
                aria-label={t('nav.searchPlaceholder', 'Search a product or batch to verify')}
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-xs font-medium pl-9 pr-12 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-slate-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all font-mono placeholder:text-slate-400"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-500 bg-white dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 pointer-events-none">
                ⌘K
              </span>
            </form>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <ThemeToggle />

            <LanguageSwitcher variant="navbar" />

            {/* Automated Web3 Node Status Badge (Replaces manual button) */}
            {walletState.isConnected && (
              <div
                id="automated-web3-node-badge"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-medium shadow-2xs shrink-0 select-none cursor-default"
                title={`FloraChain Web3 Node: ${walletState.address} (${walletState.networkName || 'Hardhat EVM'})`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" aria-hidden="true" />
                <span className="font-mono text-[11px] font-bold text-emerald-950 dark:text-emerald-100">
                  {walletState.address?.substring(0, 4)}...{walletState.address?.substring(walletState.address.length - 2)}
                </span>
                {walletState.balanceEth && (
                  <span className="hidden md:inline text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-300/80 dark:border-emerald-700">
                    {walletState.balanceEth} ETH
                  </span>
                )}
              </div>
            )}

            {/* Quick QR Scanner */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-400/50 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group cursor-pointer shrink-0 whitespace-nowrap"
              title={t('nav.launchScanner', 'Launch QR Camera Scanner')}
            >
              <QrCode size={15} className="text-emerald-50 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
              <span className="hidden md:inline whitespace-nowrap">{t('nav.quickScan')}</span>
            </button>

            {/* User Account Dropdown */}
            {isAuthenticated && role !== 'CONSUMER' ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-800 dark:border-slate-700 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <RoleIcon size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
                  <span className="capitalize whitespace-nowrap text-[11px] sm:text-xs">{currentRoleCfg.label}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 ${isUserDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                <AnimatePresence>
                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ transformOrigin: 'top right' }}
                      role="menu"
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-3.5 space-y-3"
                    >
                      {/* Identity Card */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                            {role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">{currentUser.organization}</p>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono font-semibold">{currentUser.email}</p>
                      </div>

                      {/* Links */}
                      <div className="space-y-1 text-xs font-bold" role="none">
                        <Link
                          to={`/${role.toLowerCase()}/dashboard`}
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                          <span className="whitespace-nowrap">{t('nav.myDashboard', { role: currentRoleCfg.label })}</span>
                        </Link>

                        {currentRoleCfg.actionPath && (
                          <Link
                            to={currentRoleCfg.actionPath}
                            onClick={() => setIsUserDropdownOpen(false)}
                            role="menuitem"
                            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                          >
                            <PlusCircle size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                            <span className="whitespace-nowrap">{currentRoleCfg.actionLabel}</span>
                          </Link>
                        )}

                        <Link
                          to="/verify"
                          onClick={() => setIsUserDropdownOpen(false)}
                          role="menuitem"
                          className="w-full flex items-center gap-2 p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                          <span className="whitespace-nowrap">{t('nav.auditProvenance')}</span>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-bold transition-colors cursor-pointer text-xs"
                        >
                          <LogOut size={15} className="shrink-0" aria-hidden="true" />
                          <span className="whitespace-nowrap">{t('nav.signOutNode', { role: currentRoleCfg.label })}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogIn size={15} className="shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{t('nav.signIn')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {createPortal(
          <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[9999] flex">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
              />
              {/* Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                role="dialog"
                aria-modal="true"
                aria-label={t('nav.mobileMenu', 'Mobile Menu')}
                className="relative w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <Sprout size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm">FloraChain</span>
                    <span className="block text-[10px] text-emerald-800 dark:text-emerald-300 font-bold -mt-0.5">{t('nav.mobileMenu', 'Mobile Menu')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  aria-label={t('nav.closeMenu', 'Close Menu')}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* User Identity Card if Authenticated */}
                {isAuthenticated && role !== 'CONSUMER' && (
                  <div className="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800 dark:to-emerald-900/20 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        {role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">{currentUser.organization}</p>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-semibold">{currentUser.email}</p>
                  </div>
                )}

                {/* Mobile Language Switcher */}
                <LanguageSwitcher variant="mobile" />

                {/* Search in Drawer */}
                <form onSubmit={(e) => { handleSearchSubmit(e); setIsMobileMenuOpen(false); }} className="relative" role="search">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label={t('nav.searchPlaceholder', 'Search a product or batch to verify')}
                    placeholder={t('nav.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </form>

                {/* Mobile Quick Action Buttons (QR Scanner & Wallet) */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsQRScannerOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <QrCode size={15} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span>{t('nav.quickScan')}</span>
                  </button>
                </div>

                {/* Role-Specific Navigation Links if Authenticated */}
                {isAuthenticated && role !== 'CONSUMER' && roleNavLinks.length > 0 && (
                  <nav className="space-y-1" aria-label={t('nav.roleWorkspace', '{{role}} Workspace', { role })}>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 block px-2">
                      {t('nav.roleWorkspace', '{{role}} Workspace', { role })}
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
                              ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon size={16} className={isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'} aria-hidden="true" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                )}

                {/* Public Navigation Links */}
                <nav className="space-y-1" aria-label={t('nav.publicProvenance', 'Public Provenance')}>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 block px-2">
                    {t('nav.publicProvenance', 'Public Provenance')}
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
                            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {Icon && <Icon size={16} className={isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'} aria-hidden="true" />}
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Demo Role Switcher */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2">{t('nav.demoTools', 'Demo Tools')}</span>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="demo-role-switch" className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{t('nav.switchNode', 'Switch Stakeholder Node')}</label>
                      <select
                        id="demo-role-switch"
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
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                      >
                        <optgroup label={t('nav.demoPersonas', 'Demo personas (sandbox)')}>
                          <option value="FARMER">🌾 Farmer (Rajesh)</option>
                          <option value="PROCESSOR">⚙️ Processor (Dr. Sunita)</option>
                          <option value="LABORATORY">🧪 Lab QA (Marcus)</option>
                          <option value="DISTRIBUTOR">🚚 Logistics (Klaus)</option>
                          <option value="RETAILER">🏪 Retailer (Emma)</option>
                          <option value="ADMIN">🛡️ Admin (Dr. Evelyn)</option>
                          <option value="CONSUMER">👤 Consumer Guest</option>
                        </optgroup>
                      </select>
                    </div>

                    <button
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} aria-hidden="true" />
                      <span>{t('nav.resetDemoData', 'Reset Demo Seed Data')}</span>
                    </button>
                  </div>
                </div>
                </div>

                {/* Account Action: Sign In or Sign Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isAuthenticated && role !== 'CONSUMER' ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} aria-hidden="true" />
                      <span>{t('nav.signOutRole', 'Sign Out ({{role}})', { role })}</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <LogIn size={15} aria-hidden="true" />
                      <span>{t('nav.signInNode', 'Sign In to Stakeholder Node')}</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          )}
          </AnimatePresence>,
          document.body
        )}
      </header>

      {/* Reset demo confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDemo}
        title={t('nav.resetConfirmTitle', 'Reset demo data?')}
        description={t('nav.resetConfirmDesc', 'This clears all local ledger state and restores the initial seed data. This cannot be undone.')}
        confirmLabel={t('nav.resetConfirmAction', 'Reset data')}
        variant="danger"
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
};
