import React, { useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money } from './shared';
import { AnimatedPressable as Pressable } from './AnimatedPressable';
import { FLOOR_LAYOUT, FLOOR_COLUMNS } from '@/data/floorLayout';
import { SLOT_FLOOR_2025 } from '@/data/slotFloor2025';
import type { BankGroup } from '@/store/useSlotFloorStore';

type Metric = 'avgCoinIn' | 'avgWin';

type Props = {
  groups: BankGroup[];
  metric: Metric;
  onOpenBank: (bank: string) => void;
};

// Sequential 5-step performance scale (worst → best quintile).
// Desaturated on purpose: this is data variance, not an alarm panel.
const HEAT_COLORS = ['#e3b1b1', '#e6c3a4', '#e0d4a8', '#bcdcae', '#8cc97f'];
const NO_DATA_BG  = '#eef1f4';

// Delta-vs-2025 buckets: <−20% · −20..0 · 0..+20 · >+20 (diverging, muted).
const DELTA_COLORS = ['#e3a8a8', '#eccfc4', '#cfe4c4', '#93cc85'];
const DELTA_LABELS = ['< −20%', '−20–0%', '0–+20%', '> +20%'];

function deltaBucket(delta: number): number {
  if (delta < -20) return 0;
  if (delta < 0)   return 1;
  if (delta <= 20) return 2;
  return 3;
}

type HeatMode = 'perf' | 'delta';

function metricOf(g: BankGroup, metric: Metric): number {
  return metric === 'avgWin' ? g.avgWin : g.avgCoinIn;
}

// Avg delta vs the 2025 snapshot for the bank's comparable machines (both the
// position's 2025 reference and current data must exist), or null if none.
function bankDelta2025(g: BankGroup, metric: Metric): number | null {
  let nowSum = 0, thenSum = 0, n = 0;
  for (const m of g.machines) {
    const ref = SLOT_FLOOR_2025[m.location];
    if (!ref || m.avgCoinIn == null || m.avgWin == null) continue;
    nowSum  += metric === 'avgWin' ? m.avgWin : m.avgCoinIn;
    thenSum += metric === 'avgWin' ? ref.avgWin : ref.avgCoinIn;
    n++;
  }
  if (n === 0 || thenSum === 0) return null;
  return ((nowSum - thenSum) / thenSum) * 100;
}

export function FloorHeatmap({ groups, metric, onOpenBank }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<HeatMode>('perf');
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const byBankNum = useMemo(() => new Map(groups.map(g => [g.bankNum, g])), [groups]);

  // Delta vs 2025 per bank (null when nothing comparable) for the delta mode.
  const deltas = useMemo(() => {
    const map = new Map<number, number | null>();
    for (const g of groups) map.set(g.bankNum, bankDelta2025(g, metric));
    return map;
  }, [groups, metric]);

  // Quintile per bank: rank within the banks that have data for the metric.
  const quintiles = useMemo(() => {
    const withData = groups.filter(g => metricOf(g, metric) > 0);
    const sorted = [...withData].sort((a, b) => metricOf(a, metric) - metricOf(b, metric));
    const map = new Map<number, number>();
    sorted.forEach((g, i) => {
      map.set(g.bankNum, Math.min(Math.floor((i / sorted.length) * 5), 4));
    });
    return map;
  }, [groups, metric]);

  // Cells: configured layout first, then any banks in the data the layout
  // doesn't know about (appended in order after the last configured row).
  const cells = useMemo(() => {
    const known = new Set(FLOOR_LAYOUT.map(c => c.bank));
    const extras = groups.filter(g => !known.has(g.bankNum)).map(g => g.bankNum).sort((a, b) => a - b);
    const lastRow = FLOOR_LAYOUT.reduce((m, c) => Math.max(m, c.row), 0);
    return [
      ...FLOOR_LAYOUT,
      ...extras.map((bank, i) => ({
        bank,
        row: lastRow + 1 + Math.floor(i / FLOOR_COLUMNS),
        col: i % FLOOR_COLUMNS,
      })),
    ];
  }, [groups]);

  const rows = useMemo(() => {
    const map = new Map<number, typeof cells>();
    for (const c of cells) {
      if (!map.has(c.row)) map.set(c.row, []);
      map.get(c.row)!.push(c);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, rowCells]) => [...rowCells].sort((a, b) => a.col - b.col));
  }, [cells]);

  const selectedGroup = selected != null
    ? groups.find(g => g.bank === selected) ?? null
    : null;
  const selectedDelta = selectedGroup ? bankDelta2025(selectedGroup, metric) : null;

  const metricLabel = metric === 'avgWin' ? 'Avg Win PD' : 'Avg Coin-In PD';

  return (
    <View style={{ gap: 14 }}>
      {/* Color-mode toggle: absolute performance vs delta against 2025 */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, mode === 'perf' && styles.modeBtnActive]}
          onPress={() => setMode('perf')}
          hoverScale={1.03}
        >
          <Text style={[styles.modeBtnText, mode === 'perf' && styles.modeBtnTextActive]}>Rendimiento actual</Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === 'delta' && styles.modeBtnActive]}
          onPress={() => setMode('delta')}
          hoverScale={1.03}
        >
          <Text style={[styles.modeBtnText, mode === 'delta' && styles.modeBtnTextActive]}>Δ vs 2025</Text>
        </Pressable>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {rows.map((rowCells, ri) => (
          <View key={ri} style={styles.gridRow}>
            {Array.from({ length: FLOOR_COLUMNS }, (_, col) => {
              const cell = rowCells.find(c => c.col === col);
              if (!cell) return <View key={col} style={styles.cellSlot} />;
              const group = byBankNum.get(cell.bank);
              let bg = NO_DATA_BG;
              let noData = true;
              let sub = group ? `${group.machines.length} máq` : null;
              if (group) {
                if (mode === 'perf') {
                  const q = quintiles.get(cell.bank);
                  if (q != null) { bg = HEAT_COLORS[q]; noData = false; }
                } else {
                  const d = deltas.get(cell.bank);
                  if (d != null) {
                    bg = DELTA_COLORS[deltaBucket(d)];
                    noData = false;
                    sub = `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`;
                  }
                }
              }
              const isSel = group != null && group.bank === selected;
              return (
                <View key={col} style={styles.cellSlot}>
                  <Pressable
                    style={[
                      styles.cell,
                      { backgroundColor: bg },
                      isSel && styles.cellSelected,
                      !group && styles.cellAbsent,
                    ]}
                    disabled={!group}
                    onPress={() => group && setSelected(isSel ? null : group.bank)}
                    hoverScale={group ? 1.05 : 1}
                  >
                    <Text style={[styles.cellBank, noData && styles.cellBankNoData]}>
                      {String(cell.bank).padStart(2, '0')}
                    </Text>
                    {sub ? (
                      <Text style={[styles.cellCount, noData && styles.cellBankNoData]}>{sub}</Text>
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={[styles.legend, !isWide && { flexWrap: 'wrap' }]}>
        {mode === 'perf' ? (
          <>
            <Text style={styles.legendLabel}>{metricLabel} del banco:</Text>
            <View style={styles.legendScale}>
              <Text style={styles.legendEnd}>Bajo</Text>
              {HEAT_COLORS.map(c => <View key={c} style={[styles.legendSwatch, { backgroundColor: c }]} />)}
              <Text style={styles.legendEnd}>Alto</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.legendLabel}>Δ {metricLabel} vs 2025:</Text>
            <View style={styles.legendScale}>
              {DELTA_COLORS.map((c, i) => (
                <View key={c} style={styles.legendScale}>
                  <View style={[styles.legendSwatch, { backgroundColor: c }]} />
                  <Text style={styles.legendEnd}>{DELTA_LABELS[i]}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={styles.legendScale}>
          <View style={[styles.legendSwatch, { backgroundColor: NO_DATA_BG }]} />
          <Text style={styles.legendEnd}>{mode === 'perf' ? 'Sin datos' : 'Sin dato 2025'}</Text>
        </View>
      </View>

      {/* Detail panel for the selected bank */}
      {selectedGroup && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Banco {selectedGroup.bank.padStart(2, '0')}</Text>
              <Text style={styles.panelSub}>
                {selectedGroup.machines.length} máquinas · Juego principal: {selectedGroup.topGame || '—'}
              </Text>
            </View>
            <Pressable style={styles.panelBtn} onPress={() => onOpenBank(selectedGroup.bank)} hoverScale={1.04}>
              <Text style={styles.panelBtnText}>Ver banco</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.panelMetrics}>
            <View style={styles.panelMetric}>
              <Text style={styles.panelMetricValue}>{money(selectedGroup.avgCoinIn, 0)}</Text>
              <Text style={styles.panelMetricLabel}>Avg Coin-In PD</Text>
            </View>
            <View style={[styles.panelMetric, styles.panelMetricBorder]}>
              <Text style={[styles.panelMetricValue, { color: C.green }]}>{money(selectedGroup.avgWin, 0)}</Text>
              <Text style={styles.panelMetricLabel}>Avg Win PD</Text>
            </View>
            <View style={[styles.panelMetric, styles.panelMetricBorder]}>
              <Text style={[styles.panelMetricValue, { color: C.gold }]}>{money(selectedGroup.avgWin * 0.50, 0)}</Text>
              <Text style={styles.panelMetricLabel}>WWCJPR PD</Text>
            </View>
            <View style={[styles.panelMetric, styles.panelMetricBorder]}>
              {selectedDelta != null ? (
                <Text style={[styles.panelMetricValue, { color: selectedDelta >= 0 ? C.green : C.red }]}>
                  {selectedDelta >= 0 ? '+' : ''}{selectedDelta.toFixed(1)}%
                </Text>
              ) : (
                <Text style={[styles.panelMetricValue, { color: C.faint }]}>—</Text>
              )}
              <Text style={styles.panelMetricLabel}>vs 2025 ({metric === 'avgWin' ? 'Win' : 'CI'})</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {!selectedGroup && (
        <Text style={styles.hint}>Toca un banco para ver sus métricas y abrir su detalle.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  modeBtnActive:     { backgroundColor: C.navy, borderColor: C.navy },
  modeBtnText:       { fontSize: 12, fontWeight: '600', color: C.muted },
  modeBtnTextActive: { color: '#fff' },

  grid: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cellSlot: {
    flex: 1,
  },
  cell: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    minHeight: 52,
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: C.navy,
  },
  cellAbsent: {
    opacity: 0.35,
  },
  cellBank: {
    fontSize: 15,
    fontWeight: '900',
    color: '#3f4d63',
    letterSpacing: -0.3,
  },
  cellBankNoData: {
    color: C.muted,
  },
  cellCount: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(63,77,99,0.75)',
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
  },
  legendScale: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendSwatch: {
    width: 16,
    height: 10,
    borderRadius: 3,
  },
  legendEnd: {
    fontSize: 10,
    color: C.muted,
    marginHorizontal: 3,
  },

  panel: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: -0.3,
  },
  panelSub: {
    fontSize: 11.5,
    color: C.muted,
    marginTop: 2,
  },
  panelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.navy,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  panelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  panelMetrics: {
    flexDirection: 'row',
  },
  panelMetric: {
    flex: 1,
    paddingHorizontal: 10,
  },
  panelMetricBorder: {
    borderLeftWidth: 1,
    borderLeftColor: C.border,
  },
  panelMetricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: -0.3,
  },
  panelMetricLabel: {
    fontSize: 9.5,
    color: C.muted,
    marginTop: 2,
    fontWeight: '600',
  },

  hint: {
    fontSize: 12,
    color: C.faint,
    textAlign: 'center',
  },
});
