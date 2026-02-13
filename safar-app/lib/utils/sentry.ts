/**
 * Sentry Shim
 * No-op implementation until @/lib/utils/sentry is installed.
 * Replace this file with a real import once Sentry is configured.
 */

export function captureException(_error: unknown, _context?: Record<string, unknown>): void {}
export function captureMessage(_message: string, _context?: Record<string, unknown>): void {}
export function init(_options?: Record<string, unknown>): void {}
export function wrap<T>(component: T): T {
  return component;
}
