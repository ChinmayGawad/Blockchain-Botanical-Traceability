import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  reportError,
  getBufferedErrorReports,
  installGlobalErrorHandlers,
} from '../../src/services/errorReporting';

describe('errorReporting', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('captures the message, name and stack of an Error', () => {
    const error = new Error('Provenance lookup failed');

    const report = reportError(error, { component: 'VerifyProductPage' });

    expect(report.name).toBe('Error');
    expect(report.message).toBe('Provenance lookup failed');
    expect(report.stack).toContain('Error');
    expect(report.context.component).toBe('VerifyProductPage');
  });

  it('falls back to a serialisable message for non Error values', () => {
    const report = reportError('something broke', { component: 'test' });

    expect(report.message).toBe('something broke');
    expect(report.name).toBe('UnknownError');
  });

  it('records the current route when no route is supplied', () => {
    const report = reportError(new Error('routing failure'));

    expect(report.context.route).toBe(window.location.pathname);
  });

  it('buffers reports for later inspection', () => {
    reportError(new Error('buffered one'));

    const buffered = getBufferedErrorReports();

    expect(buffered.length).toBeGreaterThan(0);
    expect(buffered.some(entry => entry.message === 'buffered one')).toBe(true);
  });

  it('reports uncaught errors and unhandled rejections globally', () => {
    installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent('error', { message: 'global failure' }));
    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(),
        reason: new Error('rejected'),
      }),
    );

    const messages = getBufferedErrorReports().map(entry => entry.message);

    expect(messages).toContain('global failure');
    expect(messages).toContain('rejected');
  });
});
