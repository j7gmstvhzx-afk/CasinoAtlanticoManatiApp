import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { C } from './shared';
import { AnimatedPressable } from './AnimatedPressable';

export type TabItem = { key: string; label: string };

type Props = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  gutter?: number;
};

export function SegmentedTabs({ tabs, active, onChange, gutter = 16 }: Props) {
  const layouts = useRef<Record<string, { x: number; width: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  // Track each tab's measured position so the indicator can glide between
  // them; the very first measurement of the active tab snaps in place.
  const measure = (key: string, x: number, width: number) => {
    const first = !layouts.current[key];
    layouts.current[key] = { x, width };
    if (key === active) {
      if (first) {
        indicatorX.value = x;
        indicatorW.value = width;
        indicatorOpacity.value = withTiming(1, { duration: 160 });
      } else {
        indicatorX.value = withTiming(x, { duration: 220 });
        indicatorW.value = withTiming(width, { duration: 220 });
      }
    }
  };

  useEffect(() => {
    const l = layouts.current[active];
    if (l) {
      indicatorX.value = withTiming(l.x, { duration: 240 });
      indicatorW.value = withTiming(l.width, { duration: 240 });
    }
  }, [active, indicatorX, indicatorW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
    opacity: indicatorOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}
      >
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {tabs.map(tab => {
          const isActive = tab.key === active;
          return (
            <AnimatedPressable
              key={tab.key}
              style={styles.tab}
              hoverScale={1.04}
              onPress={() => onChange(tab.key)}
              onLayout={e => measure(tab.key, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: C.page,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.navy,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: C.navy,
    fontWeight: '700',
  },
});
