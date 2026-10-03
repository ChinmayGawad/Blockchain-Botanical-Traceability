import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LanguageSwitcher } from '../../src/components/common/LanguageSwitcher';
import i18n, { SUPPORTED_LANGUAGES } from '../../src/i18n';

describe('LanguageSwitcher Component & i18n Integration', () => {
  beforeEach(async () => {
    // Reset to English before each test
    await i18n.changeLanguage('en');
    localStorage.clear();
  });

  it('renders standard navbar switcher with current language', () => {
    render(<LanguageSwitcher variant="navbar" />);
    expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens dropdown and displays all 3 supported languages', () => {
    render(<LanguageSwitcher variant="navbar" />);
    const trigger = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Select Language')).toBeInTheDocument();
    expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    expect(screen.getByText('मराठी')).toBeInTheDocument();
  });

  it('switches language to Hindi (hi) when selected', async () => {
    render(<LanguageSwitcher variant="navbar" />);
    const trigger = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(trigger);

    const hindiBtn = screen.getByText('हिन्दी');
    fireEvent.click(hindiBtn);

    await waitFor(() => {
      expect(i18n.language).toBe('hi');
      expect(localStorage.getItem('florachain_language')).toBe('hi');
      expect(document.documentElement.lang).toBe('hi');
    });

    // Test translation output
    expect(i18n.t('nav.blockchainActive')).toBe('ब्लॉकचेन सक्रिय');
    expect(i18n.t('home.heroTitleLine1')).toBe('खेत से दुकान तक।');
    expect(i18n.t('roles.FARMER')).toBe('जैविक किसान');
  });

  it('switches language to Marathi (mr) when selected', async () => {
    render(<LanguageSwitcher variant="navbar" />);
    const trigger = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(trigger);

    const marathiBtn = screen.getByText('मराठी');
    fireEvent.click(marathiBtn);

    await waitFor(() => {
      expect(i18n.language).toBe('mr');
      expect(localStorage.getItem('florachain_language')).toBe('mr');
      expect(document.documentElement.lang).toBe('mr');
    });

    // Test translation output
    expect(i18n.t('nav.blockchainActive')).toBe('ब्लॉकचेन सक्रिय');
    expect(i18n.t('home.heroTitleLine1')).toBe('शेतातून दुकानापर्यंत।');
    expect(i18n.t('roles.FARMER')).toBe('सेंद्रिय शेतकरी');
    expect(i18n.t('nav.verifyBatch')).toBe('बॅच तपासा');
  });

  it('renders mobile drawer variant and allows direct selection', async () => {
    render(<LanguageSwitcher variant="mobile" />);
    expect(screen.getByText(/Select Language \/ भाषा निवडा/i)).toBeInTheDocument();

    const hindiButton = screen.getByRole('button', { name: /हिन्दी/i });
    fireEvent.click(hindiButton);

    await waitFor(() => {
      expect(i18n.language).toBe('hi');
    });
  });

  it('renders ticker variant and toggles dropdown', async () => {
    render(<LanguageSwitcher variant="ticker" />);
    const tickerBtn = screen.getByRole('button', { name: /switch language/i });
    expect(tickerBtn).toBeInTheDocument();

    fireEvent.click(tickerBtn);
    expect(screen.getByText('मराठी')).toBeInTheDocument();
  });
});
