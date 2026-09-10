import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './scripts/cms/api/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
