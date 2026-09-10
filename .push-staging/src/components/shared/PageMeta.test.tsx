import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import PageMeta from './PageMeta';

const renderPageMeta = () =>
  render(
    <HelmetProvider>
      <PageMeta
        title="Test title"
        description="Test description"
        path="/"
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
