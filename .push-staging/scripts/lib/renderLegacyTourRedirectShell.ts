import { escapeHtml } from './renderOgShellHead.ts';

export const renderLegacyTourRedirectShell = (
  canonicalUrl: string,
  title: string,
): string => `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
<meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
<meta name="robots" content="noindex,follow" />
<script>location.replace(${JSON.stringify(canonicalUrl)})</script>
</head>
<body></body>
</html>
`;
