import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import { formatNumber } from '@/utils/format';
import type { Reward } from '@/types/domain';

const iconFor: Record<Reward['category'], keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant',
  play: 'game-controller',
  experience: 'sparkles',
  merch: 'shirt',
};

type Props = {
  reward: Reward;
  userPoints: number;
  onRedeem?: (r: Reward) => void;
};

export function RewardCard({ reward, userPoints, onRedeem }: Props) {
  const affordable = userPoints >= reward.cost;
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onRedeem?.(reward);
      }}
      style={[styles.root, !affordable && { opacity: 0.55 }]}
    >
      <View style={[styles.thumb, { backgroundColor: reward.imageColor }]}>
        <LinearGradient
          colors={[reward.imageColor, 'rgba(0,0,0,0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name={iconFor[reward.category]} size={28} color="#fff" />
      </View>
      <View style={{ padding: spacing.md, gap: 4 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {reward.title}
        </Text>
        <Text variant="small" tone="muted" numberOfLines={2}>
          {reward.description}
        </Text>
        <View style={styles.cost}>
          <Ionicons name="diamond" size={12} color={colors.brand.gold} />
          <Text variant="bodyStrong" tone="gold">
            {formatNumber(reward.cost)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: 168,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    marginRight: spacing.md,
  },
  thumb: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
});
