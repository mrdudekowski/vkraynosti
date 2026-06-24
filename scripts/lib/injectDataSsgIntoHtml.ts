/** Inject data-SSG body into the SPA shell and append JSON-LD to `<head>`. */
export function injectDataSsgIntoHtml(
  templateHtml: string,
  {
    bodyHtml,
    structuredData,
  }: {
    bodyHtml: string;
    structuredData: ReadonlyArray<Record<string, unknown>>;
  },
): string {
  const withBody = templateHtml.replace(
    /<div\s+id="root">\s*<\/div>/i,
    `<div id="root">${bodyHtml}</div>`,
  );

  const withoutJsonLd = withBody.replace(
    /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,
    '',
  );

  if (structuredData.length === 0) {
    return withoutJsonLd;
  }

  const jsonLdBlock = structuredData
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n      ');

  return withoutJsonLd.replace('</head>', `${jsonLdBlock}\n  </head>`);
}
