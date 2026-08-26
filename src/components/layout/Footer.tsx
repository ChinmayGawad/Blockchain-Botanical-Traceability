import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Blocks, Database, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sprout size={18} />
              </div>
              <span className="text-base font-extrabold text-white">
                Flora<span className="text-emerald-400">Chain</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized botanical supply chain provenance and verification platform powered by Hyperledger Fabric, IPFS, and Spring Boot.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Ledger Channel: botanical-provenance-channel
            </div>
          </div>

          {/* Quick Verification Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Consumer Verification
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/verify/BOT-2024-8901" className="hover:text-emerald-400 transition-colors">
                  Sample: Organic Ashwagandha Root
                </Link>
              </li>
              <li>
                <Link to="/verify/BOT-2024-4412" className="hover:text-emerald-400 transition-colors">
                  Sample: Lakadong Turmeric 8.4%
                </Link>
              </li>
              <li>
                <Link to="/verify/BOT-2024-9981" className="hover:text-rose-400 transition-colors text-rose-400/80">
                  Sample: QA Flagged Neem Batch
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-emerald-400 transition-colors">
                  Scan QR / Search Product ID
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholder Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Supply Chain Stakeholders
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/farmer/dashboard" className="hover:text-emerald-400 transition-colors">
                  Farmer Registration Portal
                </Link>
              </li>
              <li>
                <Link to="/processor/dashboard" className="hover:text-purple-400 transition-colors">
                  Processor Bio-Refining Node
                </Link>
              </li>
              <li>
                <Link to="/laboratory/dashboard" className="hover:text-indigo-400 transition-colors">
                  Laboratory QA Testing Station
                </Link>
              </li>
              <li>
                <Link to="/distributor/dashboard" className="hover:text-sky-400 transition-colors">
                  Cold-Chain Logistics Portal
                </Link>
              </li>
              <li>
                <Link to="/retailer/dashboard" className="hover:text-teal-400 transition-colors">
                  Retailer Inventory & QR Tags
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Consortium Architecture
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Blocks size={14} className="text-emerald-400" />
                <span>Hyperledger Fabric v2.5 Chaincode</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database size={14} className="text-blue-400" />
                <span>PostgreSQL Application State</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-400" />
                <span>IPFS Content Addressed Certificates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Endorsement Consensus Protocol</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} FloraChain Botanical Consortium. Built for complete medicinal herb provenance & customer trust.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/explorer" className="hover:text-slate-300">
              Hyperledger Explorer
            </Link>
            <Link to="/admin/approvals" className="hover:text-slate-300">
              Admin Governance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
