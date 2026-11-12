import { validateCmsRuntimeCors } from './lib/validateCmsRuntimeBase.mjs';

try {
  await validateCmsRuntimeCors();
  process.stdout.write('Public CMS URL and browser CORS are configured.\n');
} catch (error) {
  process.stderr.write(`CMS runtime configuration failed: ${error.message}\n`);
  process.exitCode = 1;
}
