import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import PageMeta from './PageMeta';

const renderPageMeta = (includeSocialMetadata?: boolean) =>
  render(
    <HelmetProvider>
      <PageMeta
        title="Test title"
        description="Test description"
        path="/"
        includeSocialMetadata={includeSocialMetadata}
        preloadHeroImageUrl="/hero.webp"
        priorityVideoPreloads={[{ href: '/clip.webm', fetchPriority: 'low' }]}
      />
    </HelmetProvider>
  );

describe('PageMeta preload priority', () => {
  it('keeps hero image preload high and before video preloads', async () => {
    renderPageMeta();

    await waitFor(() => {
      expect(document.head.querySelector('link[rel="preload"][as="image"]')).toBeInTheDocument();
      expect(document.head.querySelector('link[rel="preload"][as="video"]')).toBeInTheDocument();
    });

    const preloadLinks = Array.from(
      document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')
    );
    const heroPreload = preloadLinks.find(link => link.getAttribute('as') === 'image');
    const videoPreload = preloadLinks.find(link => link.getAttribute('as') === 'video');

    expect(heroPreload).toBeDefined();
    expect(videoPreload).toBeDefined();
    expect(heroPreload?.href).toContain('/hero.webp');
    expect(heroPreload?.getAttribute('fetchpriority')).toBe('high');
    expect(videoPreload?.href).toContain('/clip.webm');
    expect(videoPreload?.getAttribute('fetchpriority')).toBe('low');
    expect(preloadLinks.indexOf(heroPreload!)).toBeLessThan(preloadLinks.indexOf(videoPreload!));
  });
});

describe('PageMeta social metadata', () => {
  it('keeps existing social metadata enabled by default', async () => {
    renderPageMeta();

    await waitFor(() => {
      expect(document.head.querySelector('meta[property="og:title"]')).toBeInTheDocument();
      expect(document.head.querySelector('meta[name="twitter:card"]')).toBeInTheDocument();
    });
  });

  it('drops the shell social tags once Helmet has written the live ones', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      `
      <meta data-seo-shell="true" name="description" content="Build description" />
      <meta data-seo-shell="true" property="og:image" content="https://cdn.example.com/old.jpg" />
      <meta data-seo-shell="true" name="twitter:card" content="summary" />
      `,
    );
    renderPageMeta();

    await waitFor(() => {
      expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
      expect(document.head.querySelectorAll('meta[property="og:image"]')).toHaveLength(1);
      expect(document.head.querySelectorAll('meta[name="twitter:card"]')).toHaveLength(1);
    });

    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Test description',
    );
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).not.toBe(
      'https://cdn.example.com/old.jpg',
    );
  });

  it('retains core SEO metadata and omits social metadata when disabled', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<meta data-seo-shell="true" property="og:title" content="Shell title" />',
    );
    renderPageMeta(false);

    await waitFor(() => {
      expect(document.head.querySelector('title')?.textContent).toBe('Test title');
      expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Test description');
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index,follow');
      expect(document.head.querySelector('link[rel="canonical"]')).toBeInTheDocument();
    });

    expect(document.head.querySelector('meta[property^="og:"]')).not.toBeInTheDocument();
    expect(document.head.querySelector('meta[name^="twitter:"]')).not.toBeInTheDocument();
  });
});
