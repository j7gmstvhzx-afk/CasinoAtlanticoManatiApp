import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  SlotMachine, CoinInEntry, FloorStats, ExplorerFilters, MachineChange,
  SlotManufacturer, SlotMachineType,
} from '@/types/domain';

// ── Stats computation ────────────────────────────────────────────────────────

function computeFloorStats(machines: SlotMachine[]): FloorStats {
  const active = machines.filter(m => m.active);

  const mfrMap = new Map<string, number>();
  for (const m of active) mfrMap.set(m.manufacturer, (mfrMap.get(m.manufacturer) ?? 0) + 1);
  const byManufacturer = Array.from(mfrMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const denoMap = new Map<string, number>();
  for (const m of active) {
    const label = m.denomination === '0.01' || m.denomination === '01/02/05/10' ? '1¢'
                : m.denomination === '0.05' ? '5¢'
                : m.denomination === '0.25' ? '25¢'
                : m.denomination;
    denoMap.set(label, (denoMap.get(label) ?? 0) + 1);
  }
  const byDenomination = Array.from(denoMap.entries()).map(([label, count]) => ({ label, count }));

  const allMin     = active.map(m => m.minBet);
  const minBetSum  = allMin.reduce((s, v) => s + v, 0);
  const accessible = active.filter(m => m.minBet <= 0.40);
  const high       = active.filter(m => m.minBet >= 0.50);
  const accSum     = accessible.reduce((s, m) => s + m.minBet, 0);
  const hiSum      = high.reduce((s, m) => s + m.minBet, 0);

  const max01Vals = active.map(m => m.maxBet01).filter((v): v is number => v !== null);
  const max05Vals = active.map(m => m.maxBet05).filter((v): v is number => v !== null);

  const buildDist = (vals: number[]) => {
    const map = new Map<string, number>();
    for (const v of vals) { const k = v.toFixed(2); map.set(k, (map.get(k) ?? 0) + 1); }
    return Array.from(map.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .map(([value, count]) => ({ value, count }));
  };

  const safeStats = (vals: number[]) => ({
    min:          vals.length ? vals.reduce((a, b) => (b < a ? b : a)) : 0,
    max:          vals.length ? vals.reduce((a, b) => (b > a ? b : a)) : 0,
    avg:          vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0,
    distribution: buildDist(vals),
  });

  const withAvg     = active.filter(m => m.avgCoinIn != null && m.avgWin != null);
  const totalCoinIn = withAvg.reduce((s, m) => s + (m.avgCoinIn ?? 0), 0);
  const totalWin    = withAvg.reduce((s, m) => s + (m.avgWin ?? 0), 0);
  const avgCoinIn   = withAvg.length ? totalCoinIn / withAvg.length : 0;
  const avgWin      = withAvg.length ? totalWin    / withAvg.length : 0;
  const winPct      = totalCoinIn > 0 ? (totalWin / totalCoinIn) * 100 : 0;

  return {
    total:       machines.length,
    active:      active.length,
    easyBet:     active.filter(m => m.type === 'Easy Bet').length,
    multiLine:   active.filter(m => m.type === 'Multi Line').length,
    multiDeno:   active.filter(m => m.multiDeno).length,
    singleDeno:  active.filter(m => !m.multiDeno).length,
    byManufacturer,
    byDenomination,
    avgCoinIn,
    avgWin,
    winPct,
    minBetStats: {
      min:             allMin.length ? allMin.reduce((a, b) => (b < a ? b : a)) : 0,
      max:             allMin.length ? allMin.reduce((a, b) => (b > a ? b : a)) : 0,
      avg:             allMin.length ? minBetSum / allMin.length : 0,
      accessibleCount: accessible.length,
      highCount:       high.length,
      accessibleAvg:   accessible.length ? accSum / accessible.length : 0,
      highAvg:         high.length ? hiSum / high.length : 0,
    },
    maxBet01Stats: safeStats(max01Vals),
    maxBet05Stats: safeStats(max05Vals),
  };
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToMachine(row: Record<string, unknown>): SlotMachine {
  return {
    id:           String(row.id),
    location:     String(row.location),
    game:         String(row.game),
    manufacturer: row.manufacturer as SlotManufacturer,
    type:         row.type as SlotMachineType,
    minBet:       Number(row.min_bet),
    multiDeno:    Boolean(row.multi_deno),
    denomination: String(row.denomination),
    maxBet01:     row.max_bet_01 != null ? Number(row.max_bet_01) : null,
    maxBet02:     row.max_bet_02 != null ? Number(row.max_bet_02) : null,
    maxBet05:     row.max_bet_05 != null ? Number(row.max_bet_05) : null,
    maxBet10:     row.max_bet_10 != null ? Number(row.max_bet_10) : null,
    active:       Boolean(row.active),
    period:       row.period != null ? String(row.period) : null,
    periodStart:  row.period_start != null ? String(row.period_start) : null,
    periodEnd:    row.period_end   != null ? String(row.period_end)   : null,
    avgCoinIn:    row.avg_coin_in != null ? Number(row.avg_coin_in) : undefined,
    avgWin:       row.avg_win     != null ? Number(row.avg_win)     : undefined,
  };
}

function rowToChange(row: Record<string, unknown>): MachineChange {
  return {
    id:           row.id != null ? Number(row.id) : undefined,
    mc:           String(row.mc),
    type:         row.type as MachineChange['type'],
    manufacturer: String(row.manufacturer ?? ''),
    game2024:     row.game_2024     != null ? String(row.game_2024)     : undefined,
    game2025:     row.game_2025     != null ? String(row.game_2025)     : undefined,
    location2024: row.location_2024 != null ? String(row.location_2024) : undefined,
    location2025: row.location_2025 != null ? String(row.location_2025) : undefined,
    bank:         Number(row.bank ?? 0),
    recordedAt:   row.recorded_at  != null ? String(row.recorded_at)  : undefined,
    periodLabel:  row.period_label  != null ? String(row.period_label)  : undefined,
  };
}

function machineToDbPatch(patch: Partial<SlotMachine>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (patch.game         !== undefined) db.game          = patch.game;
  if (patch.manufacturer !== undefined) db.manufacturer  = patch.manufacturer;
  if (patch.type         !== undefined) db.type          = patch.type;
  if (patch.minBet       !== undefined) db.min_bet       = patch.minBet;
  if (patch.denomination !== undefined) db.denomination  = patch.denomination;
  if (patch.multiDeno    !== undefined) db.multi_deno    = patch.multiDeno;
  if (patch.maxBet01     !== undefined) db.max_bet_01    = patch.maxBet01;
  if (patch.maxBet02     !== undefined) db.max_bet_02    = patch.maxBet02;
  if (patch.maxBet05     !== undefined) db.max_bet_05    = patch.maxBet05;
  if (patch.maxBet10     !== undefined) db.max_bet_10    = patch.maxBet10;
  if (patch.active       !== undefined) db.active        = patch.active;
  if (patch.period       !== undefined) db.period        = patch.period;
  if (patch.periodStart  !== undefined) db.period_start  = patch.periodStart;
  if (patch.periodEnd    !== undefined) db.period_end    = patch.periodEnd;
  if (patch.avgCoinIn    !== undefined) db.avg_coin_in   = patch.avgCoinIn;
  if (patch.avgWin       !== undefined) db.avg_win       = patch.avgWin;
  db.updated_at = new Date().toISOString();
  return db;
}

// ── Bank groups ───────────────────────────────────────────────────────────────

export type BankGroup = {
  bank: string;
  bankNum: number;
  machines: SlotMachine[];
  avgCoinIn: number;
  avgWin: number;
  totalCoinIn: number;
  totalWin: number;
  topGame: string;
};

function buildBankGroups(allMachines: SlotMachine[]): BankGroup[] {
  const machines = allMachines.filter(m => m.active);
  const bankMap = new Map<string, SlotMachine[]>();
  for (const m of machines) {
    const bank = m.location.split('-')[0];
    if (!bankMap.has(bank)) bankMap.set(bank, []);
    bankMap.get(bank)!.push(m);
  }

  return Array.from(bankMap.entries())
    .map(([bank, ms]) => {
      const withAvg   = ms.filter(m => m.avgCoinIn != null && m.avgWin != null);
      const totalCoin = withAvg.reduce((s, m) => s + (m.avgCoinIn ?? 0), 0);
      const totalWin  = withAvg.reduce((s, m) => s + (m.avgWin ?? 0), 0);
      const avgCoinIn = withAvg.length ? totalCoin / withAvg.length : 0;
      const avgWin    = withAvg.length ? totalWin  / withAvg.length : 0;

      // Top game by avg coin-in
      let topGame = '';
      let topCoin = 0;
      for (const m of ms) {
        if ((m.avgCoinIn ?? 0) > topCoin) { topCoin = m.avgCoinIn ?? 0; topGame = m.game; }
      }

      return {
        bank,
        bankNum:    parseInt(bank, 10),
        machines:   ms,
        avgCoinIn,
        avgWin,
        totalCoinIn: totalCoin,
        totalWin,
        topGame: topGame || (ms[0]?.game ?? ''),
      };
    })
    .sort((a, b) => a.bankNum - b.bankNum);
}

// ── Store interface ───────────────────────────────────────────────────────────

interface SlotFloorStore {
  initialized:     boolean;
  machines:        SlotMachine[];
  coinIn:          CoinInEntry[];
  machineChanges:  MachineChange[];
  floorStats:      FloorStats;
  explorerSearch:  string;
  explorerFilters: ExplorerFilters;

  init:                 () => Promise<void>;
  updateMachine:        (id: string, patch: Partial<SlotMachine>) => Promise<void>;
  batchUpdateMachines:  (ids: string[], patch: Partial<SlotMachine>) => Promise<void>;
  setExplorerSearch:    (q: string) => void;
  setExplorerFilter:    (key: keyof ExplorerFilters, value: string | null) => void;
  clearExplorerFilters: () => void;

  getFilteredMachines: () => SlotMachine[];
  getBankGroups:       () => BankGroup[];
  getBankRanking:      (metric: 'avgWin' | 'avgCoinIn') => { best: BankGroup[]; worst: BankGroup[] };
  getTopMachines:      (metric: 'avgWin' | 'avgCoinIn', n?: number) => SlotMachine[];
}

const EMPTY_STATS = computeFloorStats([]);

export const useSlotFloorStore = create<SlotFloorStore>((set, get) => ({
  initialized:     false,
  machines:        [],
  coinIn:          [],
  machineChanges:  [],
  floorStats:      EMPTY_STATS,
  explorerSearch:  '',
  explorerFilters: { manufacturer: null, type: null, denomination: null },

  // ── init ──────────────────────────────────────────────────────────────────
  async init() {
    if (get().initialized) return;
    try {
      const [mRes, chRes] = await Promise.all([
        supabase.from('machines').select('*'),
        supabase.from('machine_changes').select('*').order('recorded_at', { ascending: false }),
      ]);

      const machines       = (mRes.data  ?? []).map(r => rowToMachine(r as Record<string, unknown>));
      const machineChanges = (chRes.data ?? []).map(r => rowToChange(r as Record<string, unknown>));

      set({ initialized: true, machines, machineChanges, floorStats: computeFloorStats(machines) });
    } catch {
      set({ initialized: true });
    }
  },

  // ── machine edits ─────────────────────────────────────────────────────────
  async updateMachine(id, patch) {
    const prev = get().machines.find(m => m.id === id);
    const updated = get().machines.map(m => m.id === id ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });

    await supabase.from('machines').update(machineToDbPatch(patch)).eq('id', id);

    // Auto-detect and record change type(s)
    if (!prev) return;
    const newGame     = patch.game     ?? prev.game;
    const newLocation = patch.location ?? prev.location;
    const gameChanged     = newGame     !== prev.game;
    const locationChanged = newLocation !== prev.location;

    if (!gameChanged && !locationChanged) return;

    const changesToInsert: Omit<MachineChange, 'id' | 'recordedAt'>[] = [];

    if (gameChanged && !locationChanged) {
      changesToInsert.push({
        mc:           id,
        type:         'cambio_juego',
        manufacturer: String(patch.manufacturer ?? prev.manufacturer),
        game2024:     prev.game,
        game2025:     newGame,
        location2024: prev.location,
        location2025: prev.location,
        bank:         parseInt(prev.location.split('-')[0], 10),
        periodLabel:  String(patch.period ?? prev.period ?? ''),
      });
    }
    if (locationChanged && !gameChanged) {
      changesToInsert.push({
        mc:           id,
        type:         'reubicacion',
        manufacturer: String(patch.manufacturer ?? prev.manufacturer),
        game2024:     prev.game,
        game2025:     prev.game,
        location2024: prev.location,
        location2025: newLocation,
        bank:         parseInt(prev.location.split('-')[0], 10),
        periodLabel:  String(patch.period ?? prev.period ?? ''),
      });
    }
    if (gameChanged && locationChanged) {
      changesToInsert.push({
        mc:           id,
        type:         'cambio_juego',
        manufacturer: String(patch.manufacturer ?? prev.manufacturer),
        game2024:     prev.game,
        game2025:     newGame,
        location2024: prev.location,
        location2025: newLocation,
        bank:         parseInt(prev.location.split('-')[0], 10),
        periodLabel:  String(patch.period ?? prev.period ?? ''),
      });
    }

    if (changesToInsert.length === 0) return;

    const dbRows = changesToInsert.map(c => ({
      mc:           c.mc,
      type:         c.type,
      manufacturer: c.manufacturer,
      game_2024:    c.game2024   ?? null,
      game_2025:    c.game2025   ?? null,
      location_2024: c.location2024 ?? null,
      location_2025: c.location2025 ?? null,
      bank:         c.bank,
      period_label: c.periodLabel ?? null,
    }));

    const { data: inserted } = await supabase.from('machine_changes').insert(dbRows).select();
    if (inserted) {
      const newChanges = inserted.map(r => rowToChange(r as Record<string, unknown>));
      set(s => ({ machineChanges: [...newChanges, ...s.machineChanges] }));
    }
  },

  async batchUpdateMachines(ids, patch) {
    const idSet  = new Set(ids);
    const updated = get().machines.map(m => idSet.has(m.id) ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });
    for (const id of ids) {
      await supabase.from('machines').update(machineToDbPatch(patch)).eq('id', id);
    }
  },

  // ── explorer ──────────────────────────────────────────────────────────────
  setExplorerSearch:    (q)          => set({ explorerSearch: q }),
  setExplorerFilter:    (key, value) => set(s => ({ explorerFilters: { ...s.explorerFilters, [key]: value } })),
  clearExplorerFilters: ()           => set({ explorerSearch: '', explorerFilters: { manufacturer: null, type: null, denomination: null } }),

  // ── selectors ─────────────────────────────────────────────────────────────
  getFilteredMachines() {
    const { machines, explorerSearch, explorerFilters: f } = get();
    const q = explorerSearch.toLowerCase().trim();
    return machines.filter(m => {
      if (!m.active) return false;
      if (f.manufacturer && m.manufacturer !== f.manufacturer) return false;
      if (f.type         && m.type         !== f.type)         return false;
      if (f.denomination && m.denomination !== f.denomination) return false;
      if (q && ![m.id, m.game, m.manufacturer, m.location]
        .some(s => s.toLowerCase().includes(q))) return false;
      return true;
    }).sort((a, b) => {
      const [bankA, posA] = a.location.split('-').map(Number);
      const [bankB, posB] = b.location.split('-').map(Number);
      return bankA !== bankB ? bankA - bankB : posA - posB;
    });
  },

  getBankGroups() {
    return buildBankGroups(get().machines);
  },

  getBankRanking(metric) {
    const groups = buildBankGroups(get().machines);
    const sorted = [...groups].sort((a, b) =>
      metric === 'avgWin' ? b.avgWin - a.avgWin : b.avgCoinIn - a.avgCoinIn
    );
    return {
      best:  sorted.slice(0, 5),
      worst: sorted.slice(-5).reverse(),
    };
  },

  getTopMachines(metric, n = 10) {
    return [...get().machines]
      .filter(m => m.avgCoinIn != null && m.avgWin != null)
      .sort((a, b) =>
        metric === 'avgWin'
          ? (b.avgWin ?? 0) - (a.avgWin ?? 0)
          : (b.avgCoinIn ?? 0) - (a.avgCoinIn ?? 0)
      )
      .slice(0, n);
  },
}));
