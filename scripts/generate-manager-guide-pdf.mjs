/**
 * Генерация PDF из docs/TOUR_DATA_MANAGER_GUIDE.md
 * Запуск: npm run generate:manager-guide-pdf
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const sourcePath = resolve(rootDir, 'docs/TOUR_DATA_MANAGER_GUIDE.md');
const outputPath = resolve(rootDir, 'docs/TOUR_DATA_MANAGER_GUIDE.pdf');
const previewPath = resolve(rootDir, 'docs/.tmp-manager-guide-preview.html');

const INLINE_FORMAT = {
  bold: /\*\*([^*]+)\*\*/g,
  code: /`([^`]+)`/g,
  italic: /\*([^*]+)\*/g,
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatInline(text) {
  let out = escapeHtml(text);
  out = out.replace(INLINE_FORMAT.code, '<code>$1</code>');
  out = out.replace(INLINE_FORMAT.bold, '<strong>$1</strong>');
  out = out.replace(INLINE_FORMAT.italic, '<em>$1</em>');
  return out;
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isTableSeparator(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function renderTable(tableLines) {
  const rows = tableLines.filter(line => !isTableSeparator(line)).map(parseTableRow);
  if (rows.length === 0) return '';

  const [header, ...body] = rows;
  const headHtml = header.map(cell => `<th>${formatInline(cell)}</th>`).join('');
  const bodyHtml = body
    .map(row => `<tr>${row.map(cell => `<td>${formatInline(cell)}</td>`).join('')}</tr>`)
    .join('');

  return `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(tableLines));
      continue;
    }

    if (trimmed === '---') {
      blocks.push('<hr />');
      i += 1;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(`<li>${formatInline(lines[i].trim().replace(/^\d+\.\s/, ''))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(`<li>${formatInline(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const paragraph = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current === '---' ||
        current.startsWith('#') ||
        current.startsWith('|') ||
        current.startsWith('- ') ||
        /^\d+\.\s/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    blocks.push(`<p>${formatInline(paragraph.join(' '))}</p>`);
  }

  return blocks.join('\n');
}

function buildDocument(bodyHtml) {
  const generatedAt = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Расписание туров — инструкция для менеджера</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=PT+Serif:wght@700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f7f5f0;
      --paper: #ffffff;
      --text: #1a1a1a;
      --muted: #5c5c5c;
      --accent: #8b5e3c;
      --accent-soft: #efe6dc;
      --border: #ddd5c8;
      --code-bg: #f0ebe3;
      --shadow: 0 8px 28px rgba(26, 26, 26, 0.08);
    }

    @page {
      size: A4;
      margin: 18mm 16mm 22mm;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--text);
      font-family: 'PT Sans', 'Segoe UI', sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      background: var(--bg);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      max-width: 180mm;
      margin: 0 auto;
      background: var(--paper);
      box-shadow: var(--shadow);
      border-radius: 10px;
      overflow: hidden;
    }

    .hero {
      padding: 22mm 16mm 14mm;
      background: linear-gradient(135deg, #f7f5f0 0%, #efe6dc 55%, #e8ddd0 100%);
      border-bottom: 3px solid var(--accent);
    }

    .hero-kicker {
      margin: 0 0 8px;
      font-size: 9pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }

    .hero h1 {
      margin: 0;
      font-family: 'PT Serif', Georgia, serif;
      font-size: 24pt;
      line-height: 1.2;
      font-weight: 700;
      color: var(--text);
    }

    .hero-meta {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 9.5pt;
    }

    .content {
      padding: 12mm 16mm 18mm;
    }

    h1, h2, h3 {
      font-family: 'PT Serif', Georgia, serif;
      color: var(--text);
      break-after: avoid;
      page-break-after: avoid;
    }

    .content > h1:first-child { display: none; }

    h2 {
      margin: 22px 0 12px;
      padding: 10px 0 8px 14px;
      border-left: 4px solid var(--accent);
      background: linear-gradient(90deg, var(--accent-soft), transparent 72%);
      font-size: 15pt;
      line-height: 1.25;
    }

    h3 {
      margin: 18px 0 8px;
      font-size: 12pt;
      color: var(--accent);
    }

    p {
      margin: 0 0 10px;
      color: var(--text);
    }

    ul, ol {
      margin: 0 0 12px;
      padding-left: 20px;
    }

    li { margin: 0 0 6px; }

    li::marker { color: var(--accent); }

    hr {
      border: 0;
      height: 1px;
      margin: 18px 0;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
    }

    code {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 9pt;
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 5px;
    }

    strong { font-weight: 700; }

    .table-wrap {
      margin: 10px 0 14px;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }

    thead th {
      background: var(--accent-soft);
      color: var(--text);
      text-align: left;
      font-weight: 700;
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
    }

    tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid #ece7df;
      vertical-align: top;
    }

    tbody tr:nth-child(even) td { background: #fbf9f6; }
    tbody tr:last-child td { border-bottom: 0; }

    .footer {
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 8.5pt;
      color: var(--muted);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <p class="hero-kicker">Вкрайности</p>
      <h1>Расписание туров</h1>
      <p class="hero-meta">Инструкция для менеджера · актуально на ${generatedAt}</p>
    </header>
    <main class="content">
      ${bodyHtml}
      <p class="footer">vkraynosti.ru · Google Таблица «Шаблон для календаря» · меню «Вкрайности»</p>
    </main>
  </div>
</body>
</html>`;
}

async function main() {
  const markdown = readFileSync(sourcePath, 'utf8');
  const bodyHtml = markdownToHtml(markdown);
  const html = buildDocument(bodyHtml);

  writeFileSync(previewPath, html, 'utf8');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '0', bottom: '12mm', left: '0' },
    });
  } finally {
    await browser.close();
  }

  process.stdout.write(`PDF: ${outputPath}\n`);
  process.stdout.write(`HTML preview: ${previewPath}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
