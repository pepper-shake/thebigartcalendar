import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const url = process.env.DATABASE_URL!;

// Local development can point DATABASE_URL at a Postgres on localhost (e.g. the
// PGlite server from `npm run db:local`); the Neon HTTP driver only talks to
// Neon, so use node-postgres there. Everything else (prod, preview) is Neon.
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);

// One shared connection, reused across dev hot-reloads (PGlite serves one query
// at a time; a new Pool per reload would exhaust its connection limit).
const g = globalThis as unknown as { __localPgPool?: Pool };
const localPool = () => (g.__localPgPool ??= new Pool({ connectionString: url, max: 1 }));

export const db = isLocal
  ? (drizzlePg(localPool(), { schema }) as unknown as ReturnType<
      typeof drizzle<typeof schema>
    >)
  : drizzle(neon(url), { schema });
