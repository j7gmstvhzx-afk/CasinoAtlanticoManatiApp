import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable } from './AnimatedPressable';
import { ChartTooltip } from './ChartTooltip';

export type TimelineBucket = {
  date: string;
  sortKey: number;
  counts: Record<string, number>;
};

type Props = {
  buckets: TimelineBucket[];
  colors: Record<string, string>;
  labels: Record<string, string>;
  // Order in which segments stack within a bar (bottom to top).
  types: string[];
  // Dims segments whose type doesn't match, mirroring Donut's selection opacity.
  activeType?: string | null;
  height?: number;
};

// Animates a single stacked segment's height from 0 on mount, staggered by
// bucket index — same idiom as HBars.AnimatedFill.
function AnimatedSegment({ heightPct, color, dimmed, delay }: { heightPct: number; color: string; dimmed: boolean; delay: number }) {
  const h = useSharedValue(0);
  const mountDelay = useRef(delay).current;

  useEffect(() => {
    h.value = withDelay(mountDelay, withTiming(heightPct, { duration: 360 }));
  }, [heightPct, mountDelay, h]);

  const animated = useAnimatedStyle(() => ({ height: `${h.value}%` }));

  return <Animated.View style={[styles.segment, animated, { backgroundColor: color, opacity: dimmed ? 0.35 : 1 }]} />;
}

// Stacked bar-per-date chart: one bar per recorded day, segmented by change
// type. Follows the same hover/click-pin + ChartTooltip pattern as
// Histogram/ScatterPlot, and dims non-matching segments when a KPI filter
// (activeType) is active, mirroring Donut's slice-selection opacity.
export function ChangesTimeline({ buckets, colors, labels, types, activeType, height = 150 }: Props) {
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? pinned;

  if (buckets.length === 0) return <Text style={styles.empty}>Sin datos para graficar</Text>;

  const totals = buckets.map(b => types.reduce((s, t) => s + (b.counts[t] ?? 0), 0));
  const maxTotal = Math.max(...totals, 1);

  return (
    <View style={{ gap: 8 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {buckets.map((b, i) => {
          const isActive = active === i;
          const total = totals[i];
          return (
            <AnimatedPressable
              key={b.date}
              style={styles.barSlot}
              hoverScale={1}
              onPress={() => setPinned(p => (p === i ? null : i))}
              onHoverIn={() => setHovered(i)}
              onHoverOut={() => setHovered(h => (h === i ? null : h))}
            >
              {isActive && (
                <ChartTooltip
                  label={b.date}
                  value={types
                    .filter(t => (b.counts[t] ?? 0) > 0)
                    .map(t => `${labels[t] ?? t}: ${b.counts[t]}`)
                    .join('  ·  ') || `${total} cambios`}
                />
              )}
              <View style={[styles.bar, { height }]}>
                {types.map(t => {
                  const count = b.counts[t] ?? 0;
                  if (count <= 0) return null;
                  const pct = (count / maxTotal) * 100;
                  const dimmed = !!activeType && activeType !== t;
                  return (
                    <AnimatedSegment
                      key={t}
                      heightPct={pct}
                      color={colors[t] ?? C.navy3}
                      dimmed={dimmed}
                      delay={i * 40}
                    />
                  );
                })}
              </View>
              <Text style={[styles.barLabel, isActive && { color: C.navy, fontWeight: '800' }]} numberOfLines={1}>
                {b.date}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {types.map(t => (
          <View key={t} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors[t] ?? C.navy3, opacity: activeType && activeType !== t ? 0.35 : 1 }]} />
            <Text style={styles.legendLabel}>{labels[t] ?? t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 2,
    paddingTop: 10,
  },
  barSlot: {
    width: 48,
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    width: '100%',
    flexDirection: 'column-reverse',
    backgroundColor: C.track,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    width: '100%',
  },
  barLabel: {
    fontSize: 9,
    color: C.muted,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 11, color: C.text, fontWeight: '600' },
  empty: { fontSize: 12, color: C.faint, fontStyle: 'italic' },
});
