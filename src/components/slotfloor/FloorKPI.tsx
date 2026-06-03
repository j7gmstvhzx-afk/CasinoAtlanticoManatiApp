import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing, shadow } from '@/theme';

const TEAL = '#2a9d8f';
const GOLD = '#d4a574';
const NAVY = '#1a2332';

type Tone = 'gold' | 'teal' | 'default' | 'navy';

type Props = {
  label:     string;
  value:     string | number;
  subtitle?: string;
  tone?:     Tone;
  flex?:     number;
};

const bgMap: Record<Tone, string> = {
  gold:    '#fff9f2',
  teal:    '#f0faf9',
  default: '#ffffff',
  navy:    '#1a2332',
};

const borderMap: Record<Tone, string> = {
  gold:    'rgba(212, 165, 116, 0.40)',
  teal:    'rgba(42, 157, 143, 0.30)',
  default: colors.border.default,
  navy:    'transparent',
};

const valueColorMap: Record<Tone, string> = {
  gold:    GOLD,
  teal:    TEAL,
  default: NAVY,
  navy:    '#ffffff',
};

const labelColorMap: Record<Tone, string> = {
  gold:    colors.text.muted,
  teal:    colors.text.muted,
  default: colors.text.muted,
  navy:    'rgba(255,255,255,0.65)',
};

export function FloorKPI({ label, value, subtitle, tone = 'default', flex }: Props) {
  return (
    <View style={[
      styles.card,
      { backgroundColor: bgMap[tone], borderColor: borderMap[tone], flex },
    ]}>
      <Text variant="caption" numberOfLines={1} style={{ color: labelColorMap[tone] }}>
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
        <Text variant="caption" numberOfLines={1} style={{ color: labelColorMap[tone] }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: 4,
    ...shadow.sm,
  },
  value: {
    fontWeight: '700',
  },
});
