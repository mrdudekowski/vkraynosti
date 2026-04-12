/**
 * Нарезка лупов баннера (та же таблица, что в `generate-home-season-banner-loop-videos.ps1`).
 * Использует `ffmpeg-static` из devDependencies — не требует ffmpeg в PATH.
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

/** Синхронно с `HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC` в `src/constants/homeSeasonBannerAnimation.ts`. */
const durationSec = 5;
const dryRun = process.argv.includes('--dry-run');
const posters = process.argv.includes('--posters');

/** @type {{ subdir: string; input: string; startSec: number; output: string }[]} */
const cuts = [
  { subdir: 'winter-3', input: 'gr.clip1.grid.mp4', startSec: 3, output: 'gr.clip1.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.clip3.grid.mp4', startSec: 0, output: 'gr.clip3.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.clip4.grid.mp4', startSec: 16, output: 'gr.clip4.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.clip5.grid.mp4', startSec: 1, output: 'gr.clip5.banner-loop.mp4' },
  { subdir: 'winter-4', input: 'hs.clip1.grid.mp4', startSec: 5, output: 'hs.clip1.banner-loop.mp4' },
  { subdir: 'winter-5', input: 'ars.clip1.grid.mp4', startSec: 2, output: 'ars.clip1.banner-loop.mp4' },
  { subdir: 'winter-5', input: 'ars.clip2.grid.mp4', startSec: 7, output: 'ars.clip2.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.board.grid.mp4', startSec: 0, output: 'gr.board.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.elya.grid.mp4', startSec: 0, output: 'gr.elya.banner-loop.mp4' },
  { subdir: 'winter-3', input: 'gr.bbq.grid.mp4', startSec: 0, output: 'gr.bbq.banner-loop.mp4' },
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

for (const row of cuts) {
  const dir = path.join(publicTours, row.subdir);
  const inPath = path.join(dir, row.input);
  const outPath = path.join(dir, row.output);
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
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '28',
    '-vf',
    "scale='min(854,iw)':-2",
    '-an',
    '-movflags',
    '+faststart',
    outPath,
  ];

  console.log('->', outPath);
  runFfmpeg(encodeArgs);

  if (posters) {
    const base = path.basename(row.output, '.mp4');
    const posterPath = path.join(dir, `${base}.poster.webp`);
    runFfmpeg(['-y', '-i', outPath, '-vframes', '1', '-q:v', '80', posterPath]);
  }
}

console.log('Done.');
