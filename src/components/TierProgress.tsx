import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { colors, radius, spacing, shadow } from '@/theme';
import { formatNumber, tierLabel } from '@/utils/format';
import type { LoyaltyTier } from '@/types/domain';

const tierThresholds: Record<LoyaltyTier, number> = {
  classic: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 35000,
};

const tierColors: Record<LoyaltyTier, [string, string]> = {
  classic: ['#3D6FB8', '#6EA0E6'],
  silver: ['#5A6275', '#C0C8D8'],
  gold: ['#7A5410', '#F5C97A'],
  platinum: ['#2A3354', '#A4B5E0'],
  diamond: ['#1F3A6B', '#A6E0FF'],
};

const tierOrder: LoyaltyTier[] = ['classic', 'silver', 'gold', 'platinum', 'diamond'];

type Props = {
  tier: LoyaltyTier;
  points: number;
  pointsToNext: number;
};

export function TierProgress({ tier, points, pointsToNext }: Props) {
  const idx = tierOrder.indexOf(tier);
  const next = tierOrder[idx + 1];
  const start = tierThresholds[tier];
  const end = next ? tierThresholds[next] : start + 1;
  const ratio = next ? Math.min(1, Math.max(0, (points - start) / (end - start))) : 1;

  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(ratio, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [ratio, fill]);

  const animated = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  const [from, to] = tierColors[tier];

  return (
    <View style={[styles.root, shadow.md]}>
      <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.tierPill}>
            <Ionicons name="diamond-outline" size={14} color="#fff" />
            <Text variant="caption" style={{ color: '#fff' }}>
              CLUB ATLÁNTICO · {tierLabel[tier].toUpperCase()}
            </Text>
          </View>
          {next ? (
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Próximo: {tierLabel[next]}
            </Text>
          ) : (
            <Text variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Nivel máximo
            </Text>
          )}
        </View>

        <Text variant="display" style={{ color: '#fff', marginTop: spacing.sm }}>
          {formatNumber(points)} <Text variant="h3" style={{ color: 'rgba(255,255,255,0.85)' }}>pts</Text>
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, animated]} />
        </View>

        <Text variant="small" style={{ color: 'rgba(255,255,255,0.92)', marginTop: spacing.xs }}>
          {next ? `Faltan ${formatNumber(pointsToNext)} pts para ${tierLabel[next]}` : 'Has alcanzado el nivel más alto'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  inner: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFE7AF',
    borderRadius: radius.pill,
  },
});
