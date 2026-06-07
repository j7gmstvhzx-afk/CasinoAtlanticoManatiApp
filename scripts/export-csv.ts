/**
 * Generates CSV files from the seed data for manual import into Supabase
 * Table Editor. Run:  npx tsx scripts/export-csv.ts
 * Outputs to ./csv-export/
 */
import * as fs from 'fs';
import * as path from 'path';
import { seedSlotMachines } from '../src/data/slotMachines';
import { machineChanges } from '../src/data/machineChanges';
import { generateSeedCoinIn } from '../src/data/seedCoinIn';

const outDir = path.join(__dirname, '..', 'csv-export');
fs.mkdirSync(outDir, { recursive: true });

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  return lines.join('\n') + '\n';
}

// ── machines ──────────────────────────────────────────────────────────────────
const machineHeaders = [
  'id', 'location', 'game', 'manufacturer', 'type', 'min_bet', 'multi_deno',
  'denomination', 'max_bet_01', 'max_bet_02', 'max_bet_05', 'max_bet_10', 'active',
];
const machineRows = seedSlotMachines.map(m => [
  m.id, m.location, m.game, m.manufacturer, m.type, m.minBet, m.multiDeno,
  m.denomination, m.maxBet01, m.maxBet02, m.maxBet05, m.maxBet10, m.active,
]);
fs.writeFileSync(path.join(outDir, 'machines.csv'), toCsv(machineHeaders, machineRows));
console.log(`machines.csv      → ${machineRows.length} rows`);

// ── machine_changes ─────────────────────────────────────────────────────────
const changeHeaders = [
  'mc', 'type', 'manufacturer', 'game_2024', 'game_2025',
  'location_2024', 'location_2025', 'bank',
];
const changeRows = machineChanges.map(c => [
  c.mc, c.type, c.manufacturer, c.game2024 ?? '', c.game2025,
  c.location2024 ?? '', c.location2025, c.bank,
]);
fs.writeFileSync(path.join(outDir, 'machine_changes.csv'), toCsv(changeHeaders, changeRows));
console.log(`machine_changes.csv → ${changeRows.length} rows`);

// ── coin_in_entries (synthetic — optional) ──────────────────────────────────
const coinIn = generateSeedCoinIn(seedSlotMachines);
const coinHeaders = ['machine_id', 'date', 'amount'];
const coinRows = coinIn.map(e => [e.machineId, e.date, e.amount]);
fs.writeFileSync(path.join(outDir, 'coin_in_entries.csv'), toCsv(coinHeaders, coinRows));
console.log(`coin_in_entries.csv → ${coinRows.length} rows`);
