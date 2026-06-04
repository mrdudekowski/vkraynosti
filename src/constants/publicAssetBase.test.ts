import { describe, expect, it } from 'vitest';
import {
  joinMediaAssetBase,
  normalizeAssetBase,
  resolveMediaAssetUrl,
  stripLegacyDeployPrefix,
} from './publicAssetBase';

describe('normalizeAssetBase', () => {
  it('ensures trailing slash', () => {
    expect(normalizeAssetBase('/vkraynosti/')).toBe('/vkraynosti/');
    expect(normalizeAssetBase('/vkraynosti')).toBe('/vkraynosti/');
    expect(normalizeAssetBase('https://cdn.example.com')).toBe('https://cdn.example.com/');
  });
});

describe('stripLegacyDeployPrefix', () => {
  it('removes /vkraynosti/ deploy prefix', () => {
    expect(stripLegacyDeployPrefix('/vkraynosti/tours/fall-1/cover.webp')).toBe(
      '/tours/fall-1/cover.webp'
    );
  });

  it('leaves logical paths unchanged', () => {
    expect(stripLegacyDeployPrefix('/tours/spring-3/hero.webp')).toBe('/tours/spring-3/hero.webp');
  });
});

describe('joinMediaAssetBase', () => {
  it('joins base with logical tour path', () => {
    expect(joinMediaAssetBase('/vkraynosti/', '/tours/fall-1/cover.webp')).toBe(
      '/vkraynosti/tours/fall-1/cover.webp'
    );
  });

  it('strips legacy prefix before join', () => {
    expect(joinMediaAssetBase('https://cdn.example.com/', '/vkraynosti/tours/fall-1/cover.webp')).toBe(
      'https://cdn.example.com/tours/fall-1/cover.webp'
    );
  });
});

describe('resolveMediaAssetUrl', () => {
  it('passes through absolute http(s) URLs', () => {
    const url = 'https://cdn.example.com/tours/fall-1/cover.webp';
    expect(resolveMediaAssetUrl(url)).toBe(url);
  });

  it('resolves logical path with current MEDIA_ASSET_BASE (vitest BASE_URL is /)', () => {
    expect(resolveMediaAssetUrl('/tours/spring-1/hero.webp')).toBe('/tours/spring-1/hero.webp');
  });
});
