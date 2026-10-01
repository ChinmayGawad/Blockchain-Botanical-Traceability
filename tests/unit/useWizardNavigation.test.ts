import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWizardNavigation, WizardStepDefinition } from '../../src/hooks/useWizardNavigation';
import { Package, Cog, Scale, FileCheck, Blocks } from 'lucide-react';

const mockSteps: WizardStepDefinition[] = [
  { id: 1, label: 'Step 1', shortLabel: 'One', icon: Package },
  { id: 2, label: 'Step 2', shortLabel: 'Two', icon: Cog },
  { id: 3, label: 'Step 3', shortLabel: 'Three', icon: Scale },
  { id: 4, label: 'Step 4', shortLabel: 'Four', icon: FileCheck },
  { id: 5, label: 'Step 5', shortLabel: 'Five', icon: Blocks },
];

describe('useWizardNavigation Hook', () => {
  it('initializes with default step 1 and clean state', () => {
    const isStepComplete = () => false;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
      })
    );

    expect(result.current.step).toBe(1);
    expect(result.current.visitedSteps.has(1)).toBe(true);
    expect(result.current.validationError).toBeNull();
  });

  it('allows jumping backward unconditionally', () => {
    const isStepComplete = () => true;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
        initialStep: 3,
      })
    );

    expect(result.current.step).toBe(3);

    act(() => {
      result.current.handleTabClick(1);
    });

    expect(result.current.step).toBe(1);
    expect(result.current.validationError).toBeNull();
  });

  it('blocks forward navigation if preceding steps are incomplete', () => {
    // Only step 1 complete, step 2 incomplete
    const isStepComplete = (s: number) => s === 1;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
      })
    );

    // Try to jump to step 3
    act(() => {
      result.current.handleTabClick(3);
    });

    // Should remain on step 1 and display validation error
    expect(result.current.step).toBe(1);
    expect(result.current.validationError).toContain('Please complete Step 2');
  });

  it('advances forward with handleNext when current step is complete', () => {
    const isStepComplete = () => true;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
      })
    );

    let advanced = false;
    act(() => {
      advanced = result.current.handleNext();
    });

    expect(advanced).toBe(true);
    expect(result.current.step).toBe(2);
    expect(result.current.visitedSteps.has(2)).toBe(true);
  });

  it('blocks handleNext when current step is incomplete', () => {
    const isStepComplete = () => false;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
      })
    );

    let advanced = true;
    act(() => {
      advanced = result.current.handleNext();
    });

    expect(advanced).toBe(false);
    expect(result.current.step).toBe(1);
    expect(result.current.validationError).toContain('Please complete the required fields');
  });

  it('handles step back without decrementing below 1', () => {
    const isStepComplete = () => true;
    const { result } = renderHook(() =>
      useWizardNavigation({
        steps: mockSteps,
        isStepComplete,
      })
    );

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.step).toBe(1);
  });
});
