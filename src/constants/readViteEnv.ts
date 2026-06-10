/**
 * Read Vite env in browser/vitest (import.meta.env) or Node build scripts (process.env).
 * When import.meta.env exists, process.env is ignored so vitest stubs stay authoritative.
 */
export function readViteEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env != null) {
    const raw = import.meta.env[key as keyof ImportMetaEnv];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }
    return undefined;
  }

  if (typeof process !== 'undefined') {
    const fromProcess = process.env[key]?.trim();
    if (fromProcess != null && fromProcess.length > 0) {
      return fromProcess;
    }
  }

  return undefined;
}
