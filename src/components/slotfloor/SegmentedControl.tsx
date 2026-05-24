import React, { useState, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const TEAL = '#2a9d8f';

type Props = {
  segments:    readonly string[];
  activeIndex: number;
  onChange:    (index: number) => void;
};

export function SegmentedControl({ segments, activeIndex, onChange }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const tabWidth = containerWidth > 0 ? containerWidth / segments.length : 0;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tabWidth <= 0) return;
    Animated.spring(translateX, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [activeIndex, tabWidth]);

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.container}
        onLayout={e => {
          const w = e.nativeEvent.layout.width / segments.length;
          setContainerWidth(e.nativeEvent.layout.width);
          translateX.setValue(activeIndex * w);
        }}
      >
        {tabWidth > 0 && (
          <Animated.View
            style={[styles.indicator, { width: tabWidth, transform: [{ translateX }] }]}
          />
        )}
        {segments.map((label, i) => (
          <Pressable
            key={label}
            style={styles.tab}
            onPress={() => onChange(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: i === activeIndex }}
          >
            <Text
              variant="small"
              style={[styles.label, i === activeIndex && styles.labelActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.pill,
    padding: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: radius.pill,
    backgroundColor: TEAL,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    color: colors.text.muted,
    fontWeight: '600',
    fontSize: 12,
  },
  labelActive: {
    color: colors.text.primary,
  },
});
