import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from './Text';
import { colors, radius, spacing } from '@/theme';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({ label, active, onPress, count }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.94, { stiffness: 360, damping: 20 });
        Haptics.selectionAsync();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 360, damping: 20 });
      }}
      onPress={onPress}
      style={[styles.base, active && styles.active, animated as any]}
    >
      <Text
        variant="bodyStrong"
        style={{ color: active ? colors.text.inverse : colors.text.secondary }}
      >
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Text variant="caption" style={{ color: active ? colors.text.inverse : colors.text.muted }}>
          · {count}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  active: {
    backgroundColor: colors.brand.gold,
    borderColor: colors.brand.goldGlow,
  },
});
