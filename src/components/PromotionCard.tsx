import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Badge, Text } from '@/components/ui';
import { Countdown } from './Countdown';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Promotion } from '@/types/domain';

const accentMap: Record<Promotion['accent'], { from: string; to: string; tone: 'gold' | 'info' | 'success' | 'hot' }> = {
  gold: { from: '#7A5410', to: '#D4A24C', tone: 'gold' },
  atlantic: { from: '#1F3A6B', to: '#3D6FB8', tone: 'info' },
  ruby: { from: '#7A1F2A', to: '#E5484D', tone: 'hot' },
  emerald: { from: '#0F4D38', to: '#1FB07A', tone: 'success' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  promo: Promotion;
  onPress?: (p: Promotion) => void;
  variant?: 'card' | 'compact';
};

export function PromotionCard({ promo, onPress, variant = 'card' }: Props) {
  const press = useSharedValue(1);
  const a = accentMap[promo.accent];

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  if (variant === 'compact') {
    return (
      <AnimatedPressable
        onPressIn={() => {
          press.value = withSpring(0.97);
          Haptics.selectionAsync();
        }}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={() => onPress?.(promo)}
        style={[styles.compact, animated as any]}
      >
        <LinearGradient colors={[a.from, a.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.compactInner}>
          {promo.badge ? <Badge label={promo.badge} tone={a.tone} /> : null}
          <Text variant="h3" style={{ color: '#fff', marginTop: spacing.sm }}>
            {promo.title}
          </Text>
          <Text variant="small" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {promo.subtitle}
          </Text>
          <View style={{ marginTop: 'auto' }}>
            <Countdown endsAt={promo.endsAt} compact />
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={() => {
        press.value = withSpring(0.98);
        Haptics.selectionAsync();
      }}
      onPressOut={() => (press.value = withSpring(1))}
      onPress={() => onPress?.(promo)}
      style={[styles.card, shadow.md, animated as any]}
    >
      <LinearGradient colors={[a.from, a.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.cardInner}>
        <View style={styles.headerRow}>
          {promo.badge ? <Badge label={promo.badge} tone={a.tone} /> : <View />}
          <Countdown endsAt={promo.endsAt} compact />
        </View>
        <Text variant="h2" style={{ color: '#fff' }}>
          {promo.title}
        </Text>
        <Text variant="body" style={{ color: 'rgba(255,255,255,0.92)' }}>
          {promo.subtitle}
        </Text>
        <Text variant="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {promo.description}
        </Text>
        <View style={styles.cta}>
          <Text variant="bodyStrong" style={{ color: '#0B0F19' }}>
            {promo.cta}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 220,
  },
  cardInner: {
    padding: spacing.xl,
    gap: spacing.sm,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cta: {
    backgroundColor: '#FFE7AF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  compact: {
    width: 240,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  compactInner: {
    flex: 1,
    padding: spacing.lg,
    gap: 4,
  },
});
