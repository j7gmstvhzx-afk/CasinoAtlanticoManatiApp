import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C } from './shared';

export type HBarItem = {
  key: string;
  label: string;
  value: number;
  display: string;
  color?: string;
};

type Props = {
  data: HBarItem[];
  barColor?: string;
  onPress?: (key: string) => void;
};

export function HBars({ data, barColor = C.navy, onPress }: Props) {
  const { width } = useWindowDimensions();
  const labelW = width >= 1024 ? 180 : width >= 640 ? 130 : 96;
  const valueW = width >= 640 ? 90 : 72;
  const max = data.reduce((m, d) => Math.max(m, d.value), 0) || 1;

  return (
    <View style={{ gap: 12 }}>
      {data.map(item => {
        const pct = Math.max((item.value / max) * 100, 2);
        const fill = item.color ?? barColor;
        const Row = onPress ? Pressable : View;
        return (
          <Row
            key={item.key}
            style={styles.row}
            onPress={onPress ? () => onPress(item.key) : undefined}
          >
            <Text style={[styles.label, { width: labelW }]} numberOfLines={1}>{item.label}</Text>
            <View style={styles.trackWrap}>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: fill }]} />
              </View>
            </View>
            <Text style={[styles.value, { width: valueW }]} numberOfLines={1}>{item.display}</Text>
          </Row>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  trackWrap: {
    flex: 1,
  },
  track: {
    height: 28,
    backgroundColor: C.track,
    borderRadius: 7,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
    minWidth: 6,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy3,
    textAlign: 'right',
  },
});
