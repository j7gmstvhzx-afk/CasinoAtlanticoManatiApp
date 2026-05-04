import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Badge, Text } from '@/components/ui';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Jackpot } from '@/types/domain';
import { formatCurrency } from '@/utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  jackpot: Jackpot;
  onPress?: (j: Jackpot) => void;
  variant?: 'tile' | 'row' | 'hero';
};

export function JackpotCard({ jackpot, onPress, variant = 'row' }: Props) {
  const press = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  const handlePressIn = () => {
    press.value = withSpring(0.98);
    Haptics.selectionAsync();
  };
  const handlePressOut = () => {
    press.value = withSpring(1);
  };

  if (variant === 'hero') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress?.(jackpot)}
        style={[styles.hero, shadow.lg, animated as any]}
      >
        <LinearGradient
          colors={[jackpot.imageColor, '#0B0F19']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroInner}>
          {jackpot.isNew ? <Badge label="Nuevo" tone="new" showDot /> : <Badge label="Premio destacado" tone="gold" showDot />}
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
            {jackpot.game.toUpperCase()}
          </Text>
          <Text style={styles.heroAmount}>{formatCurrency(jackpot.amount)}</Text>
          <Text variant="small" tone="muted">
            Premio actualizado por la administración
          </Text>
        </View>
      </AnimatedPressable>
    );
  }

  if (variant === 'tile') {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress?.(jackpot)}
        style={[styles.tile, animated as any]}
      >
        <LinearGradient
          colors={[jackpot.imageColor, 'rgba(0,0,0,0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.tileInner}>
          {jackpot.isNew ? <Badge label="Nuevo" tone="new" /> : <View />}
          <View>
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {jackpot.game}
            </Text>
            <Text style={styles.tileAmount}>{formatCurrency(jackpot.amount)}</Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress?.(jackpot)}
      style={[styles.row, animated as any]}
    >
      <View style={[styles.rowThumb, { backgroundColor: jackpot.imageColor }]}>
        <Ionicons name="diamond" size={20} color="rgba(255,255,255,0.85)" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {jackpot.name}
          </Text>
          {jackpot.isNew ? <Badge label="Nuevo" tone="new" /> : null}
        </View>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {jackpot.game}
        </Text>
        <Text style={styles.rowAmount}>{formatCurrency(jackpot.amount)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 220,
  },
  heroInner: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroAmount: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    color: '#FFE7AF',
    letterSpacing: -0.6,
    marginVertical: 4,
  },
  tile: {
    width: 220,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  tileInner: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  tileAmount: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFE7AF',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  rowThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  rowAmount: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.text.gold,
    marginTop: 2,
  },
});
