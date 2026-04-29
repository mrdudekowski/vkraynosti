#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

if (!ffmpegPath) {
  console.error('ffmpeg-static binary not found');
  process.exit(1);
}

const repoRoot = process.cwd();
const publicRoot = path.join(repoRoot, 'public');
const imageExtRe = /\.(webp|png|jpe?g)$/i;

function walk(dir, out = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walk(p, out);
    else if (imageExtRe.test(item.name)) out.push(p);
  }
  return out;
}

function runFfmpeg(args) {
  const res = spawnSync(ffmpegPath, args, { stdio: 'pipe' });
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed: ${Buffer.from(res.stderr || '').toString()}`);
  }
}

function rel(p) {
  return path.relative(repoRoot, p).replace(/\\/g, '/');
}

function maxLongSideFor(filePath) {
  const rp = rel(filePath);
  if (rp.includes('/banners_')) return 900;
  if (rp.endsWith('/vkrai-logo.png')) return 512;
  if (rp.includes('.grid.')) return 900;
  return 1920;
}

function scaleExpr(maxLong) {
  return `scale='if(gt(ih,iw),-2,min(${maxLong},iw))':'if(gt(ih,iw),min(${maxLong},ih),-2)'`;
}

function encodeToWebp(inputPath, outputPath, quality) {
  const maxLong = maxLongSideFor(inputPath);
  const args = [
    '-y',
    '-i',
    inputPath,
    '-vf',
    scaleExpr(maxLong),
    '-c:v',
    'libwebp',
    '-quality',
    String(quality),
    '-compression_level',
    '6',
    '-preset',
    'picture',
    outputPath,
  ];
  runFfmpeg(args);
}

function optimizeWebpInPlace(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const tempPath = `${filePath}.tmp.webp`;
  const qualities = [58, 50, 42];
  let bestPath = null;
  let bestSize = Number.POSITIVE_INFINITY;

  for (const q of qualities) {
    encodeToWebp(filePath, tempPath, q);
    const currentSize = fs.statSync(tempPath).size;
    if (currentSize < bestSize) {
      bestSize = currentSize;
      bestPath = tempPath;
    }
    if (currentSize <= 200 * 1024) break;
  }

  if (bestPath == null) return { changed: false, before: originalSize, after: originalSize };
  if (bestSize < originalSize) {
    fs.renameSync(bestPath, filePath);
    return { changed: true, before: originalSize, after: bestSize };
  }
  fs.unlinkSync(bestPath);
  return { changed: false, before: originalSize, after: originalSize };
}

function convertPngOrJpgToWebp(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
  const tempPath = `${webpPath}.tmp.webp`;
  const qualities = [58, 50, 42];
  let bestSize = Number.POSITIVE_INFINITY;

  for (const q of qualities) {
    encodeToWebp(filePath, tempPath, q);
    const currentSize = fs.statSync(tempPath).size;
    if (currentSize < bestSize) bestSize = currentSize;
    fs.copyFileSync(tempPath, webpPath);
    if (currentSize <= 200 * 1024) break;
  }

  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  return { before: originalSize, after: fs.statSync(webpPath).size, webpPath };
}

function main() {
  const files = walk(publicRoot);
  let changedCount = 0;
  let beforeTotal = 0;
  let afterTotal = 0;
  const converted = [];

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.webp') {
      const r = optimizeWebpInPlace(f);
      beforeTotal += r.before;
      afterTotal += r.after;
      if (r.changed) changedCount += 1;
      continue;
    }
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const r = convertPngOrJpgToWebp(f);
      beforeTotal += r.before;
      afterTotal += r.after;
      converted.push({ source: rel(f), target: rel(r.webpPath) });
      continue;
    }
  }

  fs.writeFileSync(
    path.join(repoRoot, 'image-converted-files.json'),
    JSON.stringify(converted, null, 2),
    'utf8'
  );

  console.log(
    JSON.stringify(
      {
        processed: files.length,
        webpChanged: changedCount,
        convertedToWebp: converted.length,
        beforeMB: +(beforeTotal / (1024 * 1024)).toFixed(2),
        afterMB: +(afterTotal / (1024 * 1024)).toFixed(2),
      },
      null,
      2
    )
  );
}

main();

