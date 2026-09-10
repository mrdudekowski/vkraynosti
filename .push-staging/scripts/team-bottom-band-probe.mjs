/**
 * elementFromPoint внизу viewport при скролле к #team (390×844).
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5176/vkraynosti/';

function probeAtBottom(page) {
  return page.evaluate(() => {
    const y = Math.round(window.innerHeight - 10);
    const xs = [24, Math.round(window.innerWidth / 2)];
    const backdrop = document.querySelector('.z-home-team-backdrop');
    const sky = document.querySelector('.top-home-sky-parallax-inner');
    const team = document.getElementById('team');
    const contact = document.getElementById('contact');

    function describeHit(el) {
      if (!(el instanceof HTMLElement)) return null;
      const style = getComputedStyle(el);
      return {
        tag: el.tagName,
        id: el.id,
        classes: el.className.toString().slice(0, 100),
        bg: style.backgroundColor,
        bgImage: style.backgroundImage?.slice(0, 80),
        opacity: style.opacity,
      };
    }

    const probes = xs.map((x) => {
      const stack = document.elementsFromPoint(x, y).slice(0, 6).map(describeHit);
      return { x, stack };
    });

    const skyStyle = sky ? getComputedStyle(sky) : null;
    return {
      teamTop: team?.getBoundingClientRect().top,
      teamBottom: team?.getBoundingClientRect().bottom,
      contactTop: contact?.getBoundingClientRect().top,
      backdropOpacity: backdrop ? parseFloat(getComputedStyle(backdrop).opacity) : null,
      skyTransform: sky ? skyStyle.transform : null,
      skyBgImage: skyStyle?.backgroundImage?.slice(0, 60),
      skyBgColor: skyStyle?.backgroundColor,
      probes,
    };
  });
}

const browser = await chromium.launch({ headless: true });

for (const season of ['spring', 'winter']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript((s) => {
    document.documentElement.setAttribute('data-season', s);
  }, season);
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const team = document.getElementById('team');
    if (!team) return;
    const y = window.scrollY + team.getBoundingClientRect().top - window.innerHeight * 0.88;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  });
  await page.waitForTimeout(200);
  const samples = [];
  for (let i = 0; i < 28; i++) {
    await page.evaluate(() => window.scrollBy({ top: 32, behavior: 'instant' }));
    await page.waitForTimeout(60);
    const s = await probeAtBottom(page);
    if (s.backdropOpacity > 0.2 && s.backdropOpacity < 0.75) samples.push({ step: i, season, ...s });
  }
  console.log(`\n=== ${season} (fade-zone hits) ===`);
  console.log(JSON.stringify(samples.slice(0, 6), null, 2));
  await context.close();
}

await browser.close();
