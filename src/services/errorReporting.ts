/**
 * Centralised frontend error reporting.
 *
 * Errors are always logged to the console in a structured shape. When
 * `VITE_ERROR_REPORTING_URL` is configured the report is additionally shipped to
 * that collector (fire and forget, never blocking the UI). Without a collector
 * the reports are kept in a small in-memory ring buffer so they can be inspected
 * during support sessions.
 */

export interface ErrorReportContext {
  /** Logical component or feature that produced the error. */
  component?: string;
  /** Route the user was on. */
  route?: string;
  /** Authenticated user, when known. */
  userId?: string;
  /** Additional structured metadata. */
  extra?: Record<string, unknown>;
}

interface ErrorReport {
  message: string;
  name: string;
  stack?: string;
  timestamp: string;
  context: ErrorReportContext;
}

const MAX_BUFFERED_REPORTS = 50;
const buffer: ErrorReport[] = [];

const reportingUrl = (): string | undefined => {
  const url = import.meta.env?.VITE_ERROR_REPORTING_URL;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
};

const currentRoute = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window.location?.pathname;
};

const toMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const toStack = (error: unknown): string | undefined => {
  return error instanceof Error && typeof error.stack === 'string' ? error.stack : undefined;
};

/**
 * Reports an error to the console and, when configured, to the remote collector.
 */
export function reportError(error: unknown, context: ErrorReportContext = {}): ErrorReport {
  const report: ErrorReport = {
    message: toMessage(error),
    name: error instanceof Error ? error.name : 'UnknownError',
    stack: toStack(error),
    timestamp: new Date().toISOString(),
    context: {
      ...context,
      route: context.route ?? currentRoute(),
    },
  };

  buffer.push(report);
  if (buffer.length > MAX_BUFFERED_REPORTS) {
    buffer.shift();
  }

  // eslint-disable-next-line no-console
  console.error('[FloraChain] Unhandled error reported', report);

  const url = reportingUrl();
  if (url && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const payload = JSON.stringify(report);
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } catch {
      // Reporting must never break the application.
    }
  }

  return report;
}

/**
 * Returns the buffered reports (most recent last). Useful for support tooling.
 */
export function getBufferedErrorReports(): ErrorReport[] {
  return [...buffer];
}

/**
 * Installs global handlers for uncaught errors and unhandled promise rejections.
 * Safe to call more than once.
 */
export function installGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event: ErrorEvent) => {
    reportError(event.error ?? event.message, { component: 'window.onerror' });
  });

  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    reportError(event.reason, { component: 'unhandledrejection' });
  });
}
