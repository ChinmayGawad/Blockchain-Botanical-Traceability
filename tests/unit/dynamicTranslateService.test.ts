import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  translateString,
  translateSubtree,
  retranslateEntireApp,
  switchDynamicLanguage,
  initDynamicTranslation,
  getCurrentDynamicLanguage,
} from '../../src/services/dynamicTranslateService';
import { setupTranslationDOMShim } from '../../src/lib/googleTranslateShim';

describe('dynamicTranslateService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('strictly preserves the project name FloraChain in all translations', () => {
    expect(translateString('FloraChain', 'hi')).toBe('FloraChain');
    expect(translateString('FloraChain', 'mr')).toBe('FloraChain');
    expect(translateString('Supports FloraChain botanical batch QR tags & GS1 digital link data carriers', 'mr'))
      .toContain('FloraChain');
    expect(translateString('Supports FloraChain botanical batch QR tags & GS1 digital link data carriers', 'hi'))
      .toContain('FloraChain');
  });

  it('preserves cryptographic hashes and batch codes untouched', () => {
    expect(translateString('0x4a7c8e9b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a', 'hi')).toBe('0x4a7c8e9b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a');
    expect(translateString('QmTestCertificateFloraChainQA982', 'mr')).toBe('QmTestCertificateFloraChainQA982');
    expect(translateString('ASH-2024-089', 'mr')).toBe('ASH-2024-089');
    expect(translateString('BOT-2024-8901', 'hi')).toBe('BOT-2024-8901');
  });

  it('translates core UI phrases to Hindi and Marathi correctly', () => {
    expect(translateString('Connect Wallet', 'hi')).toBe('वॉलेट कनेक्ट करें');
    expect(translateString('Connect Wallet', 'mr')).toBe('वॉलेट कनेक्ट करा');

    expect(translateString('Scan Botanical QR Code', 'mr')).toBe('वनस्पती QR कोड स्कॅन करा');
    expect(translateString('Scan Botanical QR Code', 'hi')).toBe('वानस्पतिक क्यूआर कोड स्कैन करें');

    expect(translateString('ACTIVE FLEET CRYO-VANS', 'mr')).toBe('सक्रिय क्रायो-व्हॅन फ्लीट');
    expect(translateString('Verified Data Points:', 'mr')).toBe('पडताळलेले डेटा पॉईंट्स:');
    expect(translateString('COMPLETED', 'mr')).toBe('पूर्ण');
  });

  it('translates DOM subtree and restores original English upon switching back', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <h1>Scan Botanical QR Code</h1>
      <button>Connect Wallet</button>
      <span class="batch-id">ASH-2024-089</span>
    `;
    document.body.appendChild(container);

    // Switch to Marathi
    switchDynamicLanguage('mr');

    expect(container.querySelector('h1')?.textContent?.trim()).toBe('वनस्पती QR कोड स्कॅन करा');
    expect(container.querySelector('button')?.textContent?.trim()).toBe('वॉलेट कनेक्ट करा');
    expect(container.querySelector('.batch-id')?.textContent?.trim()).toBe('ASH-2024-089');

    // Switch back to English
    switchDynamicLanguage('en');

    expect(container.querySelector('h1')?.textContent?.trim()).toBe('Scan Botanical QR Code');
    expect(container.querySelector('button')?.textContent?.trim()).toBe('Connect Wallet');
    expect(container.querySelector('.batch-id')?.textContent?.trim()).toBe('ASH-2024-089');
  });

  it('translates dynamically injected modal elements in real time', () => {
    // Active language is Marathi
    switchDynamicLanguage('mr');

    // Dynamically mount a modal container into body
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <h3>Scan Botanical QR Code</h3>
      <p>Activate Camera Scanner</p>
      <span>FloraChain</span>
    `;
    document.body.appendChild(modal);

    // Explicitly run translateSubtree on new node (or observer handles it)
    translateSubtree(modal, 'mr');

    expect(modal.querySelector('h3')?.textContent?.trim()).toBe('वनस्पती QR कोड स्कॅन करा');
    expect(modal.querySelector('p')?.textContent?.trim()).toBe('कॅमेरा स्कॅनर सुरू करा');
    expect(modal.querySelector('span')?.textContent?.trim()).toBe('FloraChain');
  });

  it('stores language preference in localStorage and initializes on boot', () => {
    switchDynamicLanguage('hi');
    expect(localStorage.getItem('florachain_language')).toBe('hi');
    expect(getCurrentDynamicLanguage()).toBe('hi');
  });
});

describe('googleTranslateDOMShim', () => {
  it('installs removeChild and insertBefore monkeypatches without error', () => {
    expect(() => setupTranslationDOMShim()).not.toThrow();

    const parent = document.createElement('div');
    const child = document.createElement('span');
    const surrogate = document.createElement('font');
    parent.appendChild(surrogate);
    surrogate.appendChild(child);

    expect(() => parent.removeChild(child)).not.toThrow();
  });
});
