/**
 * Applies a SQL file to the linked Supabase project via the Management API.
 * Usage: $env:SUPABASE_PAT = 'sbp_...'; node scripts/apply-sql.mjs <file.sql>
 * Prints the JSON response; exits non-zero on failure.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_REF = 'naujqnbwatuyeiqpsinp';
const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const pat = process.env.SUPABASE_PAT;

if (!pat) {
  console.error('Set SUPABASE_PAT first');
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/apply-sql.mjs <file.sql>');
  process.exit(1);
}

const sql = readFileSync(resolve(file), 'utf8');
const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await res.text();
console.log(`HTTP ${res.status}`);
console.log(text);

if (!res.ok) process.exit(1);
