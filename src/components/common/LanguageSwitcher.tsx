import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, AppLanguage } from '../../i18n';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'ticker' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language?.slice(0, 2) as AppLanguage) || 'en';
  const activeOption = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: AppLanguage) => {
    if (code !== currentLang) {
      setRotation(prev => prev + 360);
    }
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Mobile drawer full-width variant
  if (variant === 'mobile') {
    return (
      <div className={`p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-1">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <Languages size={15} className="text-emerald-700" />
          </motion.div>
          <span>Select Language / भाषा निवडा</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <motion.button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                type="button"
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span className="text-sm mb-0.5">{lang.flag}</span>
                <span className="text-[11px] leading-tight font-semibold">{lang.nativeName}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Ticker (top-bar) variant
  if (variant === 'ticker') {
    return (
      <div className={`relative shrink-0 ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg px-2 py-0.5 text-[11px] sm:text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          title="Switch Platform Language"
          aria-label="Switch Language"
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <Languages size={11} className="text-emerald-400 shrink-0" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={activeOption.code}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="truncate"
            >
              {activeOption.nativeName}
            </motion.span>
          </AnimatePresence>
          <ChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
            >
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900/60 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                      >
                        <Check size={12} className="text-emerald-400" />
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard Navbar dropdown variant
  return (
    <div className={`relative shrink-0 ${className}`} ref={containerRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs group"
        title="Change Language / भाषा बदला"
        aria-label="Change Language"
      >
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="flex items-center justify-center shrink-0"
        >
          <Languages size={15} className="text-emerald-700 group-hover:scale-105 transition-transform" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={activeOption.code}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="hidden sm:inline font-semibold"
          >
            {activeOption.nativeName}
          </motion.span>
        </AnimatePresence>

        <span className="sm:hidden font-mono uppercase text-[11px]">{activeOption.code}</span>
        <ChevronDown size={13} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-1.5 space-y-0.5"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 mb-1">
              Select Language
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  type="button"
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-600 font-normal">({lang.label})</span>
                  </span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Check size={14} className="text-emerald-700 shrink-0" />
                    </motion.span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
