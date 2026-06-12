import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { C } from './shared';
import { quantileSorted } from '@/lib/stats';

export type BoxPlotGroup = {
  key: string;
  label: string;
  color: string;
  values: number[];
};

type Props = {
  groups: BoxPlotGroup[];
  formatValue: (v: number) => string;
  // Vertical dashed reference across all rows (e.g. floor median).
  referenceValue?: number;
  referenceLabel?: string;
};

// Horizontal box plots, one row per group, on a shared scale. Shows the full
// spread (min–max whiskers), the middle 50% (Q1–Q3 box) and the median tick —
// averages hide dispersion; this makes it visible per group.
export function BoxPlotRows({ groups, formatValue, referenceValue, referenceLabel }: Props) {
  const model = useMemo(() => {
    const stats = groups
      .filter(g => g.values.length > 0)
      .map(g => {
        const sorted = [...g.values].sort((a, b) => a - b);
        return {
          ...g,
          n:      sorted.length,
          min:    sorted[0],
          q1:     quantileSorted(sorted, 0.25),
          median: quantileSorted(sorted, 0.5),
          q3:     quantileSorted(sorted, 0.75),
          max:    sorted[sorted.length - 1],
        };
      })
      .sort((a, b) => b.median - a.median);
    if (stats.length === 0) return null;
    let lo = Math.min(...stats.map(s => s.min));
    let hi = Math.max(...stats.map(s => s.max));
    if (referenceValue != null) { lo = Math.min(lo, referenceValue); hi = Math.max(hi, referenceValue); }
    const range = hi - lo || 1;
    const pos = (v: number) => ((v - lo) / range) * 100;
    return { stats, lo, hi, pos };
  }, [groups, referenceValue]);

  if (!model) return <Text style={styles.empty}>Sin datos para graficar</Text>;
  const { stats, lo, hi, pos } = model;

  return (
    <View style={{ gap: 4 }}>
      {referenceValue != null && (
        <View style={styles.refLegend}>
          <View style={styles.refSwatch} />
          <Text style={styles.refText}>
            {referenceLabel ?? 'Referencia'}: {formatValue(referenceValue)}
          </Text>
        </View>
      )}

      {stats.map(s => (
        <View key={s.key} style={styles.row}>
          <View style={styles.labelCol}>
            <Text style={styles.label} numberOfLines={1}>{s.label}</Text>
            <Text style={styles.sub}>{s.n} máq · med {formatValue(s.median)}</Text>
          </View>
          <View style={styles.plot}>
            {/* Whisker (min–max) */}
            <View style={[styles.whisker, { left: `${pos(s.min)}%`, width: `${Math.max(pos(s.max) - pos(s.min), 0.5)}%` }]} />
            <View style={[styles.whiskerCap, { left: `${pos(s.min)}%` }]} />
            <View style={[styles.whiskerCap, { left: `${pos(s.max)}%` }]} />
            {/* Box (Q1–Q3) */}
            <View
              style={[
                styles.box,
                {
                  left: `${pos(s.q1)}%`,
                  width: `${Math.max(pos(s.q3) - pos(s.q1), 1)}%`,
                  backgroundColor: s.color + '33',
                  borderColor: s.color,
                },
              ]}
            />
            {/* Median tick */}
            <View style={[styles.median, { left: `${pos(s.median)}%`, backgroundColor: s.color }]} />
            {/* Reference line */}
            {referenceValue != null && (
              <View style={[styles.refLine, { left: `${pos(referenceValue)}%` }]} />
            )}
          </View>
        </View>
      ))}

      <View style={styles.axis}>
        <View style={styles.labelCol} />
        <View style={styles.axisScale}>
          <Text style={styles.axisLabel}>{formatValue(lo)}</Text>
          <Text style={styles.axisLabel}>{formatValue(lo + (hi - lo) / 2)}</Text>
          <Text style={styles.axisLabel}>{formatValue(hi)}</Text>
        </View>
      </View>
    </View>
  );
}

const LABEL_W = 118;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  labelCol: { width: LABEL_W },
  label:    { fontSize: 12, fontWeight: '700', color: C.navy },
  sub:      { fontSize: 10, color: C.muted, marginTop: 1 },
  plot: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  whisker: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: C.faint,
    top: 14,
  },
  whiskerCap: {
    position: 'absolute',
    width: 1.5,
    height: 10,
    backgroundColor: C.faint,
    top: 10,
  },
  box: {
    position: 'absolute',
    height: 22,
    top: 4,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  median: {
    position: 'absolute',
    width: 3,
    height: 22,
    top: 4,
    borderRadius: 2,
  },
  refLine: {
    position: 'absolute',
    width: 1.5,
    top: 0,
    bottom: 0,
    backgroundColor: C.gold,
    opacity: 0.9,
  },
  refLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  refSwatch: { width: 3, height: 12, borderRadius: 2, backgroundColor: C.gold },
  refText:   { fontSize: 11, fontWeight: '600', color: C.text },
  axis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  axisScale: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  empty:     { fontSize: 12, color: C.faint, fontStyle: 'italic' },
});
