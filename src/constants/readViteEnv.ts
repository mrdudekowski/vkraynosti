/**
 * Read Vite env from import.meta.env (browser, vitest, Vite SSR scripts).
 * Node build scripts without Vite should call setupOgShellBuildEnv() before importing app modules.
 */
export function readViteEnv(key: string): string | undefined {
  const env = import.meta.env;
  if (env == null) {
    return undefined;
  }

  const raw = env[key as keyof ImportMetaEnv];
  if (typeof raw !== 'string') {
    return undefined;
  }

  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
