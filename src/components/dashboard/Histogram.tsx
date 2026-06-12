import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable } from './AnimatedPressable';
import { ChartTooltip } from './ChartTooltip';

type Props = {
  values: number[];
  bins?: number;
  height?: number;
  color?: string;
  formatValue: (v: number) => string;
  // Optional reference markers drawn as vertical lines over the bars.
  meanValue?: number;
  medianValue?: number;
};

// Distribution histogram built with plain Views (no SVG needed): a row of
// bottom-aligned bars plus absolutely-positioned mean/median markers. Each
// bar is touchable/hoverable — it highlights and surfaces a tooltip with
// its range and machine count.
export function Histogram({
  values,
  bins = 12,
  height = 150,
  color = C.navy2,
  formatValue,
  meanValue,
  medianValue,
}: Props) {
  const [active, setActive] = useState<number | null>(null);

  const model = useMemo(() => {
    if (values.length === 0) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const counts = new Array(bins).fill(0) as number[];
    for (const v of values) {
      const i = Math.min(bins - 1, Math.floor(((v - min) / range) * bins));
      counts[i]++;
    }
    const maxCount = Math.max(...counts) || 1;
    const posOf = (v: number) => Math.min(Math.max((v - min) / range, 0), 1);
    return { min, max, range, counts, maxCount, posOf };
  }, [values, bins]);

  if (!model) return <Text style={styles.empty}>Sin datos para graficar</Text>;
  const { min, max, range, counts, maxCount, posOf } = model;
  const binWidth = range / bins;

  return (
    <View style={{ gap: 6 }}>
      {/* Marker legend */}
      <View style={styles.markerLegend}>
        {meanValue != null && (
          <View style={styles.markerItem}>
            <View style={[styles.markerSwatch, { backgroundColor: C.gold }]} />
            <Text style={styles.markerText}>Media {formatValue(meanValue)}</Text>
          </View>
        )}
        {medianValue != null && (
          <View style={styles.markerItem}>
            <View style={[styles.markerSwatch, { backgroundColor: C.navy }]} />
            <Text style={styles.markerText}>Mediana {formatValue(medianValue)}</Text>
          </View>
        )}
        <Text style={styles.markerCount}>{values.length} máquinas</Text>
      </View>

      {/* Bars + markers */}
      <View style={[styles.plot, { height }]}>
        {counts.map((count, i) => {
          const isActive = active === i;
          const binMin = min + i * binWidth;
          const binMax = min + (i + 1) * binWidth;
          return (
            <AnimatedPressable
              key={i}
              style={styles.barSlot}
              hoverScale={1}
              onPress={() => setActive(a => (a === i ? null : i))}
              onHoverIn={() => setActive(i)}
              onHoverOut={() => setActive(a => (a === i ? null : a))}
            >
              {isActive && (
                <ChartTooltip
                  label={`${formatValue(binMin)} – ${formatValue(binMax)}`}
                  value={`${count} máq.`}
                />
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max((count / maxCount) * 100, count > 0 ? 3 : 0)}%`,
                    backgroundColor: isActive ? C.gold : color,
                    opacity: isActive ? 1 : 0.85,
                  },
                ]}
              />
            </AnimatedPressable>
          );
        })}
        {meanValue != null && (
          <View style={[styles.marker, { left: `${posOf(meanValue) * 100}%`, backgroundColor: C.gold }]} />
        )}
        {medianValue != null && (
          <View style={[styles.marker, { left: `${posOf(medianValue) * 100}%`, backgroundColor: C.navy }]} />
        )}
      </View>

      {/* X axis */}
      <View style={styles.axis}>
        <Text style={styles.axisLabel}>{formatValue(min)}</Text>
        <Text style={styles.axisLabel}>{formatValue(min + (max - min) / 2)}</Text>
        <Text style={styles.axisLabel}>{formatValue(max)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    backgroundColor: C.track,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingTop: 10,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  marker: {
    position: 'absolute',
    top: 4,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  markerLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  markerSwatch: { width: 10, height: 3, borderRadius: 2 },
  markerText:   { fontSize: 11, fontWeight: '600', color: C.text },
  markerCount:  { fontSize: 11, color: C.muted, marginLeft: 'auto' },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },
  empty:     { fontSize: 12, color: C.faint, fontStyle: 'italic' },
});
