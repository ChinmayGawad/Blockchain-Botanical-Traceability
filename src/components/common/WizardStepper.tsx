import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { WizardStepDefinition } from '../../hooks/useWizardNavigation';

export type WizardThemeColor = 'emerald' | 'purple' | 'indigo' | 'sky';

export interface WizardStepperProps {
  steps: WizardStepDefinition[];
  currentStep: number;
  isStepComplete: (stepNum: number) => boolean;
  canNavigateToStep: (targetStep: number) => { allowed: boolean; reason?: string };
  onTabClick: (targetStep: number) => void;
  theme?: WizardThemeColor;
  ariaLabel?: string;
  className?: string;
}

const THEME_CLASSES: Record<
  WizardThemeColor,
  {
    active: string;
    complete: string;
    completeIcon: string;
    completeBadge: string;
    progressFill: string;
    focusRing: string;
  }
> = {
  emerald: {
    active: 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 ring-2 ring-emerald-500/40 font-bold cursor-default',
    complete: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100/80 hover:border-emerald-300 font-semibold cursor-pointer',
    completeIcon: 'text-emerald-700 group-hover:scale-110',
    completeBadge: 'bg-emerald-100 text-emerald-700',
    progressFill: 'bg-emerald-600',
    focusRing: 'focus-visible:ring-emerald-500',
  },
  purple: {
    active: 'bg-purple-600 text-white shadow-md shadow-purple-700/20 ring-2 ring-purple-500/40 font-bold cursor-default',
    complete: 'bg-purple-50 text-purple-800 border border-purple-200/90 hover:bg-purple-100/80 hover:border-purple-300 font-semibold cursor-pointer',
    completeIcon: 'text-purple-700 group-hover:scale-110',
    completeBadge: 'bg-purple-100 text-purple-700',
    progressFill: 'bg-purple-600',
    focusRing: 'focus-visible:ring-purple-500',
  },
  indigo: {
    active: 'bg-indigo-600 text-white shadow-md shadow-indigo-700/20 ring-2 ring-indigo-500/40 font-bold cursor-default',
    complete: 'bg-indigo-50 text-indigo-800 border border-indigo-200/90 hover:bg-indigo-100/80 hover:border-indigo-300 font-semibold cursor-pointer',
    completeIcon: 'text-indigo-700 group-hover:scale-110',
    completeBadge: 'bg-indigo-100 text-indigo-700',
    progressFill: 'bg-indigo-600',
    focusRing: 'focus-visible:ring-indigo-500',
  },
  sky: {
    active: 'bg-sky-600 text-white shadow-md shadow-sky-700/20 ring-2 ring-sky-500/40 font-bold cursor-default',
    complete: 'bg-sky-50 text-sky-800 border border-sky-200/90 hover:bg-sky-100/80 hover:border-sky-300 font-semibold cursor-pointer',
    completeIcon: 'text-sky-700 group-hover:scale-110',
    completeBadge: 'bg-sky-100 text-sky-700',
    progressFill: 'bg-sky-600',
    focusRing: 'focus-visible:ring-sky-500',
  },
};

export const WizardStepper: React.FC<WizardStepperProps> = ({
  steps,
  currentStep,
  isStepComplete,
  canNavigateToStep,
  onTabClick,
  theme = 'emerald',
  ariaLabel = 'Workflow Steps',
  className = '',
}) => {
  const currentStepInfo = steps.find(item => item.id === currentStep);
  const themeStyle = THEME_CLASSES[theme] || THEME_CLASSES.emerald;

  return (
    <nav
      aria-label={ariaLabel}
      className={`bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2 ${className}`}
    >
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {steps.map(s => {
          const isActive = currentStep === s.id;
          const isComplete = isStepComplete(s.id);
          const IconComponent = s.icon;
          const navCheck = canNavigateToStep(s.id);
          const isAccessible = navCheck.allowed;

          let buttonClasses = `relative flex flex-col items-center justify-center py-2.5 px-1 sm:px-2 rounded-xl transition-all duration-200 group text-center select-none focus:outline-none focus-visible:ring-2 ${themeStyle.focusRing} focus-visible:ring-offset-2 `;

          if (isActive) {
            buttonClasses += themeStyle.active;
          } else if (isComplete) {
            buttonClasses += themeStyle.complete;
          } else if (isAccessible) {
            buttonClasses += 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-300 font-medium cursor-pointer';
          } else {
            buttonClasses += 'bg-slate-50/60 text-slate-400 border border-dashed border-slate-200 cursor-not-allowed opacity-60';
          }

          let iconClasses = 'transition-transform duration-200 ';
          if (isActive) {
            iconClasses += 'text-white';
          } else if (isComplete) {
            iconClasses += themeStyle.completeIcon;
          } else if (isAccessible) {
            iconClasses += 'text-slate-400 group-hover:text-slate-600 group-hover:scale-110';
          } else {
            iconClasses += 'text-slate-300';
          }

          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`step-tab-${s.id}`}
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              aria-disabled={!isAccessible}
              onClick={() => onTabClick(s.id)}
              title={!isAccessible ? navCheck.reason : undefined}
              className={buttonClasses}
            >
              {/* Top Row: Icon + State Badge */}
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <IconComponent size={15} className={iconClasses} />
                {isComplete && !isActive && (
                  <CheckCircle2 size={12} className={themeStyle.completeIcon.split(' ')[0]} />
                )}
                {!isAccessible && (
                  <Lock size={11} className="text-slate-400 shrink-0" />
                )}
              </div>

              {/* Label: Short label on mobile, full label on larger displays */}
              <span className="text-[10px] sm:text-xs tracking-tight line-clamp-1">
                <span className="sm:hidden">{s.shortLabel || s.label}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>

              {/* Completed check pill badge */}
              {isComplete && !isActive && (
                <span className={`hidden md:inline-block text-[9px] px-1.5 py-0.2 mt-0.5 rounded-full font-bold ${themeStyle.completeBadge}`}>
                  Done
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stepper info footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 px-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-800">
            {currentStepInfo?.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-slate-400 text-[10px]">
            Click previous tabs to edit anytime • Next tabs unlock once current step is complete
          </span>
          <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${themeStyle.progressFill} transition-all duration-300`}
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
