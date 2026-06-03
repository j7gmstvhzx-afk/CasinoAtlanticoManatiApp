import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { calcPeriodTotal, periodStart, toDateString, subDays } from '@/utils/dateRange';
import type {
  SlotMachine, CoinInEntry, FloorStats, ExplorerFilters, MachineChange,
  CoinInPeriod, SlotManufacturer, SlotMachineType,
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

  return {
    total:       machines.length,
    active:      active.length,
    easyBet:     active.filter(m => m.type === 'Easy Bet').length,
    multiLine:   active.filter(m => m.type === 'Multi Line').length,
    multiDeno:   active.filter(m => m.multiDeno).length,
    singleDeno:  active.filter(m => !m.multiDeno).length,
    byManufacturer,
    byDenomination,
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
  };
}

function rowToCoinIn(row: Record<string, unknown>): CoinInEntry {
  return {
    machineId: String(row.machine_id),
    date:      String(row.date),
    amount:    Number(row.amount),
  };
}

function rowToChange(row: Record<string, unknown>): MachineChange {
  return {
    mc:           String(row.mc),
    type:         row.type as MachineChange['type'],
    manufacturer: row.manufacturer as SlotManufacturer,
    game2024:     row.game_2024 != null ? String(row.game_2024) : undefined,
    game2025:     String(row.game_2025 ?? ''),
    location2024: row.location_2024 != null ? String(row.location_2024) : undefined,
    location2025: String(row.location_2025 ?? ''),
    bank:         Number(row.bank ?? 0),
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
  db.updated_at = new Date().toISOString();
  return db;
}

// ── Store interface ───────────────────────────────────────────────────────────

export type BankGroup = {
  bank: string;
  machines: SlotMachine[];
  totalCoinIn: number;
  topGame: string;
};

interface SlotFloorStore {
  initialized:     boolean;
  machines:        SlotMachine[];
  coinIn:          CoinInEntry[];
  machineChanges:  MachineChange[];
  floorStats:      FloorStats;
  explorerSearch:  string;
  explorerFilters: ExplorerFilters;

  init:                  () => Promise<void>;
  updateMachine:         (id: string, patch: Partial<SlotMachine>) => Promise<void>;
  batchUpdateMachines:   (ids: string[], patch: Partial<SlotMachine>) => Promise<void>;
  addOrUpdateCoinIn:     (entry: CoinInEntry) => Promise<void>;
  setExplorerSearch:     (q: string) => void;
  setExplorerFilter:     (key: keyof ExplorerFilters, value: string | null) => void;
  clearExplorerFilters:  () => void;

  getFilteredMachines:    () => SlotMachine[];
  getPeriodTotal:         (period: CoinInPeriod, machineId?: string) => number;
  getTopMachinesByCoinIn: (period: CoinInPeriod, n?: number) => Array<{ machine: SlotMachine; total: number }>;
  getBankGroups:          (period: CoinInPeriod) => BankGroup[];
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
      const [mRes, cRes, chRes] = await Promise.all([
        supabase.from('machines').select('*'),
        // .range(0, 50000) bypasses the default 1000-row cap
        supabase.from('coin_in_entries').select('*').range(0, 50000),
        supabase.from('machine_changes').select('*'),
      ]);

      const machines       = (mRes.data  ?? []).map(r => rowToMachine(r as Record<string, unknown>));
      const coinIn         = (cRes.data  ?? []).map(r => rowToCoinIn(r as Record<string, unknown>));
      const machineChanges = (chRes.data ?? []).map(r => rowToChange(r as Record<string, unknown>));

      set({ initialized: true, machines, coinIn, machineChanges, floorStats: computeFloorStats(machines) });
    } catch {
      set({ initialized: true });
    }
  },

  // ── machine edits ─────────────────────────────────────────────────────────
  async updateMachine(id, patch) {
    const updated = get().machines.map(m => m.id === id ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });
    await supabase.from('machines').update(machineToDbPatch(patch)).eq('id', id);
  },

  async batchUpdateMachines(ids, patch) {
    const idSet  = new Set(ids);
    const updated = get().machines.map(m => idSet.has(m.id) ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });
    for (const id of ids) {
      await supabase.from('machines').update(machineToDbPatch(patch)).eq('id', id);
    }
  },

  // ── coin-in ───────────────────────────────────────────────────────────────
  async addOrUpdateCoinIn(entry) {
    const prev = get().coinIn;
    const idx  = prev.findIndex(e => e.machineId === entry.machineId && e.date === entry.date);
    const upserted = idx >= 0
      ? prev.map((e, i) => (i === idx ? entry : e))
      : [...prev, entry];
    const cutoff = toDateString(subDays(new Date(), 400));
    const updated = upserted.filter(e => e.date >= cutoff);
    set({ coinIn: updated });
    await supabase.from('coin_in_entries').upsert({
      machine_id: entry.machineId,
      date:       entry.date,
      amount:     entry.amount,
    });
  },

  // ── explorer ──────────────────────────────────────────────────────────────
  setExplorerSearch:    (q)         => set({ explorerSearch: q }),
  setExplorerFilter:    (key, value) => set(s => ({ explorerFilters: { ...s.explorerFilters, [key]: value } })),
  clearExplorerFilters: ()          => set({ explorerSearch: '', explorerFilters: { manufacturer: null, type: null, denomination: null } }),

  // ── selectors ─────────────────────────────────────────────────────────────
  getFilteredMachines() {
    const { machines, explorerSearch, explorerFilters: f } = get();
    const q = explorerSearch.toLowerCase().trim();
    return machines.filter(m => {
      if (f.manufacturer && m.manufacturer !== f.manufacturer) return false;
      if (f.type         && m.type         !== f.type)         return false;
      if (f.denomination && m.denomination !== f.denomination) return false;
      if (q && ![m.id, m.game, m.manufacturer, m.location]
        .some(s => s.toLowerCase().includes(q))) return false;
      return true;
    });
  },

  getPeriodTotal(period, machineId) {
    const entries = machineId
      ? get().coinIn.filter(e => e.machineId === machineId)
      : get().coinIn;
    return calcPeriodTotal(entries, period);
  },

  getTopMachinesByCoinIn(period, n = 10) {
    const { machines, coinIn } = get();
    const fromStr = toDateString(periodStart(period));
    const toStr   = toDateString(new Date());
    return machines
      .map(machine => ({
        machine,
        total: coinIn
          .filter(e => e.machineId === machine.id && e.date >= fromStr && e.date <= toStr)
          .reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, n);
  },

  getBankGroups(period) {
    const { machines, coinIn } = get();
    const fromStr = toDateString(periodStart(period));
    const toStr   = toDateString(new Date());

    const machineBankMap = new Map(machines.map(m => [m.id, m.location.split('-')[0]]));

    const bankMap = new Map<string, { machines: SlotMachine[]; coinInByMachine: Map<string, number> }>();
    for (const m of machines) {
      const bank = m.location.split('-')[0];
      if (!bankMap.has(bank)) bankMap.set(bank, { machines: [], coinInByMachine: new Map() });
      bankMap.get(bank)!.machines.push(m);
    }

    for (const entry of coinIn) {
      if (entry.date < fromStr || entry.date > toStr) continue;
      const bank = machineBankMap.get(entry.machineId);
      if (!bank) continue;
      const group = bankMap.get(bank);
      if (!group) continue;
      group.coinInByMachine.set(
        entry.machineId,
        (group.coinInByMachine.get(entry.machineId) ?? 0) + entry.amount,
      );
    }

    return Array.from(bankMap.entries())
      .map(([bank, data]) => {
        const totalCoinIn = Array.from(data.coinInByMachine.values()).reduce((s, v) => s + v, 0);
        let topGame = '';
        let topAmt  = 0;
        for (const m of data.machines) {
          const amt = data.coinInByMachine.get(m.id) ?? 0;
          if (amt > topAmt) { topAmt = amt; topGame = m.game; }
        }
        return {
          bank,
          machines:    data.machines,
          totalCoinIn,
          topGame: topGame || (data.machines[0]?.game ?? ''),
        };
      })
      .sort((a, b) => b.totalCoinIn - a.totalCoinIn);
  },
}));
