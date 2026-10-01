import React, { useState, useCallback } from 'react';
import { LucideIcon } from 'lucide-react';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardStepDefinition {
  id: number;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
}

export interface UseWizardNavigationOptions {
  totalSteps?: number;
  steps: WizardStepDefinition[];
  isStepComplete: (step: number) => boolean;
  initialStep?: number;
}

export interface UseWizardNavigationReturn {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  visitedSteps: Set<number>;
  validationError: string | null;
  setValidationError: React.Dispatch<React.SetStateAction<string | null>>;
  clearValidationError: () => void;
  canNavigateToStep: (targetStep: number) => { allowed: boolean; reason?: string };
  handleTabClick: (targetStep: number) => void;
  handleNext: (e?: React.FormEvent) => boolean;
  handleBack: () => void;
  markStepVisited: (stepNum: number) => void;
}

/**
 * Reusable navigation state machine for multi-step wizard workflows.
 * Enforces free backward navigation while strictly gating forward progress.
 */
export function useWizardNavigation({
  totalSteps = 5,
  steps,
  isStepComplete,
  initialStep = 1,
}: UseWizardNavigationOptions): UseWizardNavigationReturn {
  const [step, setStep] = useState<number>(initialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([initialStep]));
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const canNavigateToStep = useCallback(
    (targetStep: number): { allowed: boolean; reason?: string } => {
      // Free backward navigation
      if (targetStep <= step) return { allowed: true };

      // Gated forward navigation: verify all steps prior to targetStep are completed
      for (let s = 1; s < targetStep; s++) {
        if (!isStepComplete(s)) {
          const stepInfo = steps.find(item => item.id === s);
          const targetInfo = steps.find(item => item.id === targetStep);
          return {
            allowed: false,
            reason: `Please complete Step ${s} (${stepInfo?.label || 'Previous Step'}) before advancing to Step ${targetStep} (${targetInfo?.label || 'Target Step'}).`,
          };
        }
      }
      return { allowed: true };
    },
    [step, isStepComplete, steps]
  );

  const handleTabClick = useCallback(
    (targetStep: number) => {
      if (targetStep === step) return;
      const check = canNavigateToStep(targetStep);
      if (!check.allowed) {
        setValidationError(check.reason || 'Please fill in the required fields on the current tab first.');
        return;
      }
      setValidationError(null);
      setVisitedSteps(prev => new Set([...prev, targetStep]));
      setStep(targetStep);
    },
    [step, canNavigateToStep]
  );

  const handleNext = useCallback(
    (e?: React.FormEvent): boolean => {
      if (e) {
        e.preventDefault();
      }
      if (!isStepComplete(step)) {
        setValidationError('Please complete the required fields in the current step before proceeding.');
        return false;
      }
      setValidationError(null);
      const nextStep = Math.min(totalSteps, step + 1);
      setVisitedSteps(prev => new Set([...prev, nextStep]));
      setStep(nextStep);
      return true;
    },
    [step, isStepComplete, totalSteps]
  );

  const handleBack = useCallback(() => {
    setValidationError(null);
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const markStepVisited = useCallback((stepNum: number) => {
    setVisitedSteps(prev => new Set([...prev, stepNum]));
  }, []);

  return {
    step,
    setStep,
    visitedSteps,
    validationError,
    setValidationError,
    clearValidationError,
    canNavigateToStep,
    handleTabClick,
    handleNext,
    handleBack,
    markStepVisited,
  };
}
