import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable as Pressable } from './AnimatedPressable';

export type HBarItem = {
  key: string;
  label: string;
  value: number;
  display: string;
  color?: string;
  /** Optional second stop — renders the fill as a gradient instead of flat color. */
  colorTo?: string;
};

type Props = {
  data: HBarItem[];
  barColor?: string;
  onPress?: (key: string) => void;
};

// Bar fill animates from 0 on mount, staggered top→bottom.
function AnimatedFill({ pct, color, colorTo, delay }: { pct: number; color: string; colorTo?: string; delay: number }) {
  const width = useSharedValue(0);
  // Captured once: re-sorting `data` reassigns each item's index (and thus
  // `delay`) on every render, but an already-mounted bar shouldn't replay
  // its staggered entrance just because its position in the list shifted.
  const mountDelay = useRef(delay).current;

  useEffect(() => {
    width.value = withDelay(mountDelay, withTiming(pct, { duration: 360 }));
  }, [pct, mountDelay, width]);

  const animated = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <Animated.View style={[styles.fillWrap, animated]}>
      <LinearGradient
        colors={[color, colorTo ?? color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fill}
      />
    </Animated.View>
  );
}

export function HBars({ data, barColor = C.navy, onPress }: Props) {
  const { width } = useWindowDimensions();
  const labelW = width >= 1024 ? 180 : width >= 640 ? 130 : 96;
  const valueW = width >= 640 ? 90 : 72;
  const max = data.reduce((m, d) => Math.max(m, d.value), 0) || 1;

  return (
    <View style={{ gap: 12 }}>
      {data.map((item, i) => {
        const pct = Math.max((item.value / max) * 100, 2);
        const fill = item.color ?? barColor;
        const row = (
          <>
            <Text style={[styles.label, { width: labelW }]} numberOfLines={1}>{item.label}</Text>
            <View style={styles.trackWrap}>
              <View style={styles.track}>
                <AnimatedFill pct={pct} color={fill} colorTo={item.colorTo} delay={i * 40} />
              </View>
            </View>
            <Text style={[styles.value, { width: valueW }]} numberOfLines={1}>{item.display}</Text>
          </>
        );
        return onPress ? (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.row, styles.rowPressable, pressed && { opacity: 0.6 }]}
            onPress={() => onPress(item.key)}
            hoverScale={1.01}
          >
            {row}
          </Pressable>
        ) : (
          <View key={item.key} style={styles.row}>{row}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  rowPressable: {
    cursor: 'pointer',
  } as any,
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
  fillWrap: {
    height: '100%',
    borderRadius: 7,
    overflow: 'hidden',
    minWidth: 6,
  },
  fill: {
    flex: 1,
    borderRadius: 7,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy3,
    textAlign: 'right',
  },
});
