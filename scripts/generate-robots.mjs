import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { resolveSiteRoot } from './lib/seoRoutes.mjs';

const rootDir = process.cwd();
const siteRoot = resolveSiteRoot();

const content = `User-agent: *
Allow: /

Sitemap: ${siteRoot}/sitemap.xml
`;

const run = async () => {
  await writeFile(resolve(rootDir, 'public/robots.txt'), content, 'utf8');
  process.stdout.write(`robots.txt generated for ${siteRoot}\n`);
};

run().catch((error) => {
  process.stderr.write(
    `generate-robots failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
