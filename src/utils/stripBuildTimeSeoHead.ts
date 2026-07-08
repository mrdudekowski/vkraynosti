/**
 * Drop data-SSG / OG-shell head tags before react-helmet-async (PageMeta) mounts.
 * ponytail: static HTML keeps them for no-JS crawlers; after JS boot Helmet is SSOT.
 * Keep selectors aligned with `stripOgShellMetaFromHead` in scripts/lib/renderOgShellHead.ts.
 */
export function stripBuildTimeSeoHead(doc: Document = document): void {
  const { head } = doc;
  head.querySelectorAll('meta[name="description"]').forEach((node) => node.remove());
  head.querySelectorAll('meta[name="robots"]').forEach((node) => node.remove());
  head.querySelectorAll('link[rel="canonical"]').forEach((node) => node.remove());
  head.querySelectorAll('meta[property^="og:"]').forEach((node) => node.remove());
  head.querySelectorAll('meta[name^="twitter:"]').forEach((node) => node.remove());
}
