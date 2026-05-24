import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { seedSlotMachines } from '@/data/slotMachines';
import { generateSeedCoinIn } from '@/data/seedCoinIn';
import { calcPeriodTotal, periodStart, toDateString, subDays } from '@/utils/dateRange';
import type {
  SlotMachine, CoinInEntry, FloorStats, ExplorerFilters,
  CoinInPeriod, SlotManufacturer, SlotMachineType,
} from '@/types/domain';

const MACHINES_KEY = 'slotfloor:machines';
const COININ_KEY   = 'slotfloor:coinIn';

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

  const allMin = active.map(m => m.minBet);
  const minBetSum = allMin.reduce((s, v) => s + v, 0);
  const accessible = active.filter(m => m.minBet <= 0.40);
  const high       = active.filter(m => m.minBet >= 0.50);
  const accSum = accessible.reduce((s, m) => s + m.minBet, 0);
  const hiSum  = high.reduce((s, m) => s + m.minBet, 0);

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
    min: vals.length ? vals.reduce((a, b) => (b < a ? b : a)) : 0,
    max: vals.length ? vals.reduce((a, b) => (b > a ? b : a)) : 0,
    avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0,
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

// ── Store interface ───────────────────────────────────────────────────────────

interface SlotFloorStore {
  initialized: boolean;
  machines:    SlotMachine[];
  coinIn:      CoinInEntry[];
  floorStats:  FloorStats;
  explorerSearch:  string;
  explorerFilters: ExplorerFilters;

  init:                 () => Promise<void>;
  updateMachine:        (id: string, patch: Partial<SlotMachine>) => Promise<void>;
  batchUpdateMachines:  (ids: string[], patch: Partial<SlotMachine>) => Promise<void>;
  addOrUpdateCoinIn:    (entry: CoinInEntry) => Promise<void>;
  setExplorerSearch:    (q: string) => void;
  setExplorerFilter:    (key: keyof ExplorerFilters, value: string | null) => void;
  clearExplorerFilters: () => void;

  getFilteredMachines:   () => SlotMachine[];
  getPeriodTotal:        (period: CoinInPeriod, machineId?: string) => number;
  getTopMachinesByCoinIn:(period: CoinInPeriod, n?: number) => Array<{ machine: SlotMachine; total: number }>;
}

const EMPTY_STATS = computeFloorStats([]);

export const useSlotFloorStore = create<SlotFloorStore>((set, get) => ({
  initialized:     false,
  machines:        [],
  coinIn:          [],
  floorStats:      EMPTY_STATS,
  explorerSearch:  '',
  explorerFilters: { manufacturer: null, type: null, denomination: null },

  // ── init ──────────────────────────────────────────────────────────────────
  async init() {
    if (get().initialized) return;
    try {
      const [mJson, cJson] = await Promise.all([
        AsyncStorage.getItem(MACHINES_KEY),
        AsyncStorage.getItem(COININ_KEY),
      ]);
      const machines: SlotMachine[] = mJson ? JSON.parse(mJson) : seedSlotMachines;
      const coinIn:   CoinInEntry[] = cJson  ? JSON.parse(cJson)  : generateSeedCoinIn(machines);
      if (!mJson) await AsyncStorage.setItem(MACHINES_KEY, JSON.stringify(machines));
      if (!cJson) await AsyncStorage.setItem(COININ_KEY,   JSON.stringify(coinIn));
      set({ initialized: true, machines, coinIn, floorStats: computeFloorStats(machines) });
    } catch {
      const machines = seedSlotMachines;
      const coinIn   = generateSeedCoinIn(machines);
      set({ initialized: true, machines, coinIn, floorStats: computeFloorStats(machines) });
    }
  },

  // ── machine edits ─────────────────────────────────────────────────────────
  async updateMachine(id, patch) {
    const updated = get().machines.map(m => m.id === id ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });
    try { await AsyncStorage.setItem(MACHINES_KEY, JSON.stringify(updated)); } catch {}
  },

  async batchUpdateMachines(ids, patch) {
    const idSet = new Set(ids);
    const updated = get().machines.map(m => idSet.has(m.id) ? { ...m, ...patch } : m);
    set({ machines: updated, floorStats: computeFloorStats(updated) });
    try { await AsyncStorage.setItem(MACHINES_KEY, JSON.stringify(updated)); } catch {}
  },

  // ── coin-in ───────────────────────────────────────────────────────────────
  async addOrUpdateCoinIn(entry) {
    const prev = get().coinIn;
    const idx  = prev.findIndex(e => e.machineId === entry.machineId && e.date === entry.date);
    const upserted = idx >= 0
      ? prev.map((e, i) => (i === idx ? entry : e))
      : [...prev, entry];
    // Keep at most 400 days of history to bound AsyncStorage size
    const cutoff = toDateString(subDays(new Date(), 400));
    const updated = upserted.filter(e => e.date >= cutoff);
    set({ coinIn: updated });
    try { await AsyncStorage.setItem(COININ_KEY, JSON.stringify(updated)); } catch {}
  },

  // ── explorer ──────────────────────────────────────────────────────────────
  setExplorerSearch: (q) => set({ explorerSearch: q }),
  setExplorerFilter: (key, value) =>
    set(s => ({ explorerFilters: { ...s.explorerFilters, [key]: value } })),
  clearExplorerFilters: () =>
    set({ explorerSearch: '', explorerFilters: { manufacturer: null, type: null, denomination: null } }),

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
    const totals = machines.map(machine => {
      const total = coinIn
        .filter(e => e.machineId === machine.id && e.date >= fromStr && e.date <= toStr)
        .reduce((s, e) => s + e.amount, 0);
      return { machine, total };
    });
    return totals.sort((a, b) => b.total - a.total).slice(0, n);
  },
}));
