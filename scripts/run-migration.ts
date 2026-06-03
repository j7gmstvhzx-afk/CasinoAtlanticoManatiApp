/**
 * Runs supabase/migrations/0001_init.sql against the Supabase project.
 *
 * Requires environment variables:
 *   EXPO_PUBLIC_SUPABASE_URL   — e.g. https://abcdef.supabase.co
 *   SUPABASE_ACCESS_TOKEN      — personal access token from
 *                                https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';

async function run(): Promise<void> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN ?? '';

  if (!supabaseUrl || !accessToken) {
    console.error('Missing env vars: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_ACCESS_TOKEN are required.');
    process.exit(1);
  }

  // Extract project ref from URL  (https://ABCDEF.supabase.co → ABCDEF)
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    console.error(`Could not parse project ref from URL: ${supabaseUrl}`);
    process.exit(1);
  }
  const projectRef = match[1];

  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '0001_init.sql');
  const query   = fs.readFileSync(sqlPath, 'utf8');

  console.log(`Running migration on project: ${projectRef}`);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`Migration failed (${res.status}): ${body}`);
    process.exit(1);
  }

  console.log('✅ Migration complete — all tables and RLS policies are in place.');
}

run().catch(e => { console.error(e); process.exit(1); });
