import { describe, expect, it, beforeEach } from 'vitest';
import { stripBuildTimeSeoHead } from './stripBuildTimeSeoHead';

describe('stripBuildTimeSeoHead', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="description" content="Build description" />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href="https://example.com/" />
      <meta property="og:title" content="OG title" />
      <meta name="twitter:card" content="summary_large_image" />
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
});
