import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Badge, Text } from '@/components/ui';
import { AnimatedAmount } from './AnimatedAmount';
import { colors, radius, shadow, spacing } from '@/theme';
import type { Jackpot } from '@/types/domain';
import { formatRelativeTime } from '@/utils/format';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const trendBadge = {
  hot: { tone: 'hot' as const, label: 'Caliente' },
  rising: { tone: 'rising' as const, label: 'Subiendo' },
  new: { tone: 'new' as const, label: 'Nuevo' },
  steady: { tone: 'neutral' as const, label: 'Estable' },
};

type Props = {
  jackpot: Jackpot;
  onPress?: (j: Jackpot) => void;
  variant?: 'tile' | 'row' | 'hero';
};

export function JackpotCard({ jackpot, onPress, variant = 'row' }: Props) {
  const press = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (jackpot.trend === 'hot') {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0);
    }
  }, [jackpot.trend, pulse]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.55 }));

  const tb = trendBadge[jackpot.trend];

  if (variant === 'hero') {
    return (
      <AnimatedPressable
        onPressIn={() => {
          press.value = withSpring(0.98);
          Haptics.selectionAsync();
        }}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={() => onPress?.(jackpot)}
        style={[styles.hero, shadow.lg, animated as any]}
      >
        <LinearGradient
          colors={[jackpot.imageColor, '#0B0F19']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: jackpot.imageColor, opacity: 0 },
            glow,
          ]}
        />
        <View style={styles.heroInner}>
          <Badge label={tb.label} tone={tb.tone} showDot />
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
            JACKPOT EN VIVO · {jackpot.game.toUpperCase()}
          </Text>
          <AnimatedAmount
            value={jackpot.amount}
            style={[styles.heroAmount as any]}
          />
          <Text variant="small" tone="muted">
            Actualizado {formatRelativeTime(jackpot.updatedAt)}
          </Text>
        </View>
      </AnimatedPressable>
    );
  }

  if (variant === 'tile') {
    return (
      <AnimatedPressable
        onPressIn={() => {
          press.value = withSpring(0.97);
          Haptics.selectionAsync();
        }}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={() => onPress?.(jackpot)}
        style={[styles.tile, animated as any]}
      >
        <LinearGradient
          colors={[jackpot.imageColor, 'rgba(0,0,0,0.7)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[StyleSheet.absoluteFill, glow, { backgroundColor: jackpot.imageColor }]} />
        <View style={styles.tileInner}>
          <Badge label={tb.label} tone={tb.tone} />
          <View>
            <Text variant="caption" tone="secondary">
              {jackpot.game}
            </Text>
            <AnimatedAmount value={jackpot.amount} style={styles.tileAmount as any} />
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
      onPress={() => onPress?.(jackpot)}
      style={[styles.row, animated as any]}
    >
      <View style={[styles.rowThumb, { backgroundColor: jackpot.imageColor }]}>
        <Animated.View style={[StyleSheet.absoluteFill, glow, { backgroundColor: jackpot.imageColor }]} />
        <Ionicons name="diamond" size={20} color="rgba(255,255,255,0.85)" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {jackpot.name}
          </Text>
          <Badge label={tb.label} tone={tb.tone} />
        </View>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {jackpot.game}
        </Text>
        <AnimatedAmount value={jackpot.amount} style={styles.rowAmount as any} />
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
    overflow: 'hidden',
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
