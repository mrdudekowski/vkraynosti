/**
 * A/B в зоне fade: baseline / hide / binary / parallax-off (390×844).
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5176/vkraynosti/';

const FADE_ZONE_SCROLL_Y = 6364;

async function sampleInFadeZone(page) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), FADE_ZONE_SCROLL_Y);
  await page.waitForTimeout(200);
  return page.evaluate(() => {
    const backdrop = document.querySelector('.z-home-team-backdrop');
    const team = document.getElementById('team');
    const opacity = backdrop ? parseFloat(getComputedStyle(backdrop).opacity) : null;
    return {
      teamTop: team?.getBoundingClientRect().top ?? null,
      opacity,
      display: backdrop ? getComputedStyle(backdrop).display : null,
    };
  });
}

const browser = await chromium.launch({ headless: true });
const configs = [
  { name: 'A-baseline', flags: {} },
  { name: 'B-hide-backdrop', flags: { debugTeamBackdropHide: '1' } },
  { name: 'C-binary-opacity', flags: { debugTeamBackdropBinary: '1' } },
  { name: 'D-parallax-off', flags: { debugTeamParallaxOff: '1' } },
];

const out = {};
for (const cfg of configs) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript((flags) => {
    localStorage.setItem('debugTeamBackdrop', '1');
    for (const [k, v] of Object.entries(flags)) localStorage.setItem(k, v);
  }, cfg.flags);
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  out[cfg.name] = await sampleInFadeZone(page);
  await context.close();
}

console.log(JSON.stringify(out, null, 2));
await browser.close();
