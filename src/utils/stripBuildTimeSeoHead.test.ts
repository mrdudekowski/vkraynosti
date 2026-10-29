import { describe, expect, it, beforeEach } from 'vitest';
import { stripBuildTimeSeoHead } from './stripBuildTimeSeoHead';

describe('stripBuildTimeSeoHead', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta data-seo-shell="true" name="description" content="Build description" />
      <meta data-seo-shell="true" name="robots" content="index,follow" />
      <link data-seo-shell="true" rel="canonical" href="https://example.com/" />
      <meta data-seo-shell="true" property="og:title" content="OG title" />
      <meta data-seo-shell="true" name="twitter:card" content="summary_large_image" />
      <meta name="color-scheme" content="light only" />
    `;
  });

  it('removes build-time SEO tags managed by PageMeta', () => {
    stripBuildTimeSeoHead();

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.head.querySelector('meta[name="twitter:card"]')).toBeNull();
    expect(document.head.querySelector('meta[name="color-scheme"]')).not.toBeNull();
  });

  it('keeps the social tags Helmet has already written', () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <meta name="description" content="Live description" />
      <meta property="og:image" content="https://vkraynosti.ru/banners_fall/fall.jpg" />
      `,
    );

    stripBuildTimeSeoHead();

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Live description',
    );
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      'https://vkraynosti.ru/banners_fall/fall.jpg',
    );
  });

  it('drops the build-time JSON-LD script and keeps the Helmet copy', () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <script type="application/ld+json" data-seo-shell="true">{"@type":"WebSite","name":"shell"}</script>
      <script type="application/ld+json">{"@type":"WebSite","name":"live"}</script>
      <script type="application/json" id="tour-schedule-bootstrap">{}</script>
      `,
    );

    stripBuildTimeSeoHead();

    const schemas = [...document.head.querySelectorAll('script[type="application/ld+json"]')];
    expect(schemas).toHaveLength(1);
    expect(schemas[0]?.textContent).toContain('"name":"live"');
    expect(document.head.querySelector('#tour-schedule-bootstrap')).not.toBeNull();
  });
});
