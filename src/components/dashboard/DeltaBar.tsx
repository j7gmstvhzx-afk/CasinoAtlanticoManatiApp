import React from 'react';
import { StyleSheet, View } from 'react-native';
import { C } from './shared';

type Props = {
  then: number;          // 2025 baseline
  now: number;           // current value
  width?: number | '100%';
};

// Mini bullet chart: filled bar = current value, dark tick = 2025 baseline.
// Green when current ≥ baseline, red when it dropped. Scale is per-row
// (max of both values = full track) so the bar always fits.
export function DeltaBar({ then, now, width = 110 }: Props) {
  const max = Math.max(then, now);
  if (max <= 0) return null;

  const nowPct  = (now  / max) * 100;
  const tickPct = (then / max) * 100;
  const up = now >= then;

  return (
    <View style={[styles.track, { width: width as any }]}>
      <View
        style={[
          styles.fill,
          { width: `${Math.max(nowPct, 2)}%` as any, backgroundColor: up ? C.green : C.red },
        ]}
      />
      <View style={[styles.tick, { left: `${Math.min(tickPct, 99)}%` as any }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  tick: {
    position: 'absolute',
    top: -1,
    width: 2,
    height: 8,
    backgroundColor: C.navy,
    borderRadius: 1,
  },
});
