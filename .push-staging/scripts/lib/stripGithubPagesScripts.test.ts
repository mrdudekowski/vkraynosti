import { describe, expect, it } from 'vitest';
import {
  isTimewebAppBuild,
  stripGithubPages404RedirectScript,
  stripGithubPagesSpaRedirectScript,
} from './stripGithubPagesScripts.ts';

const ghIndexScript = `<script>
      // GitHub Pages SPA: restore path encoded by 404.html
      (function (l) { if (!l.search) return; }(window.location));
    </script>`;

describe('stripGithubPagesSpaRedirectScript', () => {
  it('removes GitHub Pages restore script block', () => {
    const html = `<head>${ghIndexScript}<title>x</title></head>`;
    expect(stripGithubPagesSpaRedirectScript(html)).not.toContain('GitHub Pages SPA');
    expect(stripGithubPagesSpaRedirectScript(html)).toContain('<title>x</title>');
  });
});

describe('stripGithubPages404RedirectScript', () => {
  it('removes 404 redirect script', () => {
    const html = `<head><script>// GitHub Pages SPA redirect: encode</script></head>`;
    expect(stripGithubPages404RedirectScript(html)).not.toContain('SPA redirect');
  });
});

describe('isTimewebAppBuild', () => {
  it('returns true for root base path', () => {
    expect(isTimewebAppBuild({ VITE_BASE_PATH: '/' })).toBe(true);
  });

  it('returns false for GitHub Pages base path', () => {
    expect(isTimewebAppBuild({ VITE_BASE_PATH: '/vkraynosti/' })).toBe(false);
  });
});
