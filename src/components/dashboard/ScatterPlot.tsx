import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Text } from '@/components/ui';
import { C } from './shared';
import { quantileSorted } from '@/lib/stats';

export type ScatterPoint = {
  key: string;
  x: number;
  y: number;
};

type Props = {
  points: ScatterPoint[];
  // Quadrant split lines (typically the floor averages of each axis).
  xMid: number;
  yMid: number;
  xLabel: string;
  yLabel: string;
  formatX: (v: number) => string;
  formatY: (v: number) => string;
  height?: number;
  onPointPress?: (key: string) => void;
  selectedKey?: string | null;
};

export type Quadrant = 'star' | 'volume' | 'hold' | 'low';

export function quadrantOf(p: { x: number; y: number }, xMid: number, yMid: number): Quadrant {
  if (p.x >= xMid) return p.y >= yMid ? 'star' : 'volume';
  return p.y >= yMid ? 'hold' : 'low';
}

export const QUADRANT_META: Record<Quadrant, { color: string; label: string }> = {
  star:   { color: C.green, label: 'Alto volumen · alta retención' },
  volume: { color: '#b8863f', label: 'Alto volumen · baja retención' },
  hold:   { color: C.navy2, label: 'Bajo volumen · alta retención' },
  low:    { color: C.red,   label: 'Bajo volumen · baja retención' },
};

const PAD = { top: 10, right: 12, bottom: 26, left: 12 };

// Quadrant scatter: each point is a machine, split lines at the floor average
// of each axis. Domains clamp at the 98th percentile so a single outlier
// doesn't squash the rest of the cloud (clamped points pin to the edge).
export function ScatterPlot({
  points,
  xMid,
  yMid,
  xLabel,
  yLabel,
  formatX,
  formatY,
  height = 280,
  onPointPress,
  selectedKey,
}: Props) {
  const [width, setWidth] = useState(0);

  const model = useMemo(() => {
    if (points.length === 0) return null;
    const xs = points.map(p => p.x).sort((a, b) => a - b);
    const ys = points.map(p => p.y).sort((a, b) => a - b);
    const xMax = Math.max(quantileSorted(xs, 0.98), xMid * 1.15) || 1;
    const yMax = Math.max(quantileSorted(ys, 0.98), yMid * 1.15) || 1;
    return { xMax, yMax };
  }, [points, xMid, yMid]);

  if (!model) return <Text style={styles.empty}>Sin datos para graficar</Text>;
  const { xMax, yMax } = model;

  const plotW = Math.max(width - PAD.left - PAD.right, 0);
  const plotH = height - PAD.top - PAD.bottom;
  const px = (v: number) => PAD.left + Math.min(v / xMax, 1) * plotW;
  const py = (v: number) => PAD.top + (1 - Math.min(v / yMax, 1)) * plotH;
  const midX = px(xMid);
  const midY = py(yMid);

  return (
    <View style={{ gap: 8 }}>
      {/* Quadrant legend */}
      <View style={styles.legend}>
        {(Object.keys(QUADRANT_META) as Quadrant[]).map(q => (
          <View key={q} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: QUADRANT_META[q].color }]} />
            <Text style={styles.legendText}>{QUADRANT_META[q].label}</Text>
          </View>
        ))}
      </View>

      <View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {/* Quadrant background tints */}
            <Rect x={midX} y={PAD.top} width={Math.max(PAD.left + plotW - midX, 0)} height={Math.max(midY - PAD.top, 0)} fill={C.green} opacity={0.06} />
            <Rect x={midX} y={midY} width={Math.max(PAD.left + plotW - midX, 0)} height={Math.max(PAD.top + plotH - midY, 0)} fill={C.gold} opacity={0.08} />
            <Rect x={PAD.left} y={midY} width={Math.max(midX - PAD.left, 0)} height={Math.max(PAD.top + plotH - midY, 0)} fill={C.red} opacity={0.05} />

            {/* Plot frame */}
            <Rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="none" stroke={C.border} strokeWidth={1} rx={8} />

            {/* Quadrant split lines (floor averages) */}
            <Line x1={midX} y1={PAD.top} x2={midX} y2={PAD.top + plotH} stroke={C.navy3} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />
            <Line x1={PAD.left} y1={midY} x2={PAD.left + plotW} y2={midY} stroke={C.navy3} strokeWidth={1} strokeDasharray="4 4" opacity={0.6} />

            {/* Points */}
            {points.map(p => {
              const q = quadrantOf(p, xMid, yMid);
              const selected = selectedKey === p.key;
              return (
                <Circle
                  key={p.key}
                  cx={px(p.x)}
                  cy={py(p.y)}
                  r={selected ? 7 : 4.5}
                  fill={QUADRANT_META[q].color}
                  opacity={selected ? 1 : 0.65}
                  stroke={selected ? C.navy : '#ffffff'}
                  strokeWidth={selected ? 2 : 0.8}
                  onPress={onPointPress ? () => onPointPress(p.key) : undefined}
                />
              );
            })}
          </Svg>
        )}

        {/* Axis annotations */}
        <View style={styles.xAxisRow}>
          <Text style={styles.axisTick}>{formatX(0)}</Text>
          <Text style={styles.axisName}>{xLabel} →</Text>
          <Text style={styles.axisTick}>{formatX(xMax)}</Text>
        </View>
      </View>

      <View style={styles.yAxisRow}>
        <Text style={styles.axisName}>↑ {yLabel}</Text>
        <Text style={styles.axisTick}>
          rango {formatY(0)} – {formatY(yMax)} · líneas punteadas = promedio del piso ({formatX(xMid)} / {formatY(yMid)})
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontSize: 10.5, fontWeight: '600', color: C.text },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: -22,
  },
  yAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  axisName: { fontSize: 10.5, fontWeight: '700', color: C.navy3, letterSpacing: 0.3 },
  axisTick: { fontSize: 10, color: C.muted },
  empty:    { fontSize: 12, color: C.faint, fontStyle: 'italic' },
});
