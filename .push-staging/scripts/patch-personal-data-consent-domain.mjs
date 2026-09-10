#!/usr/bin/env node
/**
 * Replaces placeholder «ДОМЕН САЙТА» with https://vkraynosti.ru in personal-data-consent.pdf
 * Source + deploy: content/legal and public/legal (same filename in public/).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const domainUrl = 'https://vkraynosti.ru';
const placeholder = 'ДОМЕН САЙТА';

const targets = [
  path.join(root, 'public/legal/personal-data-consent.pdf'),
  ...fs
    .readdirSync(path.join(root, 'content/legal'))
    .filter((name) => name.toLowerCase().endsWith('.pdf') && name.includes('(1)'))
    .map((name) => path.join(root, 'content/legal', name)),
];

const fontPath = path.join(root, 'fonts/Strogo-Regular.ttf');

const findPlaceholderLine = async (pdfBytes) => {
  const doc = await getDocument({ data: new Uint8Array(pdfBytes) }).promise;
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();

  for (const item of textContent.items) {
    if ('str' in item && item.str.includes(placeholder)) {
      return {
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height || 10.5,
      };
    }
  }

  return null;
};

const patchPdf = async (filePath) => {
  const pdfBytes = fs.readFileSync(filePath);
  const line = await findPlaceholderLine(pdfBytes);

  if (!line) {
    console.warn(`Skip (placeholder not found): ${filePath}`);
    return false;
  }

  const placeholderIndex = line.text.indexOf(placeholder);
  if (placeholderIndex < 0) {
    console.warn(`Skip (already patched?): ${filePath}`);
    return false;
  }

  const ratioStart = placeholderIndex / line.text.length;
  const ratioPlaceholder = placeholder.length / line.text.length;
  const xStart = line.x + ratioStart * line.width;
  const placeholderWidth = ratioPlaceholder * line.width;

  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fs.readFileSync(fontPath));
  const page = pdfDoc.getPages()[0];

  let fontSize = line.height;
  let urlWidth = font.widthOfTextAtSize(domainUrl, fontSize);
  const maxWidth = page.getWidth() - xStart - 48;

  while (urlWidth > maxWidth && fontSize > 7) {
    fontSize -= 0.5;
    urlWidth = font.widthOfTextAtSize(domainUrl, fontSize);
  }

  const coverWidth = Math.max(placeholderWidth, urlWidth) + 6;
  const yBaseline = line.y;

  page.drawRectangle({
    x: xStart - 2,
    y: yBaseline - 2,
    width: coverWidth,
    height: fontSize + 4,
    color: rgb(1, 1, 1),
    borderWidth: 0,
  });

  page.drawText(domainUrl, {
    x: xStart,
    y: yBaseline,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  fs.writeFileSync(filePath, await pdfDoc.save());
  console.log(`Patched: ${filePath}`);
  return true;
};

let patched = 0;
for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  if (await patchPdf(target)) patched += 1;
}

if (!patched) {
  console.error('No PDF files were patched.');
  process.exit(1);
}
