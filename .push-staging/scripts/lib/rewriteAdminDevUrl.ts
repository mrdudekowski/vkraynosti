/**
 * Dev: `/vkraynosti/admin/` must not hit the tourist SPA fallback.
 * Physical MPA file is served at `/admin/index.html`.
 * Match both the Vite `base` prefix and the repo default `/vkraynosti`,
 * because localhost may run with `VITE_BASE_PATH=/`.
 */
export function rewriteAdminDevUrl(url: string, basePath: string): string {
  const queryIndex = url.indexOf('?');
  const pathname = queryIndex >= 0 ? url.slice(0, queryIndex) : url;
  const search = queryIndex >= 0 ? url.slice(queryIndex) : '';

  const adminRoots = new Set<string>(['/vkraynosti/admin']);
  const trimmedBase = basePath.replace(/\/+$/, '');
  if (trimmedBase.length > 0) {
    adminRoots.add(`${trimmedBase}/admin`);
  }

  const underAdmin = [...adminRoots].some(
    (root) =>
      pathname === root || pathname === `${root}/` || pathname.startsWith(`${root}/`)
  );
  if (!underAdmin) {
    return url;
  }

  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    return url;
  }

  return `/admin/index.html${search}`;
}
