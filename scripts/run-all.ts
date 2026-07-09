import { readFileSync } from 'fs';
import { run as bryonStudios } from './parsers/bryon-studios';
import { run as nacreCreative } from './parsers/nacre-creative';
import { run as laBiennale } from './parsers/la-biennale';
import { run as pinkDolphin } from './parsers/pink-dolphin';
import { run as dviTaures } from './parsers/dvi-taures';
import { run as collageClub } from './parsers/collage-club';
import { run as discoWheel } from './parsers/disco-wheel';

// Load .env.local for local development. In CI, env vars are injected via secrets.
// We parse manually so we can overwrite empty-string vars (process.loadEnvFile skips them).
try {
  for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes (dotenv-style). Our hand-rolled parser otherwise
    // passes literal quotes through, which breaks quoted values like a
    // "postgres://…" DATABASE_URL (neon() then rejects it as an invalid URL).
    if (
      val.length >= 2 &&
      ((val[0] === '"' && val.at(-1) === '"') || (val[0] === "'" && val.at(-1) === "'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  }
} catch {
  // .env.local absent — running in CI with injected env vars
}

const parsers = [
  { name: 'Bryon Studios', fn: bryonStudios },
  { name: 'Nacre Creative', fn: nacreCreative },
  { name: 'La Biennale', fn: laBiennale },
  { name: 'Pink Dolphin', fn: pinkDolphin },
  { name: '2 Taurės', fn: dviTaures },
  { name: 'Collage Club', fn: collageClub },
  { name: 'Disco Wheel', fn: discoWheel },
];

async function main() {
  console.log(`Scrape started at ${new Date().toISOString()}`);

  for (const { name, fn } of parsers) {
    console.log(`\n--- ${name} ---`);
    try {
      await fn();
    } catch (err) {
      // Log and continue — one failed site should not block the others
      console.error(`[${name}] Error:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nScrape finished at ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
