import { describe, expect, it } from 'vitest';
import type { OgShellMeta } from './resolveOgShellMeta.ts';
import {
  injectOgShellIntoHtml,
  renderOgShellHead,
  stripOgShellMetaFromHead,
} from './renderOgShellHead.ts';

const templateHtml = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Fallback</title>
  </head>
  <body><div id="root"></div></body>
</html>`;

const sampleMeta: OgShellMeta = {
  title: 'Tour Title — Season | Вкрайности',
  description: 'Short tour description.',
  path: '/tours/summer/summer-10',
  robots: 'index,follow',
  imagePathOrUrl: 'tours/summer-10/cover.jpg',
};

describe('injectOgShellIntoHtml idempotency', () => {
  it('does not duplicate OG tags when injected twice', () => {
    const once = injectOgShellIntoHtml(templateHtml, sampleMeta);
    const twice = injectOgShellIntoHtml(once, sampleMeta);

    expect((twice.match(/property="og:title"/g) ?? []).length).toBe(1);
    expect((twice.match(/property="og:description"/g) ?? []).length).toBe(1);
    expect((twice.match(/property="og:image"/g) ?? []).length).toBe(1);
    expect((twice.match(/property="og:image:secure_url"/g) ?? []).length).toBe(1);
    expect((twice.match(/property="og:image:width"/g) ?? []).length).toBe(1);
    expect((twice.match(/rel="canonical"/g) ?? []).length).toBe(1);
  });
});

describe('renderOgShellHead', () => {
  it('includes secure_url and image dimensions for JPEG', () => {
    const head = renderOgShellHead(sampleMeta);
    expect(head).toContain('property="og:image:secure_url"');
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:height" content="630"');
  });

  it('normalizes multiline title content', () => {
    const head = renderOgShellHead({
      ...sampleMeta,
      title: 'Line one\n| Line two',
    });
    expect(head).toContain('content="Line one | Line two"');
    expect(head).not.toMatch(/content="[^"]*\n[^"]*"/);
  });
});

describe('stripOgShellMetaFromHead', () => {
  it('removes injected shell block', () => {
    const injected = injectOgShellIntoHtml(templateHtml, sampleMeta);
    const stripped = stripOgShellMetaFromHead(injected);
    expect(stripped).not.toContain('property="og:title"');
    expect(stripped).not.toContain('rel="canonical"');
    expect(stripped).toContain('<title>Tour Title');
  });
});
