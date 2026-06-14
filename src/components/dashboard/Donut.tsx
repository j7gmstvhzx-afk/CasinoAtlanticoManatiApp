import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable } from './AnimatedPressable';

// `key` carries the full identifier (e.g. manufacturer name) when `label` is a
// shortened display form — press callbacks receive key ?? label.
export type DonutItem = { label: string; value: number; color: string; key?: string };

type Props = {
  data: DonutItem[];
  size?: number;
  showPct?: boolean;
  onSlicePress?: (key: string) => void;
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, start: number, end: number): string {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} L ${cx} ${cy} Z`;
}

export function Donut({ data, size = 150, showPct = true, onSlicePress }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.6;
  const total = data.reduce((s, d) => s + d.value, 0);

  let cursor = 0;
  const slices = data.map(d => {
    const start = cursor;
    const end = total > 0 ? cursor + (d.value / total) * 360 : cursor;
    cursor = end;
    return { ...d, start, end, itemKey: d.key ?? d.label };
  });

  return (
    <View style={styles.root}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => {
          const isActive = active === s.itemKey;
          return (
            <Path
              key={i}
              d={arc(cx, cy, outerR, s.start, s.end)}
              fill={s.color}
              opacity={active && !isActive ? 0.45 : 1}
              stroke={isActive ? C.navy : 'none'}
              strokeWidth={isActive ? 2 : 0}
              onPress={onSlicePress ? () => onSlicePress(s.itemKey) : undefined}
              onPressIn={() => setActive(s.itemKey)}
              onPressOut={() => setActive(a => (a === s.itemKey ? null : a))}
            />
          );
        })}
        <Circle cx={cx} cy={cy} r={innerR} fill={C.card} />
      </Svg>

      <View style={styles.legend}>
        {data.map(item => {
          const itemKey = item.key ?? item.label;
          const isActive = active === itemKey;
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const inner = (
            <>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={[styles.label, isActive && { color: C.navy }]} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.value}>
                {item.value}{showPct ? <Text style={styles.pct}>  ({pct.toFixed(1)}%)</Text> : null}
              </Text>
            </>
          );
          return (
            <AnimatedPressable
              key={item.label}
              style={[styles.row, isActive && styles.rowActive]}
              hoverScale={onSlicePress ? 1.02 : 1}
              onPress={onSlicePress ? () => onSlicePress(itemKey) : undefined}
              onHoverIn={() => setActive(itemKey)}
              onHoverOut={() => setActive(a => (a === itemKey ? null : a))}
            >
              {inner}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  legend: {
    flex: 1,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: -4,
  },
  rowActive: {
    backgroundColor: C.track,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy3,
  },
  pct: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
});
