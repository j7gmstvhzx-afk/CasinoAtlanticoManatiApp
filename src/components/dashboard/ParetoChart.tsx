import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable } from './AnimatedPressable';
import { ChartTooltip } from './ChartTooltip';

export type ParetoItem = {
  key: string;
  label: string;
  value: number;
};

type Props = {
  items: ParetoItem[];
  formatValue: (v: number) => string;
  threshold?: number;   // cumulative share highlight, default 0.8
  height?: number;
};

// Pareto chart: bars sorted descending by contribution + cumulative-share line.
// Bars inside the `threshold` group (e.g. the banks that add up to 80% of the
// total) are highlighted; the rest fade out. Answers "where is the money?".
export function ParetoChart({ items, formatValue, threshold = 0.8, height = 170 }: Props) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  const model = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((s, i) => s + i.value, 0) || 1;
    let acc = 0;
    let coreCount = 0;
    const rows = sorted.map(item => {
      acc += item.value;
      const cum = acc / total;
      const inCore = cum <= threshold || coreCount === 0;
      if (inCore) coreCount++;
      return { ...item, cum, inCore };
    });
    const maxValue = sorted[0]?.value ?? 1;
    return { rows, total, maxValue, coreCount };
  }, [items, threshold]);

  if (model.rows.length === 0) return <Text style={styles.empty}>Sin datos para graficar</Text>;
  const { rows, total, maxValue, coreCount } = model;

  const n = rows.length;
  const barW = width > 0 ? width / n : 0;
  const showEvery = barW >= 18 ? 1 : barW >= 9 ? 4 : 8;
  const linePoints = width > 0
    ? rows.map((r, i) => `${(i + 0.5) * barW},${(1 - r.cum) * height}`).join(' ')
    : '';

  return (
    <View style={{ gap: 6 }}>
      <View style={styles.headline}>
        <View style={[styles.coreChip]}>
          <Text style={styles.coreChipText}>
            {coreCount} de {n} bancos concentran el {Math.round(threshold * 100)}% del total ({formatValue(total)})
          </Text>
        </View>
      </View>

      <View style={[styles.plot, { height }]} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {/* Bars */}
        <View style={styles.barsRow}>
          {rows.map(r => {
            const isActive = active === r.key;
            return (
              <AnimatedPressable
                key={r.key}
                style={styles.barSlot}
                hoverScale={1}
                onPress={() => setActive(a => (a === r.key ? null : r.key))}
                onHoverIn={() => setActive(r.key)}
                onHoverOut={() => setActive(a => (a === r.key ? null : a))}
              >
                {isActive && (
                  <ChartTooltip
                    label={`Banco ${r.label} · ${Math.round(r.cum * 100)}% acum.`}
                    value={formatValue(r.value)}
                  />
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max((r.value / maxValue) * 100, 2)}%`,
                      backgroundColor: isActive ? C.gold : r.inCore ? C.navy : C.faint,
                    },
                  ]}
                />
              </AnimatedPressable>
            );
          })}
        </View>

        {/* Cumulative line + threshold reference (SVG overlay) */}
        {width > 0 && (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Line
              x1={0} y1={(1 - threshold) * height}
              x2={width} y2={(1 - threshold) * height}
              stroke={C.gold} strokeWidth={1.5} strokeDasharray="5 4"
            />
            <Polyline points={linePoints} fill="none" stroke={C.gold} strokeWidth={2.5} />
          </Svg>
        )}
      </View>

      {/* X labels (bank numbers, thinned when narrow) */}
      <View style={styles.labelsRow}>
        {rows.map((r, i) => (
          <View key={r.key} style={styles.labelSlot}>
            {i % showEvery === 0 ? (
              <Text style={[styles.barLabel, r.inCore && styles.barLabelCore]}>{r.label}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: C.navy }]} />
          <Text style={styles.legendText}>Bancos del {Math.round(threshold * 100)}% principal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: C.faint }]} />
          <Text style={styles.legendText}>Resto</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: C.gold }]} />
          <Text style={styles.legendText}>% acumulado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headline: { flexDirection: 'row' },
  coreChip: {
    backgroundColor: '#fdf5e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.gold + '55',
  },
  coreChipText: { fontSize: 11.5, fontWeight: '700', color: '#b8863f' },
  plot: {
    backgroundColor: C.track,
    borderRadius: 10,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 0,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '68%',
    alignSelf: 'center',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  labelsRow: {
    flexDirection: 'row',
    minHeight: 14,
  },
  labelSlot:    { flex: 1, alignItems: 'center' },
  barLabel:     { fontSize: 8.5, color: C.muted, fontWeight: '600' },
  barLabelCore: { color: C.navy, fontWeight: '800' },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
  },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLine:   { width: 14, height: 3, borderRadius: 2 },
  legendText:   { fontSize: 10.5, fontWeight: '600', color: C.text },
  empty:        { fontSize: 12, color: C.faint, fontStyle: 'italic' },
});
