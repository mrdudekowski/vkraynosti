import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { resolveSiteRoot } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const siteRoot = resolveSiteRoot();
const host = new URL(siteRoot).host;

// Policy: welcome AI / answer bots explicitly — discoverability in ChatGPT, Claude,
// Perplexity, Google AI etc. is a goal, not a threat. All listed agents get full Allow.
const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

// Tracking params Yandex should fold into one canonical URL (avoids duplicate-URL dilution).
const CLEAN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'yclid',
  'gclid',
  'fbclid',
  'ymclid',
  '_openstat',
];

const aiBlock = AI_USER_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n');

const content = `# Все краулеры: полный доступ
User-agent: *
Allow: /

# ИИ-ассистенты и answer-боты — явно приветствуем (видимость в ChatGPT/Claude/Perplexity и т.п.)
${aiBlock}

# Яндекс: канонический хост + свёртка трекинговых параметров в один URL
User-agent: Yandex
Allow: /
Clean-param: ${CLEAN_PARAMS.join('&')}
Host: ${host}

Sitemap: ${siteRoot}/sitemap.xml
`;

const run = async () => {
  await writeFile(resolve(rootDir, 'public/robots.txt'), content, 'utf8');
  process.stdout.write(`robots.txt generated for ${siteRoot} (host ${host})\n`);
};

run().catch((error) => {
  process.stderr.write(
    `generate-robots failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
