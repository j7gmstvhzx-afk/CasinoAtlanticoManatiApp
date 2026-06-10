import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money, mfrColor, shortMfr, bankOf } from './shared';
import { SLOT_FLOOR_2025, type SlotEntry2025 } from '@/data/slotFloor2025';
import type { SlotMachine } from '@/types/domain';

type Metric = 'avgCoinIn' | 'avgWin';

type Props = {
  machines: SlotMachine[];
  metric: Metric;
};

type Row = { machine: SlotMachine; ref: SlotEntry2025 | null };

// A row is comparable only when the position has 2025 data AND the current
// machine already has data entered — otherwise a new machine at an old
// position would render as a false −100% drop.
function isComparable(r: Row): boolean {
  return r.ref !== null && r.machine.avgCoinIn != null && r.machine.avgWin != null;
}

type BankCompare = {
  bank: string;
  rows: Row[];
  matched: number;
  ciNow: number;
  ci2025: number;
  winNow: number;
  win2025: number;
};

// ── Delta math ────────────────────────────────────────────────────────────────

type Delta = { diff: number; pct: number; dir: 'up' | 'down' | 'flat' };

function diffOf(now: number, then: number): Delta {
  const diff = now - then;
  if (Math.abs(diff) < 0.005) return { diff: 0, pct: 0, dir: 'flat' };
  const pct = then !== 0 ? (diff / then) * 100 : 0;
  return { diff, pct, dir: diff > 0 ? 'up' : 'down' };
}

const DIR_COLOR: Record<Delta['dir'], string> = { up: C.green, down: C.red, flat: C.muted };
const DIR_ICON:  Record<Delta['dir'], keyof typeof Ionicons.glyphMap> = { up: 'arrow-up', down: 'arrow-down', flat: 'remove' };

function DeltaChip({ d, compact = false }: { d: Delta; compact?: boolean }) {
  const color = DIR_COLOR[d.dir];
  return (
    <View style={[styles.deltaChip, { borderColor: color + '45', backgroundColor: color + '12' }]}>
      <Ionicons name={DIR_ICON[d.dir]} size={compact ? 9 : 10} color={color} />
      <Text style={[styles.deltaChipText, compact && { fontSize: 9 }, { color }]}>
        {d.dir === 'up' ? '+' : ''}{d.pct.toFixed(1)}%
      </Text>
    </View>
  );
}

// ── Build comparison groups ───────────────────────────────────────────────────

function buildComparisons(machines: SlotMachine[]): BankCompare[] {
  const byBank = new Map<string, Row[]>();
  for (const m of machines) {
    const bank = bankOf(m.location);
    const row: Row = { machine: m, ref: SLOT_FLOOR_2025[m.location] ?? null };
    if (!byBank.has(bank)) byBank.set(bank, []);
    byBank.get(bank)!.push(row);
  }

  return Array.from(byBank.entries())
    .map(([bank, rows]) => {
      const sorted = [...rows].sort((a, b) =>
        parseInt(a.machine.location.split('-')[1] ?? '0', 10) - parseInt(b.machine.location.split('-')[1] ?? '0', 10));
      const matchedRows = sorted.filter(isComparable);
      const n = matchedRows.length || 1;
      const sum = (pick: (r: Row) => number) => matchedRows.reduce((s, r) => s + pick(r), 0);
      return {
        bank,
        rows: sorted,
        matched: matchedRows.length,
        ciNow:   sum(r => r.machine.avgCoinIn ?? 0) / n,
        ci2025:  sum(r => r.ref?.avgCoinIn ?? 0)    / n,
        winNow:  sum(r => r.machine.avgWin ?? 0)    / n,
        win2025: sum(r => r.ref?.avgWin ?? 0)       / n,
      };
    })
    .sort((a, b) => parseInt(a.bank, 10) - parseInt(b.bank, 10));
}

// ── Compact "2025 → Actual  Δ%" metric block ──────────────────────────────────

function CompareMetric({ label, then, now, accent, active }: { label: string; then: number; now: number; accent: string; active?: boolean }) {
  const d = diffOf(now, then);
  return (
    <View style={[styles.metricBlock, active && { backgroundColor: accent + '12', borderWidth: 1, borderColor: accent + '35' }]}>
      <Text style={[styles.metricLabel, active && { color: accent }]}>{label}{active ? ' · ranking activo' : ''}</Text>
      <View style={styles.metricValuesRow}>
        <Text style={styles.metricThen}>{money(then, 0)}</Text>
        <Ionicons name="arrow-forward" size={11} color={C.faint} style={{ marginHorizontal: 4 }} />
        <Text style={[styles.metricNow, { color: accent }]}>{money(now, 0)}</Text>
      </View>
      <DeltaChip d={d} />
    </View>
  );
}

// ── Per-machine comparison row ────────────────────────────────────────────────

function CompareRow({ row }: { row: Row }) {
  const { machine: m, ref } = row;
  const mfrBg = mfrColor(m.manufacturer, 0);

  return (
    <View style={styles.row}>
      <View style={[styles.accentBar, { backgroundColor: mfrBg }]} />

      <View style={styles.idCol}>
        <Text style={styles.machineId}>{m.id}</Text>
        <Text style={styles.location}>{m.location}</Text>
      </View>

      <View style={styles.gameCol}>
        <Text style={styles.game} numberOfLines={2}>{m.game}</Text>
        <View style={[styles.mfrPill, { backgroundColor: mfrBg + '15', borderColor: mfrBg + '45' }]}>
          <Text style={[styles.mfrText, { color: mfrBg }]}>{shortMfr(m.manufacturer)}</Text>
        </View>
      </View>

      {isComparable(row) && ref ? (
        <View style={styles.deltaPanel}>
          <MiniDelta label="CI"  then={ref.avgCoinIn} now={m.avgCoinIn ?? 0} color={C.navy3} />
          <View style={styles.miniDivider} />
          <MiniDelta label="WIN" then={ref.avgWin}    now={m.avgWin ?? 0}    color={C.green} />
        </View>
      ) : (
        <View style={styles.noMatch}>
          <Text style={styles.noMatchText}>
            {ref === null ? 'Sin dato 2025' : 'Máquina nueva · sin dato actual'}
          </Text>
        </View>
      )}
    </View>
  );
}

function MiniDelta({ label, then, now, color }: { label: string; then: number; now: number; color: string }) {
  const d = diffOf(now, then);
  return (
    <View style={styles.miniDelta}>
      <Text style={styles.miniLabel}>{label} 2025 → Actual</Text>
      <View style={styles.miniValuesRow}>
        <Text style={styles.miniThen}>{money(then, 0)}</Text>
        <Ionicons name="arrow-forward" size={9} color={C.faint} style={{ marginHorizontal: 3 }} />
        <Text style={[styles.miniNow, { color }]}>{money(now, 0)}</Text>
      </View>
      <DeltaChip d={d} compact />
    </View>
  );
}

// ── Bank comparison card ──────────────────────────────────────────────────────

function BankCompareCard({ group, metric }: { group: BankCompare; metric: Metric }) {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const bank = group.bank.padStart(2, '0');

  return (
    <View style={styles.card}>
      <Pressable style={styles.cardHeader} onPress={() => setExpanded(e => !e)} android_ripple={{ color: '#f0f0f0' }}>
        <View style={styles.bankBadge}>
          <Text style={styles.bankNum}>Banco</Text>
          <Text style={styles.bankNumLg}>{bank}</Text>
          <Text style={styles.bankCount}>{group.rows.length} máqs</Text>
          {group.matched < group.rows.length && (
            <Text style={styles.bankUnmatched}>{group.rows.length - group.matched} sin comparar</Text>
          )}
        </View>

        {group.matched > 0 ? (
          <View style={[styles.metricsRow, !isWide && styles.metricsRowNarrow]}>
            <CompareMetric label="Avg Coin-In: 2025 → Actual" then={group.ci2025}  now={group.ciNow}  accent={C.navy3} active={metric === 'avgCoinIn'} />
            <CompareMetric label="Avg Win: 2025 → Actual"     then={group.win2025} now={group.winNow} accent={C.green} active={metric === 'avgWin'} />
          </View>
        ) : (
          <View style={[styles.metricsRow, styles.noCompareBox]}>
            <Ionicons name="information-circle-outline" size={14} color={C.muted} />
            <Text style={styles.noCompareText}>Sin datos para comparar — máquinas nuevas pendientes de registro</Text>
          </View>
        )}

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.muted} />
      </Pressable>

      {expanded && (
        <View style={styles.machineList}>
          <View style={styles.machineListHeader}>
            <Text style={styles.mlhText}>Posición · Juego · Fabricante</Text>
            <Text style={styles.mlhText}>2025 → Actual · Diferencia (fluctuación)</Text>
          </View>
          {group.rows.map(row => <CompareRow key={row.machine.id} row={row} />)}
        </View>
      )}
    </View>
  );
}

// ── Section root ──────────────────────────────────────────────────────────────

export function Comparativa2025({ machines, metric }: Props) {
  const groups = useMemo(() => buildComparisons(machines), [machines]);

  const totals = useMemo(() => {
    const matched = groups.reduce((s, g) => s + g.matched, 0);
    const total   = groups.reduce((s, g) => s + g.rows.length, 0);
    return { matched, total };
  }, [groups]);

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Ionicons name="git-compare-outline" size={16} color={C.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>Comparativa de rendimiento vs. 2025</Text>
          <Text style={styles.introSub}>
            Cada posición del piso (ej. 09-01) comparada contra su misma posición en el snapshot 2025 ·
            {' '}{totals.matched} de {totals.total} máquinas comparables
          </Text>
        </View>
      </View>

      {groups.map(g => <BankCompareCard key={g.bank} group={g} metric={metric} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fdf5e7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.gold + '40',
    padding: 14,
    alignItems: 'flex-start',
  },
  introIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.gold + '55',
  },
  introTitle: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 3 },
  introSub:   { fontSize: 11.5, color: C.navy3, lineHeight: 16 },

  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  bankBadge: {
    width: 70,
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 1,
  },
  bankNum: {
    fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  bankNumLg: { fontSize: 22, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  bankCount: { fontSize: 10, color: C.muted, marginTop: 2 },
  bankUnmatched: { fontSize: 8, color: C.red, marginTop: 1, fontWeight: '700' },

  metricsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  metricsRowNarrow: {
    flexDirection: 'column',
    gap: 8,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: C.track,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  metricLabel: { fontSize: 9, fontWeight: '700', color: C.muted, letterSpacing: 0.3, textTransform: 'uppercase' },
  metricValuesRow: { flexDirection: 'row', alignItems: 'baseline' },
  metricThen: { fontSize: 13, fontWeight: '600', color: C.faint, textDecorationLine: 'line-through' },
  metricNow:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },

  deltaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start',
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  deltaChipText: { fontSize: 10, fontWeight: '800' },

  machineList: { borderTopWidth: 1, borderTopColor: C.border },
  machineListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  mlhText: {
    fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase',
  },

  // Per-machine comparison row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    minHeight: 64,
    overflow: 'hidden',
  },
  accentBar: { width: 3, alignSelf: 'stretch' },
  idCol: { width: 54, paddingVertical: 10, paddingLeft: 10, gap: 3 },
  machineId: { fontSize: 14, fontWeight: '800', color: C.navy, letterSpacing: -0.3 },
  location:  { fontSize: 10, fontWeight: '700', color: C.gold, letterSpacing: 0.3 },
  gameCol: { flex: 1, paddingVertical: 10, paddingHorizontal: 10, gap: 5, minWidth: 120 },
  game: { fontSize: 13, fontWeight: '600', color: C.text, lineHeight: 17 },
  mfrPill: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  mfrText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },

  deltaPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.track,
    borderRadius: 8,
    marginVertical: 8,
    marginRight: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    gap: 10,
  },
  miniDivider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: '#d0d8e4' },
  miniDelta: { alignItems: 'flex-start', gap: 2, minWidth: 110 },
  miniLabel: { fontSize: 8, fontWeight: '700', color: C.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  miniValuesRow: { flexDirection: 'row', alignItems: 'baseline' },
  miniThen: { fontSize: 11, fontWeight: '600', color: C.faint, textDecorationLine: 'line-through' },
  miniNow:  { fontSize: 13, fontWeight: '800', letterSpacing: -0.3 },

  noMatch: {
    paddingHorizontal: 16, paddingVertical: 10, marginRight: 8,
  },
  noMatchText: { fontSize: 11, color: C.muted, fontStyle: 'italic' },

  noCompareBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.track, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 12,
  },
  noCompareText: { fontSize: 11, color: C.muted, fontStyle: 'italic', flex: 1 },
});
