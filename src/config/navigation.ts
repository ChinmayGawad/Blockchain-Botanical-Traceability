import type { LucideIcon } from 'lucide-react';
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
} from 'lucide-react';
import type { UserRole } from '../types';

/**
 * Single source of truth for navigation links, shared by Navbar and Sidebar.
 * Labels are i18n keys — consumers render them via `t(link.labelKey)`.
 */
export interface NavLinkItem {
  to: string;
  icon: LucideIcon;
  labelKey: string;
}

export const ROLE_NAV_LINKS: Record<UserRole, NavLinkItem[]> = {
  ADMIN: [
    { to: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.adminDashboard' },
    { to: '/admin/approvals', icon: Users, labelKey: 'sidebar.adminApprovals' },
    { to: '/admin/products', icon: Package, labelKey: 'sidebar.adminBatches' },
    { to: '/admin/explorer', icon: Blocks, labelKey: 'sidebar.adminExplorer' },
    { to: '/admin/reports', icon: AlertTriangle, labelKey: 'sidebar.adminReports' },
  ],
  FARMER: [
    { to: '/farmer/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.farmerDashboard' },
    { to: '/farmer/register', icon: PlusCircle, labelKey: 'sidebar.farmerRegister' },
    { to: '/farmer/products', icon: Sprout, labelKey: 'sidebar.farmerProducts' },
  ],
  PROCESSOR: [
    { to: '/processor/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.processorDashboard' },
    { to: '/processor/process', icon: Cog, labelKey: 'sidebar.processorProcess' },
    { to: '/processor/batches', icon: Package, labelKey: 'sidebar.processorBatches' },
  ],
  LABORATORY: [
    { to: '/laboratory/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.labDashboard' },
    { to: '/laboratory/test', icon: FlaskConical, labelKey: 'sidebar.labTest' },
    { to: '/laboratory/reports', icon: FileCheck, labelKey: 'sidebar.labReports' },
  ],
  DISTRIBUTOR: [
    { to: '/distributor/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.distributorDashboard' },
    { to: '/distributor/create-shipment', icon: PlusCircle, labelKey: 'sidebar.distributorShipment' },
    { to: '/distributor/shipments', icon: Truck, labelKey: 'sidebar.distributorTracking' },
  ],
  RETAILER: [
    { to: '/retailer/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.retailerDashboard' },
    { to: '/retailer/inventory', icon: Store, labelKey: 'sidebar.retailerInventory' },
    { to: '/retailer/generate-qr', icon: QrCode, labelKey: 'sidebar.retailerGenerateQr' },
  ],
  CONSUMER: [
    { to: '/home', icon: LayoutDashboard, labelKey: 'sidebar.homeLanding' },
    { to: '/verify', icon: ShieldCheck, labelKey: 'sidebar.verifyProduct' },
  ],
};

export const PUBLIC_NAV_LINKS: (Omit<NavLinkItem, 'icon'> & {
  icon?: LucideIcon;
  isLive?: boolean;
})[] = [
  { to: '/home', labelKey: 'nav.overview' },
  { to: '/verify', icon: ShieldCheck, labelKey: 'nav.verifyBatch' },
  { to: '/fleet-map', icon: Truck, labelKey: 'nav.fleetCommand', isLive: true },
  { to: '/admin/explorer', icon: Blocks, labelKey: 'nav.ledgerExplorer' },
];
