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
          { to: '/admin/explorer', icon: Blocks, label: 'Hyperledger Explorer' },
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
          { to: '/', icon: LayoutDashboard, label: 'Home Landing' },
          { to: '/verify', icon: ShieldCheck, label: 'Verify Product' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 min-h-[calc(100vh-6rem)]">
      {/* Upper Navigation */}
      <div className="p-4 space-y-6">
        {/* User Card */}
        <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60 flex items-center gap-3">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/50 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">
              {currentUser.name}
            </h4>
            <div className="text-[11px] text-emerald-400 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {role} Node
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser.organization}
            </div>
          </div>
        </div>

        {/* Links Menu */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {role} Operations
          </div>
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Public Links & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
        <NavLink
          to="/verify"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} /> Consumer Verification
          </span>
          <ExternalLink size={12} />
        </NavLink>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut size={16} />
          <span>Exit to Public Portal</span>
        </button>
      </div>
    </aside>
  );
};
