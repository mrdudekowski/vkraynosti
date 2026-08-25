import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/cms/api/app.test.ts', 'scripts/cms/api/**/*.integration.test.ts'],
  },
});
