import { expect, test, type Page } from '@playwright/test';
import { buildTourDetailPath } from '../src/constants/routes';

const VIDEO_URL_IN_RESPONSE_RE = /\.(mov|mp4|webm|ogg)(\?|#|$)/i;

function tourDetailRelativeUrl(season: string, tourId: string): string {
  return buildTourDetailPath(season, tourId).replace(/^\//, '');
}

async function settleAfterTourShell(page: Page): Promise<void> {
  await expect(page.getByTestId('tour-detail-main')).toBeVisible();
  await page.waitForTimeout(3000);
}

async function collectVideoResourceStats(page: Page): Promise<{
  count: number;
  transferSum: number;
  decodedSum: number;
  names: string[];
}> {
  return page.evaluate(() => {
    const re = /\.(mov|mp4|webm|ogg)(\?|#|$)/i;
    const entries = performance.getEntriesByType('resource').filter((e) => re.test(e.name));
    let transferSum = 0;
    let decodedSum = 0;
    const names: string[] = [];
    for (const raw of entries) {
      const e = raw as PerformanceResourceTiming;
      names.push(e.name);
      transferSum += e.transferSize ?? 0;
      decodedSum += e.decodedBodySize ?? 0;
    }
    return { count: entries.length, transferSum, decodedSum, names };
  });
}

test.describe('Tour detail: нагрузка при рендере (эталон winter-3 vs winter-1)', () => {
  test.describe.configure({ timeout: 60_000 });

  test('winter-3 (Фалаза × Грибановка): пять video, один preload=auto', async ({ page }) => {
    await page.goto(tourDetailRelativeUrl('winter', 'winter-3'), {
      waitUntil: 'domcontentloaded',
    });
    await settleAfterTourShell(page);

    const videos = page.locator('video');
    await expect(videos).toHaveCount(5);

    const preloads = await videos.evaluateAll((els) =>
      els.map((el) => (el.getAttribute('preload') ?? '').toLowerCase())
    );
    const autoCount = preloads.filter((p) => p === 'auto').length;
    const metadataCount = preloads.filter((p) => p === 'metadata').length;
    expect(autoCount, `preload values: ${JSON.stringify(preloads)}`).toBe(1);
    expect(metadataCount, `preload values: ${JSON.stringify(preloads)}`).toBe(4);
  });

  test('winter-3: сеть — не меньше пяти уникальных видео-URL (по ответам; надёжнее PerformanceResourceTiming)', async ({
    page,
  }) => {
    const videoResponseUrls: string[] = [];
    page.on('response', (response) => {
      const u = response.url();
      if (VIDEO_URL_IN_RESPONSE_RE.test(u)) videoResponseUrls.push(u);
    });

    await page.goto(tourDetailRelativeUrl('winter', 'winter-3'), {
      waitUntil: 'domcontentloaded',
    });
    await settleAfterTourShell(page);

    const uniqueVideoUrls = [...new Set(videoResponseUrls)];
    expect(
      uniqueVideoUrls.length,
      `уникальные video URL из response: ${uniqueVideoUrls.join('\n')}`
    ).toBeGreaterThanOrEqual(5);

    const perfStats = await collectVideoResourceStats(page);
    test.info().attach('winter-3-video-resources.json', {
      body: Buffer.from(
        JSON.stringify(
          {
            responseEventTotal: videoResponseUrls.length,
            responseEventUniqueUrls: uniqueVideoUrls,
            performanceResourceTiming: perfStats,
          },
          null,
          2
        ),
        'utf-8'
      ),
      contentType: 'application/json',
    });
  });

  test('winter-1: нет video в галерее; нет video resource entries в таймлайне', async ({ page }) => {
    await page.goto(tourDetailRelativeUrl('winter', 'winter-1'), {
      waitUntil: 'domcontentloaded',
    });
    await settleAfterTourShell(page);

    await expect(page.locator('video')).toHaveCount(0);

    const stats = await collectVideoResourceStats(page);
    expect(stats.count).toBe(0);
    test.info().attach('winter-1-video-resources.json', {
      body: Buffer.from(JSON.stringify(stats, null, 2), 'utf-8'),
      contentType: 'application/json',
    });
  });

  test('контраст: winter-3 тянет больше байт видео, чем winter-1', async ({ page }) => {
    await page.goto(tourDetailRelativeUrl('winter', 'winter-3'), {
      waitUntil: 'domcontentloaded',
    });
    await settleAfterTourShell(page);
    const falaza = await collectVideoResourceStats(page);

    await page.goto(tourDetailRelativeUrl('winter', 'winter-1'), {
      waitUntil: 'domcontentloaded',
    });
    await settleAfterTourShell(page);
    const izubr = await collectVideoResourceStats(page);

    const falazaBytes = Math.max(falaza.transferSum, falaza.decodedSum);
    const izubrBytes = Math.max(izubr.transferSum, izubr.decodedSum);
    if (falazaBytes === 0 && izubrBytes === 0) {
      expect(
        falaza.count,
        'если transferSize/decodedBodySize недоступны, контраст по числу video resource entries'
      ).toBeGreaterThan(izubr.count);
    } else {
      expect(falazaBytes).toBeGreaterThan(izubrBytes);
    }
    test.info().attach('contrast-video-bytes.json', {
      body: Buffer.from(
        JSON.stringify({ winter3: falaza, winter1: izubr, comparedTransferVsDecoded: { falazaBytes, izubrBytes } }, null, 2),
        'utf-8'
      ),
      contentType: 'application/json',
    });
  });
});

test.describe('Tour detail winter-3: long tasks (диагностика, без жёсткого порога)', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as Window & { __vkLongTasks?: { duration: number; startTime: number }[] };
      w.__vkLongTasks = [];
      try {
        const po = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            w.__vkLongTasks!.push({ duration: e.duration, startTime: e.startTime });
          }
        });
        po.observe({ entryTypes: ['longtask'] });
      } catch {
        /* Long Task API может быть недоступен */
      }
    });
  });

  test('собирает long tasks за 4 с после загрузки и прикрепляет JSON', async ({ page }) => {
    await page.goto(tourDetailRelativeUrl('winter', 'winter-3'), {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByTestId('tour-detail-main')).toBeVisible();
    await page.waitForTimeout(4000);

    const payload = await page.evaluate(() => {
      const w = window as Window & { __vkLongTasks?: { duration: number; startTime: number }[] };
      return {
        longTaskCount: w.__vkLongTasks?.length ?? 0,
        longTasks: w.__vkLongTasks ?? [],
        totalLongTaskMs: (w.__vkLongTasks ?? []).reduce((s, e) => s + e.duration, 0),
      };
    });

    // Сводка в stdout для отчёта без открытия HTML-репортера
    console.log(
      `[perf] winter-3 long tasks: count=${payload.longTaskCount}, totalMs≈${Math.round(payload.totalLongTaskMs)}`
    );

    test.info().attach('winter-3-longtasks.json', {
      body: Buffer.from(JSON.stringify(payload, null, 2), 'utf-8'),
      contentType: 'application/json',
    });
  });
});
