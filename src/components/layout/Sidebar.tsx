import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  Cog,
  FlaskConical,
  Truck,
  Store,
  QrCode,
  ShieldCheck,
  Users,
  Blocks,
  AlertTriangle,
  FileCheck,
  Package,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = () => {
    switch (role) {
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
        return [
          { to: '/home', icon: LayoutDashboard, label: 'Home Landing' },
          { to: '/verify', icon: ShieldCheck, label: 'Verify Product' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-full lg:w-64 bg-white text-slate-800 flex flex-col justify-between shrink-0 border-r border-slate-200/90 lg:fixed lg:top-[96px] lg:bottom-0 lg:left-0 lg:overflow-y-auto shadow-xs z-30">
      {/* Upper Section */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* Stakeholder Identity Node Badge */}
        <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center gap-3">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-600/30 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-emerald-900/10">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {currentUser.name}
            </h4>
            <div className="text-[11px] text-emerald-800 font-bold truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {role} Node Active
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {currentUser.organization}
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
            {role} Navigation
          </div>
          <nav className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-300/80 shadow-2xs font-extrabold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-700 before:rounded-r'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0 text-emerald-700" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 sm:p-5 border-t border-slate-200/80 space-y-2 text-xs font-bold bg-slate-50/50">
        <NavLink
          to="/verify"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 hover:text-emerald-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-700" /> Public Verification
          </span>
          <ExternalLink size={13} className="text-slate-400" />
        </NavLink>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out ({role})</span>
        </button>
      </div>
    </aside>
  );
};
