import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress?: () => void;
  tint?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuickAction({ icon, label, hint, onPress, tint = colors.brand.gold }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.94);
        Haptics.selectionAsync();
      }}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
      style={[styles.root, animated as any]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${tint}25`, borderColor: `${tint}40` }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text variant="bodyStrong" align="center" numberOfLines={1}>
        {label}
      </Text>
      {hint ? (
        <Text variant="caption" tone="muted" align="center" numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 2,
  },
});
