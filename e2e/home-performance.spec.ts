import { expect, test, type Page } from '@playwright/test';

const VIDEO_URL_IN_RESPONSE_RE = /\.(mov|mp4|webm|ogg)(\?|#|$)/i;
const MEDIA_URL_IN_RESPONSE_RE = /\.(mov|mp4|webm|ogg|webp|png|jpe?g)(\?|#|$)/i;
const HOME_RELATIVE_URL = '';
const HOME_MEDIA_SNAPSHOT_MS = 5000;
const HOME_EARLY_WINDOW_MS = 2000;
const HOME_VIDEO_TRANSFER_BUDGET_BYTES = 1 * 1024 * 1024; // 1MB

interface HomeMediaStats {
  mediaCount: number;
  videoCount: number;
  videoFirst2sCount: number;
  transferAllBytes: number;
  transferVideoBytes: number;
  transferVideoFirst2sBytes: number;
  videoEntries: Array<{
    name: string;
    startTime: number;
    transferSize: number;
    duration: number;
    initiatorType: string;
  }>;
}

async function collectHomeMediaStats(page: Page): Promise<HomeMediaStats> {
  return page.evaluate(
    ({ earlyWindowMs }) => {
      const mediaRe = /\.(mov|mp4|webm|ogg|webp|png|jpe?g)(\?|#|$)/i;
      const videoRe = /\.(mov|mp4|webm|ogg)(\?|#|$)/i;
      const entries = performance
        .getEntriesByType('resource')
        .filter((raw) => mediaRe.test(raw.name)) as PerformanceResourceTiming[];
      const videoEntries = entries
        .filter((entry) => videoRe.test(entry.name))
        .map((entry) => ({
          name: entry.name,
          startTime: entry.startTime,
          transferSize: entry.transferSize ?? 0,
          duration: entry.duration,
          initiatorType: entry.initiatorType,
        }));

      const transferAllBytes = entries.reduce((sum, entry) => sum + (entry.transferSize ?? 0), 0);
      const transferVideoBytes = videoEntries.reduce((sum, entry) => sum + entry.transferSize, 0);
      const earlyVideoEntries = videoEntries.filter((entry) => entry.startTime <= earlyWindowMs);
      const transferVideoFirst2sBytes = earlyVideoEntries.reduce(
        (sum, entry) => sum + entry.transferSize,
        0
      );

      return {
        mediaCount: entries.length,
        videoCount: videoEntries.length,
        videoFirst2sCount: earlyVideoEntries.length,
        transferAllBytes,
        transferVideoBytes,
        transferVideoFirst2sBytes,
        videoEntries,
      };
    },
    { earlyWindowMs: HOME_EARLY_WINDOW_MS }
  );
}

test.describe('Home: ранние media-запросы', () => {
  test.describe.configure({ timeout: 60_000 });

  test('в первые 5с не тянем тяжёлый video-трафик на первом экране', async ({ page }) => {
    const videoResponseUrls: string[] = [];
    const mediaResponseUrls: string[] = [];
    page.on('response', (response) => {
      const url = response.url();
      if (VIDEO_URL_IN_RESPONSE_RE.test(url)) videoResponseUrls.push(url);
      if (MEDIA_URL_IN_RESPONSE_RE.test(url)) mediaResponseUrls.push(url);
    });

    await page.goto(HOME_RELATIVE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(HOME_MEDIA_SNAPSHOT_MS);

    const stats = await collectHomeMediaStats(page);
    const uniqueVideoResponseUrls = [...new Set(videoResponseUrls)];

    console.log(
      `[perf][home] mediaCount=${stats.mediaCount}, videoCount=${stats.videoCount}, videoBytes=${stats.transferVideoBytes}, videoFirst2sCount=${stats.videoFirst2sCount}, videoFirst2sBytes=${stats.transferVideoFirst2sBytes}`
    );

    test.info().attach('home-media-resources.json', {
      body: Buffer.from(
        JSON.stringify(
          {
            snapshotMs: HOME_MEDIA_SNAPSHOT_MS,
            earlyWindowMs: HOME_EARLY_WINDOW_MS,
            responseEvents: {
              mediaTotal: mediaResponseUrls.length,
              videoTotal: videoResponseUrls.length,
              videoUniqueUrls: uniqueVideoResponseUrls,
            },
            performanceResourceTiming: stats,
          },
          null,
          2
        ),
        'utf-8'
      ),
      contentType: 'application/json',
    });

    expect(
      stats.transferVideoBytes,
      `Home video bytes must stay under ${HOME_VIDEO_TRANSFER_BUDGET_BYTES}; entries: ${JSON.stringify(stats.videoEntries, null, 2)}`
    ).toBeLessThanOrEqual(HOME_VIDEO_TRANSFER_BUDGET_BYTES);
    expect(
      stats.videoFirst2sCount,
      `Home should not request video in first ${HOME_EARLY_WINDOW_MS}ms; entries: ${JSON.stringify(stats.videoEntries, null, 2)}`
    ).toBe(0);
  });
});

