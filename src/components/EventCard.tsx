import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import type { CasinoEvent } from '@/types/domain';

const iconFor: Record<CasinoEvent['category'], keyof typeof Ionicons.glyphMap> = {
  tournament: 'trophy',
  show: 'musical-notes',
  dining: 'restaurant',
  special: 'sparkles',
};

const labelFor: Record<CasinoEvent['category'], string> = {
  tournament: 'Torneo',
  show: 'Show',
  dining: 'Gastronomía',
  special: 'Especial',
};

type Props = {
  event: CasinoEvent;
  onPress?: (e: CasinoEvent) => void;
};

export function EventCard({ event, onPress }: Props) {
  const date = new Date(event.startsAt);
  const day = date.getDate();
  const month = date.toLocaleDateString('es-PR', { month: 'short' });
  const fillRatio = event.attending / event.capacity;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.(event);
      }}
    >
      <Card variant="elevated" padded={false} style={styles.root}>
        <View style={styles.dateBlock}>
          <Text variant="caption" tone="gold">
            {month.toUpperCase()}
          </Text>
          <Text variant="h1" tone="primary" style={{ lineHeight: 32 }}>
            {day}
          </Text>
        </View>
        <View style={{ flex: 1, padding: spacing.lg, gap: 4 }}>
          <View style={styles.row}>
            <Ionicons name={iconFor[event.category]} size={14} color={colors.text.gold} />
            <Text variant="caption" tone="gold">
              {labelFor[event.category]}
            </Text>
          </View>
          <Text variant="bodyStrong" numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.text.muted} />
            <Text variant="small" tone="muted" numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <View style={styles.fillBar}>
            <View style={[styles.fillBarInner, { width: `${Math.min(100, fillRatio * 100)}%` }]} />
          </View>
          <Text variant="caption" tone="muted">
            {event.attending}/{event.capacity} confirmados
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dateBlock: {
    width: 76,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,162,76,0.08)',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border.subtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fillBar: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fillBarInner: {
    height: '100%',
    backgroundColor: colors.brand.gold,
    borderRadius: radius.pill,
  },
});
