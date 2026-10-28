import { SEO_SHELL_TAG_ATTRIBUTE } from '../constants/seo';

/**
 * Drop data-SSG / OG-shell head tags after react-helmet-async has written replacements.
 * Only elements marked `data-seo-shell` are removed. Helmet's React 19 tags do not
 * carry that attribute, and stripping every description/OG tag deletes the live head.
 * Keep selectors aligned with `stripOgShellMetaFromHead` in scripts/lib/renderOgShellHead.ts.
 */
export function stripBuildTimeSeoHead(doc: Document = document): void {
  doc.head.querySelectorAll(`[${SEO_SHELL_TAG_ATTRIBUTE}]`).forEach((node) => {
    node.remove();
  });
}
