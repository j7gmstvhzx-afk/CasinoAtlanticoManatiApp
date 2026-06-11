import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money } from './shared';
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
const HEAT_COLORS = ['#d64545', '#e0784a', '#d4a849', '#8fb56f', '#1f9d57'];
const NO_DATA_BG  = '#e4e8ee';

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
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  const byBankNum = useMemo(() => new Map(groups.map(g => [g.bankNum, g])), [groups]);

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
      {/* Grid */}
      <View style={styles.grid}>
        {rows.map((rowCells, ri) => (
          <View key={ri} style={styles.gridRow}>
            {Array.from({ length: FLOOR_COLUMNS }, (_, col) => {
              const cell = rowCells.find(c => c.col === col);
              if (!cell) return <View key={col} style={styles.cellSlot} />;
              const group = byBankNum.get(cell.bank);
              const q = group ? quintiles.get(cell.bank) : undefined;
              const bg = q != null ? HEAT_COLORS[q] : NO_DATA_BG;
              const noData = q == null;
              const isSel = group != null && group.bank === selected;
              return (
                <View key={col} style={styles.cellSlot}>
                  <Pressable
                    style={[
                      styles.cell,
                      { backgroundColor: noData ? NO_DATA_BG : bg },
                      isSel && styles.cellSelected,
                      !group && styles.cellAbsent,
                    ]}
                    disabled={!group}
                    onPress={() => group && setSelected(isSel ? null : group.bank)}
                  >
                    <Text style={[styles.cellBank, noData && styles.cellBankNoData]}>
                      {String(cell.bank).padStart(2, '0')}
                    </Text>
                    {group ? (
                      <Text style={[styles.cellCount, noData && styles.cellBankNoData]}>
                        {group.machines.length} máq
                      </Text>
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
        <Text style={styles.legendLabel}>{metricLabel} del banco:</Text>
        <View style={styles.legendScale}>
          <Text style={styles.legendEnd}>Bajo</Text>
          {HEAT_COLORS.map(c => <View key={c} style={[styles.legendSwatch, { backgroundColor: c }]} />)}
          <Text style={styles.legendEnd}>Alto</Text>
        </View>
        <View style={styles.legendScale}>
          <View style={[styles.legendSwatch, { backgroundColor: NO_DATA_BG }]} />
          <Text style={styles.legendEnd}>Sin datos</Text>
        </View>
      </View>

      {/* Detail panel for the selected bank */}
      {selectedGroup && (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Banco {selectedGroup.bank.padStart(2, '0')}</Text>
              <Text style={styles.panelSub}>
                {selectedGroup.machines.length} máquinas · Juego principal: {selectedGroup.topGame || '—'}
              </Text>
            </View>
            <Pressable style={styles.panelBtn} onPress={() => onOpenBank(selectedGroup.bank)}>
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
        </View>
      )}

      {!selectedGroup && (
        <Text style={styles.hint}>Toca un banco para ver sus métricas y abrir su detalle.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#fff',
    letterSpacing: -0.3,
  },
  cellBankNoData: {
    color: C.muted,
  },
  cellCount: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
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
