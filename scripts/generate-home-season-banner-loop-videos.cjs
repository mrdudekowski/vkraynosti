/**
 * Нарезка лупов баннера зимы (та же таблица, что в `generate-home-season-banner-loop-videos.ps1`).
 * Вход: `public/tours/{winter-*}/…grid.webm`. Выход: `public/banners_winter/*.banner-loop.webm`.
 * Использует `ffmpeg-static` из devDependencies — не требует ffmpeg в PATH.
 * Кодирование: VP9 (пресет banner — CRF 33, max ширина 800px) — синхронно с `.ps1` и `WebmTourEncoding.ps1`.
 *
 *   node scripts/generate-home-season-banner-loop-videos.cjs
 *   node scripts/generate-home-season-banner-loop-videos.cjs --posters
 *   node scripts/generate-home-season-banner-loop-videos.cjs --dry-run
 */
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegPath = require('ffmpeg-static');
if (!ffmpegPath) {
  console.error('ffmpeg-static: бинарник не найден. Выполните npm install.');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');
const publicTours = path.join(repoRoot, 'public', 'tours');
const bannerWinterOutDir = path.join(repoRoot, 'public', 'banners_winter');

/** Синхронно с `HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC` в `src/constants/homeSeasonBannerAnimation.ts`. */
const durationSec = 5;
const dryRun = process.argv.includes('--dry-run');
const posters = process.argv.includes('--posters');

const vp9BannerArgs = [
  '-c:v',
  'libvpx-vp9',
  '-crf',
  '33',
  '-b:v',
  '0',
  '-row-mt',
  '1',
  '-cpu-used',
  '2',
  '-deadline',
  'good',
  '-pix_fmt',
  'yuv420p',
  '-an',
];

/** @type {{ subdir: string; input: string; startSec: number; output: string }[]} */
const cuts = [
  { subdir: 'winter-3', input: 'gr.clip1.grid.webm', startSec: 3, output: 'gr.clip1.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.clip3.grid.webm', startSec: 0, output: 'gr.clip3.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.clip4.grid.webm', startSec: 16, output: 'gr.clip4.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.clip5.grid.webm', startSec: 1, output: 'gr.clip5.banner-loop.webm' },
  { subdir: 'winter-4', input: 'hs.clip1.grid.webm', startSec: 5, output: 'hs.clip1.banner-loop.webm' },
  { subdir: 'winter-5', input: 'ars.clip1.grid.webm', startSec: 2, output: 'ars.clip1.banner-loop.webm' },
  { subdir: 'winter-5', input: 'ars.clip2.grid.webm', startSec: 7, output: 'ars.clip2.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.board.grid.webm', startSec: 0, output: 'gr.board.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.elya.grid.webm', startSec: 0, output: 'gr.elya.banner-loop.webm' },
  { subdir: 'winter-3', input: 'gr.bbq.grid.webm', startSec: 0, output: 'gr.bbq.banner-loop.webm' },
];

function runFfmpeg(args) {
  if (dryRun) {
    console.log(ffmpegPath, args.join(' '));
    return;
  }
  const r = spawnSync(ffmpegPath, args, { stdio: 'inherit', cwd: repoRoot });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!dryRun) {
  fs.mkdirSync(bannerWinterOutDir, { recursive: true });
}

for (const row of cuts) {
  const sourceDir = path.join(publicTours, row.subdir);
  const inPath = path.join(sourceDir, row.input);
  const outPath = path.join(bannerWinterOutDir, row.output);
  if (!fs.existsSync(inPath)) {
    console.warn(`Skip missing input: ${inPath}`);
    continue;
  }

  const encodeArgs = [
    '-y',
    '-i',
    inPath,
    '-ss',
    String(row.startSec),
    '-t',
    String(durationSec),
    '-vf',
    "scale='min(800,iw)':-2",
    ...vp9BannerArgs,
    outPath,
  ];

  console.log('->', outPath);
  runFfmpeg(encodeArgs);

  if (posters) {
    const base = path.basename(row.output, '.webm');
    const posterPath = path.join(bannerWinterOutDir, `${base}.poster.webp`);
    runFfmpeg(['-y', '-i', outPath, '-vframes', '1', '-q:v', '80', posterPath]);
  }
}

console.log('Done.');
