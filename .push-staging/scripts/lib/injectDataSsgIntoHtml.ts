/** Inject data-SSG body into the SPA shell and append JSON-LD to `<head>`. */
export function injectDataSsgIntoHtml(
  templateHtml: string,
  {
    bodyHtml,
    structuredData,
    tourScheduleBootstrapJson,
  }: {
    bodyHtml: string;
    structuredData: ReadonlyArray<Record<string, unknown>>;
    tourScheduleBootstrapJson?: string;
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

  const bootstrapBlock =
    tourScheduleBootstrapJson != null && tourScheduleBootstrapJson.length > 0
      ? `<script type="application/json" id="tour-schedule-bootstrap">${tourScheduleBootstrapJson}</script>\n      `
      : '';

  const jsonLdBlock =
    structuredData.length === 0
      ? ''
      : structuredData
          .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
          .join('\n      ');

  const headInjection = `${bootstrapBlock}${jsonLdBlock}`;
  if (headInjection.length === 0) {
    return withoutJsonLd;
  }

  return withoutJsonLd.replace('</head>', `${headInjection}\n  </head>`);
}
