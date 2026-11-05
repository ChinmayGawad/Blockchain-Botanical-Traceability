import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ROLE_NAV_LINKS } from '../../config/navigation';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = ROLE_NAV_LINKS[role].map(link => ({
    ...link,
    label: t(link.labelKey),
  }));

  return (
    <>
      {/* ── Mobile & Tablet Sticky Horizontal Sub-Navigation (< lg) ── */}
      <div className="lg:hidden w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-[100px] z-30 shadow-2xs">
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`
                }
              >
                <Icon size={14} className="shrink-0" aria-hidden="true" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Fixed Docked Sidebar (>= lg) ── */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex-col justify-between shrink-0 border-r border-slate-200/90 dark:border-slate-800 fixed top-[96px] bottom-0 left-0 overflow-y-auto shadow-xs z-30">
        {/* Upper Section */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* Stakeholder Identity Node Badge */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800 dark:to-emerald-900/20 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-3">
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
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h4>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true"></span>
                {t('sidebar.nodeActive', '{{role}} Node Active', { role })}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {currentUser.organization}
              </div>
            </div>
          </div>

          {/* Navigation Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {t('sidebar.nodeNavigation', '{{role}} Navigation', { role })}
            </div>
            <nav className="space-y-1" aria-label={t('sidebar.nodeNavigation', '{{role}} Navigation', { role })}>
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-100 border border-emerald-300/80 dark:border-emerald-700 shadow-2xs font-extrabold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-700 before:rounded-r'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs font-bold bg-slate-50/50 dark:bg-slate-900/50">
          <NavLink
            to="/verify"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" /> {t('nav.verifyBatch')}
            </span>
            <ExternalLink size={13} className="text-slate-400" aria-hidden="true" />
          </NavLink>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>{t('nav.signOut')} ({role})</span>
          </button>
        </div>
      </aside>
    </>
  );
};
