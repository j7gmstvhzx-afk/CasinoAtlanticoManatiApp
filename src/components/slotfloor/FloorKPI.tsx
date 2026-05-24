import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

const TEAL = '#2a9d8f';

type Tone = 'gold' | 'teal' | 'default';

type Props = {
  label:     string;
  value:     string | number;
  subtitle?: string;
  tone?:     Tone;
  flex?:     number;
};

const bgMap: Record<Tone, string> = {
  gold:    'rgba(212, 162, 76, 0.10)',
  teal:    'rgba(42, 157, 143, 0.10)',
  default: 'rgba(255,255,255,0.04)',
};

const borderMap: Record<Tone, string> = {
  gold:    'rgba(212, 162, 76, 0.30)',
  teal:    'rgba(42, 157, 143, 0.30)',
  default: colors.border.default,
};

const valueColorMap: Record<Tone, string> = {
  gold:    colors.text.gold,
  teal:    TEAL,
  default: colors.text.primary,
};

export function FloorKPI({ label, value, subtitle, tone = 'default', flex }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: bgMap[tone], borderColor: borderMap[tone], flex }]}>
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
      <Text
        variant="h2"
        numberOfLines={1}
        style={[styles.value, { color: valueColorMap[tone] }]}
      >
        {typeof value === 'number' ? value.toLocaleString('en-US') : value}
      </Text>
      {subtitle ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: 4,
  },
  value: {
    fontWeight: '700',
  },
});
