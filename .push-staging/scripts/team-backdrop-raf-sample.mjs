/**
 * RAF-сэмплинг opacity во время Lenis-скролла к #team и при быстром wheel.
 */
import { chromium, devices } from 'playwright';

const BASE = process.env.TEAM_BACKDROP_BASE ?? 'http://localhost:5174/vkraynosti/';

async function rafSampleDuring(page, triggerFn, maxMs = 4000) {
  await page.evaluate(() => {
    window.__teamBackdropSamples = [];
    window.__teamBackdropRafActive = true;
    const tick = () => {
      if (!window.__teamBackdropRafActive) return;
      const backdrop = document.querySelector('.z-home-team-backdrop');
      const team = document.getElementById('team');
      const teamTop = team?.getBoundingClientRect().top ?? null;
      const opacity = backdrop ? parseFloat(getComputedStyle(backdrop).opacity) : null;
      window.__teamBackdropSamples.push({
        t: performance.now(),
        opacity,
        teamTop,
        scrollY: window.scrollY,
        vh: window.innerHeight,
        vv: window.visualViewport?.height ?? null,
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await triggerFn(page);

  await page.waitForTimeout(maxMs);
  await page.evaluate(() => {
    window.__teamBackdropRafActive = false;
  });

  return page.evaluate(() => window.__teamBackdropSamples ?? []);
}

function analyze(samples, label) {
  const valid = samples.filter((s) => s.opacity != null);
  const fade = valid.filter((s) => s.opacity > 0.02 && s.opacity < 0.98);
  const jumps = valid.filter(
    (s, i) => i > 0 && Math.abs(s.opacity - valid[i - 1].opacity) > 0.35
  );
  console.log(`\n=== ${label} ===`);
  console.log(`samples: ${valid.length}, in fade: ${fade.length}, big jumps (>0.35): ${jumps.length}`);
  if (fade.length) {
    console.log(
      'fade opacity range:',
      fade[0].opacity?.toFixed(3),
      '→',
      fade[fade.length - 1].opacity?.toFixed(3)
    );
    console.log(
      'first fade frames:',
      fade.slice(0, 10).map((s) => s.opacity?.toFixed(2)).join(', ')
    );
  }
  if (jumps.length) {
    console.log(
      'jumps:',
      jumps.slice(0, 5).map((s, idx) => {
        const i = valid.indexOf(s);
        return {
          from: valid[i - 1]?.opacity?.toFixed(3),
          to: s.opacity?.toFixed(3),
          dt: (s.t - valid[i - 1].t).toFixed(0) + 'ms',
          teamTop: s.teamTop?.toFixed(0),
        };
      })
    );
  }
  return { fade: fade.length, jumps: jumps.length };
}

const browser = await chromium.launch({ headless: true });

// 1. Nav click → team (mobile)
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  const samples = await rafSampleDuring(page, async (p) => {
    await p.getByTestId('burger-menu').click();
    await p.getByRole('dialog').getByRole('link', { name: 'Команда' }).click();
  }, 3500);
  analyze(samples, 'nav click → team (390×844)');
  await page.close();
}

// 2. Fast wheel through fade zone
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.evaluate(() => {
    const team = document.getElementById('team');
    if (!team) return;
    const y = window.scrollY + team.getBoundingClientRect().top - window.innerHeight * 0.95;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  });
  await page.waitForTimeout(200);
  const samples = await rafSampleDuring(page, async (p) => {
    for (let i = 0; i < 15; i++) {
      await p.mouse.wheel(0, 280);
      await p.waitForTimeout(16);
    }
  }, 2000);
  analyze(samples, 'fast wheel through fade (390×844)');
  await page.close();
}

// 3. Simulated vh jump mid-fade (Android toolbar collapse)
{
  const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.evaluate(() => {
    const team = document.getElementById('team');
    if (!team) return;
    const y = window.scrollY + team.getBoundingClientRect().top - window.innerHeight * 0.75;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  });
  await page.waitForTimeout(200);
  const samples = await rafSampleDuring(page, async (p) => {
    for (let i = 0; i < 8; i++) {
      await p.mouse.wheel(0, 40);
      await p.waitForTimeout(50);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    for (let i = 0; i < 8; i++) {
      await p.mouse.wheel(0, 40);
      await p.waitForTimeout(50);
    }
  }, 2500);
  analyze(samples, 'vh jump 700→844 mid-fade');
  await page.close();
}

// 4. Pixel 5 + CPU throttle
{
  const context = await browser.newContext({
    ...devices['Pixel 5'],
  });
  const page = await context.newPage();
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.evaluate(() => {
    const team = document.getElementById('team');
    if (!team) return;
    const y = window.scrollY + team.getBoundingClientRect().top - window.innerHeight * 0.92;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  });
  await page.waitForTimeout(300);
  const samples = await rafSampleDuring(page, async (p) => {
    for (let i = 0; i < 20; i++) {
      await p.mouse.wheel(0, 120);
      await p.waitForTimeout(32);
    }
  }, 3000);
  analyze(samples, 'Pixel 5 CPU×4 fast wheel');
  await context.close();
}

await browser.close();
