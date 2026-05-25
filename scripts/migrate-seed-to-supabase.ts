/**
 * One-time data migration: uploads seed data to Supabase.
 *
 * Usage:
 *   1. Create a .env.local file (never commit it!) with:
 *        SUPABASE_SERVICE_ROLE_KEY=<your service-role key>
 *        EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   2. Run:  npx tsx scripts/migrate-seed-to-supabase.ts
 *   3. After verifying data in Supabase, delete this script
 *      and the src/data/ directory.
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { seedSlotMachines } from '../src/data/slotMachines';
import { machineChanges }   from '../src/data/machineChanges';
import { generateSeedCoinIn } from '../src/data/seedCoinIn';

const url            = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!url || !serviceRoleKey) {
  console.error('Missing env vars. Create .env.local with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

async function run() {
  console.log('🚀 Starting migration...\n');

  // ── 1. Machines ────────────────────────────────────────────────────────────
  console.log(`Inserting ${seedSlotMachines.length} machines...`);
  const machineRows = seedSlotMachines.map(m => ({
    id:           m.id,
    location:     m.location,
    game:         m.game,
    manufacturer: m.manufacturer,
    type:         m.type,
    min_bet:      m.minBet,
    multi_deno:   m.multiDeno,
    denomination: m.denomination,
    max_bet_01:   m.maxBet01,
    max_bet_02:   m.maxBet02,
    max_bet_05:   m.maxBet05,
    max_bet_10:   m.maxBet10,
    active:       m.active,
  }));

  // Insert in chunks to stay under payload limits
  for (let i = 0; i < machineRows.length; i += 50) {
    const chunk = machineRows.slice(i, i + 50);
    const { error } = await supabase.from('machines').upsert(chunk);
    if (error) { console.error('  machines error:', error.message); process.exit(1); }
    process.stdout.write(`  ${Math.min(i + 50, machineRows.length)}/${machineRows.length} done\r`);
  }
  console.log('\n✅ Machines done');

  // ── 2. Machine changes ─────────────────────────────────────────────────────
  console.log(`\nInserting ${machineChanges.length} machine changes...`);
  const changeRows = machineChanges.map(c => ({
    mc:           c.mc,
    type:         c.type,
    manufacturer: c.manufacturer,
    game_2024:    c.game2024 ?? null,
    game_2025:    c.game2025 ?? null,
    location_2024: c.location2024 ?? null,
    location_2025: c.location2025 ?? null,
    bank:         c.bank,
  }));
  const { error: chErr } = await supabase.from('machine_changes').upsert(changeRows);
  if (chErr) { console.error('  changes error:', chErr.message); process.exit(1); }
  console.log('✅ Machine changes done');

  // ── 3. Coin-in entries ─────────────────────────────────────────────────────
  const coinIn = generateSeedCoinIn(seedSlotMachines);
  console.log(`\nInserting ${coinIn.length} coin-in entries (this may take a minute)...`);
  const coinInRows = coinIn.map(e => ({
    machine_id: e.machineId,
    date:       e.date,
    amount:     e.amount,
  }));

  for (let i = 0; i < coinInRows.length; i += 500) {
    const chunk = coinInRows.slice(i, i + 500);
    const { error } = await supabase.from('coin_in_entries').upsert(chunk);
    if (error) { console.error('  coin_in error:', error.message); process.exit(1); }
    process.stdout.write(`  ${Math.min(i + 500, coinInRows.length)}/${coinInRows.length} done\r`);
  }
  console.log('\n✅ Coin-in entries done');

  console.log('\n🎉 Migration complete! You can now delete src/data/ and this script.');
}

run().catch(e => { console.error(e); process.exit(1); });
