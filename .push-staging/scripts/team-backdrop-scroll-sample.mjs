/**
 * Одноразовый сэмплер progress/opacity при скролле к #team (фаза 1 debug).
 * Запуск: node scripts/team-backdrop-scroll-sample.mjs
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5176/vkraynosti/';
const START = 0.95;
const END = 0.42;

function fadeIn(teamTop, vh) {
  const startY = vh * START;
  const endY = vh * END;
  const denom = startY - endY;
  if (denom <= 0) return 1;
  return Math.max(0, Math.min(1, (startY - teamTop) / denom));
}

async function samplePage(page, label) {
  const s = await page.evaluate(() => {
    const vh = window.innerHeight;
    const team = document.getElementById('team');
    const contact = document.getElementById('contact');
    const backdrop = document.querySelector('.z-home-team-backdrop');
    const sky = document.querySelector('.top-home-sky-parallax-inner');
    const teamTop = team?.getBoundingClientRect().top ?? null;
    const contactTop = contact?.getBoundingClientRect().top ?? null;
    const opacity = backdrop ? parseFloat(getComputedStyle(backdrop).opacity) : null;
    const skyTransform = sky ? getComputedStyle(sky).transform : null;
    return {
      vh,
      vv: window.visualViewport?.height ?? null,
      teamTop,
      contactTop,
      opacity,
      skyTransform,
      scrollY: window.scrollY,
    };
  });
  return {
    label,
    ...s,
    expectedFadeIn: s.teamTop != null ? fadeIn(s.teamTop, s.vh) : null,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);

const samples = [];

// Подводим #team к зоне fade-in (верх секции ≈ 70% viewport)
await page.evaluate(() => {
  const team = document.getElementById('team');
  if (!team) return;
  const rect = team.getBoundingClientRect();
  const targetY = window.scrollY + rect.top - window.innerHeight * 0.7;
  window.scrollTo({ top: Math.max(0, targetY), behavior: 'instant' });
});
await page.waitForTimeout(400);
samples.push(await samplePage(page, 'pre-fade'));

for (let i = 0; i < 25; i++) {
  await page.evaluate(() => window.scrollBy({ top: 40, behavior: 'instant' }));
  await page.waitForTimeout(100);
  const s = await samplePage(page, `step-${i + 1}`);
  samples.push(s);
  if (s.opacity != null && s.opacity >= 1) break;
}

const fadeZone = samples.filter((s) => s.opacity > 0 && s.opacity < 1);
console.log('--- fade zone samples ---');
console.log(JSON.stringify(fadeZone.length ? fadeZone : samples.slice(-8), null, 2));
await browser.close();
