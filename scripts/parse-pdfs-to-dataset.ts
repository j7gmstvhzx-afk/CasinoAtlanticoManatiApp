#!/usr/bin/env tsx
/**
 * Extracts the real slot-floor data from the two 2025 PDFs and emits
 * supabase/migrations/0005_reseed_real_machines.sql
 *
 * Usage: npx tsx scripts/parse-pdfs-to-dataset.ts
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ── PDF paths ─────────────────────────────────────────────────────────────────

const UPLOADS_DIR = '/root/.claude/uploads/2ab99647-23ad-4bbe-80e3-6a3b34af8683';
const BANK_AVG_PDF  = path.join(UPLOADS_DIR, '163c4830-Slot_Floor_2025_Bank_Avg.pdf');
const MAX_BET_PDF   = path.join(UPLOADS_DIR, '42878a2b-Slot_Floor_Max_Bet_Avg_2025.pdf');
const OUT_SQL       = path.join(__dirname, '../supabase/migrations/0005_reseed_real_machines.sql');

// ── Known manufacturers ───────────────────────────────────────────────────────

const MANUFACTURERS = [
  'Light & Wonder',
  'Aristocrat',
  'Konami',
  'Ainsworth',
  'IGT',
  'WMS',
  'Everi',
  'Bally',        // appears in Max Bet PDF for some L&W machines — use Bank Avg value
];
// Regex alternation, longest first to avoid partial matches
const MFR_RE = new RegExp(
  MANUFACTURERS.sort((a, b) => b.length - a.length)
    .map(m => m.replace(/[&]/g, '\\&'))
    .join('|')
);

// ── Bank Avg parser ───────────────────────────────────────────────────────────

interface BankAvgRow {
  id: string;
  location: string;
  denomination: string;
  game: string;
  manufacturer: string;
  avgCoinIn: number;
  avgWin: number;
}

function parseBankAvg(text: string): Map<string, BankAvgRow> {
  const rows = new Map<string, BankAvgRow>();

  for (const rawLine of text.split('\n')) {
    // Machine rows start with whitespace then a 4-digit ID
    const m = rawLine.match(/^\s+(\d{4})\s+(\d{2}-\d{2})\s+(0\.\d{2})\s+(.+?)\s+(Light & Wonder|Aristocrat|Konami|Ainsworth|IGT|WMS|Everi)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/);
    if (!m) continue;

    const [, id, location, denomination, rawGame, manufacturer, rawCoinIn, rawWin] = m;
    const avgCoinIn = parseFloat(rawCoinIn.replace(/,/g, ''));
    const avgWin    = parseFloat(rawWin.replace(/,/g, ''));
    const game      = rawGame.trim();

    rows.set(id, { id, location, denomination, game, manufacturer, avgCoinIn, avgWin });
  }

  return rows;
}

// ── Max Bet parser ────────────────────────────────────────────────────────────

interface MaxBetRow {
  id: string;
  multiDeno: boolean;
  maxBet01: number | null;
  maxBet02: number | null;
  maxBet05: number | null;
  maxBet10: number | null;
}

function parseMaxBet(text: string): Map<string, MaxBetRow> {
  const rows = new Map<string, MaxBetRow>();

  for (const rawLine of text.split('\n')) {
    // Machine rows: 4-digit ID, then location, game, manufacturer, Si/No, optional $ values
    const m = rawLine.match(/^\s*(\d{4})\s+(\d{2}-\d{2})\s+.+?(Light & Wonder|Aristocrat|Konami|Ainsworth|IGT|WMS|Everi|Bally)\s+(Si|No)\s*(.*)/);
    if (!m) continue;

    const [, id, , , siNo, rest] = m;
    const multiDeno = siNo === 'Si';

    // Extract dollar amounts from the remainder
    const amounts = [...rest.matchAll(/\$\s*([\d.]+)/g)].map(x => parseFloat(x[1]));

    rows.set(id, {
      id,
      multiDeno,
      maxBet01: amounts[0] ?? null,
      maxBet02: amounts[1] ?? null,
      maxBet05: amounts[2] ?? null,
      maxBet10: amounts[3] ?? null,
    });
  }

  return rows;
}

// ── Combine ───────────────────────────────────────────────────────────────────

interface Machine {
  id: string;
  location: string;
  game: string;
  manufacturer: string;
  denomination: string;
  minBet: number;
  multiDeno: boolean;
  maxBet01: number | null;
  maxBet02: number | null;
  maxBet05: number | null;
  maxBet10: number | null;
  avgCoinIn: number;
  avgWin: number;
}

function combine(bankAvg: Map<string, BankAvgRow>, maxBet: Map<string, MaxBetRow>): Machine[] {
  const machines: Machine[] = [];

  for (const [id, ba] of bankAvg) {
    const mb = maxBet.get(id);

    const multiDeno = mb?.multiDeno ?? false;
    // For multi-deno machines the denomination field uses the composite label
    const denomination = multiDeno ? '01/02/05/10' : ba.denomination;
    const minBet       = parseFloat(ba.denomination);

    machines.push({
      id,
      location:     ba.location,
      game:         ba.game,
      manufacturer: ba.manufacturer,
      denomination,
      minBet,
      multiDeno,
      maxBet01:     mb?.maxBet01 ?? null,
      maxBet02:     mb?.maxBet02 ?? null,
      maxBet05:     mb?.maxBet05 ?? null,
      maxBet10:     mb?.maxBet10 ?? null,
      avgCoinIn:    ba.avgCoinIn,
      avgWin:       ba.avgWin,
    });
  }

  // Sort by location for readable SQL output
  return machines.sort((a, b) => {
    const [ab, as_] = a.location.split('-').map(Number);
    const [bb, bs_] = b.location.split('-').map(Number);
    return ab !== bb ? ab - bb : as_ - bs_;
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(machines: Machine[]) {
  const ids      = machines.map(m => m.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    throw new Error(`Duplicate machine IDs: ${[...new Set(dupes)].join(', ')}`);
  }

  if (machines.length !== 285) {
    throw new Error(`Expected 285 machines, got ${machines.length}`);
  }

  const banks = new Set(machines.map(m => parseInt(m.location.split('-')[0], 10)));
  const minBank = Math.min(...banks);
  const maxBank = Math.max(...banks);
  if (minBank !== 9 || maxBank !== 52) {
    throw new Error(`Bank range should be 09-52, got ${minBank}-${maxBank}`);
  }

  const missingAvg = machines.filter(m => isNaN(m.avgCoinIn) || isNaN(m.avgWin));
  if (missingAvg.length > 0) {
    throw new Error(`Machines missing avg data: ${missingAvg.map(m => m.id).join(', ')}`);
  }

  console.log(`✓ ${machines.length} machines`);
  console.log(`✓ Banks ${minBank}–${maxBank} (${banks.size} unique banks)`);
  console.log(`✓ All avg_coin_in + avg_win present`);
  console.log(`✓ All IDs unique`);
}

// ── SQL emitter ───────────────────────────────────────────────────────────────

function sqlStr(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}
function sqlNum(v: number | null): string {
  return v === null ? 'null' : v.toFixed(2);
}
function sqlBool(v: boolean): string {
  return v ? 'true' : 'false';
}

function emitSql(machines: Machine[]): string {
  const rows = machines.map(m => [
    '  (',
    [
      sqlStr(m.id),
      sqlStr(m.location),
      sqlStr(m.game),
      sqlStr(m.manufacturer),
      sqlStr('Multi Line'),       // type: default; editable later
      sqlNum(m.minBet),
      sqlBool(m.multiDeno),
      sqlStr(m.denomination),
      sqlNum(m.maxBet01),
      sqlNum(m.maxBet02),
      sqlNum(m.maxBet05),
      sqlNum(m.maxBet10),
      sqlNum(m.avgCoinIn),
      sqlNum(m.avgWin),
      'true',                     // active
    ].join(', '),
    ')',
  ].join(''));

  return `-- Casino Atlántico Manatí — real slot floor data 2025
-- Generated by scripts/parse-pdfs-to-dataset.ts
-- Run AFTER 0004_schema_updates.sql

begin;

delete from public.machine_changes;
delete from public.coin_in_entries;
delete from public.machines;

insert into public.machines
  (id, location, game, manufacturer, type, min_bet, multi_deno, denomination,
   max_bet_01, max_bet_02, max_bet_05, max_bet_10, avg_coin_in, avg_win, active)
values
${rows.join(',\n')}
;

commit;
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function pdfToText(pdfPath: string): string {
  if (!fs.existsSync(pdfPath)) throw new Error(`PDF not found: ${pdfPath}`);
  return execSync(`pdftotext -layout "${pdfPath}" -`, { maxBuffer: 10 * 1024 * 1024 }).toString();
}

(function main() {
  console.log('Parsing PDFs…');

  const bankAvgText = pdfToText(BANK_AVG_PDF);
  const maxBetText  = pdfToText(MAX_BET_PDF);

  const bankAvgData = parseBankAvg(bankAvgText);
  const maxBetData  = parseMaxBet(maxBetText);

  console.log(`Bank Avg rows parsed: ${bankAvgData.size}`);
  console.log(`Max Bet rows parsed:  ${maxBetData.size}`);

  // IDs in Bank Avg not matched by Max Bet (will have null max bets)
  const unmatched = [...bankAvgData.keys()].filter(id => !maxBetData.has(id));
  if (unmatched.length) {
    console.warn(`⚠ ${unmatched.length} machines in Bank Avg have no Max Bet match (max bets → null): ${unmatched.join(', ')}`);
  }

  const machines = combine(bankAvgData, maxBetData);
  validate(machines);

  const sql = emitSql(machines);
  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log(`\n✓ Written to ${OUT_SQL}`);

  // Print manufacturer summary
  const mfrCount = new Map<string, number>();
  for (const m of machines) mfrCount.set(m.manufacturer, (mfrCount.get(m.manufacturer) ?? 0) + 1);
  console.log('\nManufacturer breakdown:');
  for (const [mfr, count] of [...mfrCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${mfr.padEnd(20)} ${count}`);
  }
})();
