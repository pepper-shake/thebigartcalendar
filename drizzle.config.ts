import { defineConfig } from 'drizzle-kit';

process.loadEnvFile('.env.local');

export default defineConfig({
  schema: ['./src/db/schema.ts', './src/db/schema-instagram.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
