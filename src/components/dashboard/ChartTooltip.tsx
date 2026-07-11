import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { C } from './shared';

type Props = {
  label: string;
  value: string;
};

// Small floating bubble anchored above a chart element (bar, point, etc.)
// to surface its exact value on hover/press. The parent must be
// `position: relative` (View default) with `overflow: visible`.
export function ChartTooltip({ label, value }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.bubble}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 20,
  },
  bubble: {
    backgroundColor: C.navy,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 64,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  arrow: {
    width: 8,
    height: 8,
    backgroundColor: C.navy,
    transform: [{ rotate: '45deg' }],
    marginTop: -4,
  },
  label: {
    fontSize: 9,
    color: '#cbd5e1',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '800',
    marginTop: 1,
  },
});
