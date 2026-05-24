import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

export type PieItem = { label: string; value: number; color: string };

type Props = {
  data:        PieItem[];
  size?:       number;
  centerLabel?: string;
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToXY(cx, cy, r, endDeg);
  const end   = polarToXY(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

export function FloorPieChart({ data, size = 160, centerLabel }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR * 0.56;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const slices: Array<PieItem & { startDeg: number; endDeg: number }> = [];
  let cursor = 0;
  for (const item of data) {
    const portion = item.value / total;
    const endDeg  = cursor + portion * 360;
    slices.push({ ...item, startDeg: cursor, endDeg });
    cursor = endDeg;
  }

  return (
    <View style={styles.root}>
      {/* Donut */}
      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size}>
          {slices.map((s, i) => (
            <Path key={i} d={arcPath(cx, cy, outerR, s.startDeg, s.endDeg)} fill={s.color} />
          ))}
          <Circle cx={cx} cy={cy} r={innerR} fill={colors.bg.base} />
        </Svg>
        {centerLabel ? (
          <View style={[StyleSheet.absoluteFill, styles.centerLabel]}>
            <Text variant="caption" tone="muted" align="center">{centerLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text variant="small" tone="secondary" style={styles.legendLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <Text variant="small" style={{ color: item.color, fontWeight: '600' }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
});
