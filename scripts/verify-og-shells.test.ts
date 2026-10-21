import { describe, expect, it } from 'vitest';
import { assertSingleTags } from './verify-og-shells.ts';

const coreTags = `
  <title>Safety</title>
  <meta name="description" content="Safety rules" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="https://vkraynosti.ru/safety/" />`;

describe('verify-og-shells social metadata rules', () => {
  it('accepts Safety core SEO tags without social tags', () => {
    const errors: string[] = [];
    assertSingleTags(coreTags, '/safety', errors, false);
    expect(errors).toEqual([]);
  });

  it('rejects social tags on Safety', () => {
    const errors: string[] = [];
    assertSingleTags(`${coreTags}<meta property="og:title" content="Safety" />`, '/safety', errors, false);
    expect(errors).toContain('unexpected Open Graph metadata');
  });

  it('continues requiring social tags on ordinary pages', () => {
    const errors: string[] = [];
    assertSingleTags(coreTags, '/', errors);
    expect(errors).toContain('missing property="og:title"');
    expect(errors).toContain('missing name="twitter:card"');
  });
});
