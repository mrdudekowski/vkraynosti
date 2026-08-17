import { serve } from '@hono/node-server';
import { loadCmsApiEnv } from './env.ts';
import { createCmsApiApp } from './app.ts';
import { createS3JsonStore } from './store.ts';

const rootDir = process.cwd();
const env = await loadCmsApiEnv(rootDir);
const app = createCmsApiApp({
  env,
  store: createS3JsonStore(env.s3),
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
    hostname: '127.0.0.1',
  },
  (info) => {
    console.info(`CMS API http://127.0.0.1:${info.port} (proxy: /api/cms)`);
  }
);
