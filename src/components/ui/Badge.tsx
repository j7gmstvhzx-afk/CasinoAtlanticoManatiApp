import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '@/theme';

type Tone = 'hot' | 'rising' | 'new' | 'success' | 'info' | 'warning' | 'gold' | 'neutral';

const toneColor: Record<Tone, { bg: string; fg: string; dot?: string }> = {
  hot: { bg: 'rgba(255, 91, 54, 0.15)', fg: '#FF7A5A', dot: '#FF5B36' },
  rising: { bg: 'rgba(245, 165, 36, 0.15)', fg: '#F5A524', dot: '#F5A524' },
  new: { bg: 'rgba(139, 92, 246, 0.18)', fg: '#B095FF', dot: '#8B5CF6' },
  success: { bg: 'rgba(31, 176, 122, 0.15)', fg: '#3FD79A', dot: '#1FB07A' },
  info: { bg: 'rgba(110, 160, 230, 0.15)', fg: colors.brand.atlantic, dot: '#6EA0E6' },
  warning: { bg: 'rgba(245, 165, 36, 0.15)', fg: '#F5A524', dot: '#F5A524' },
  gold: { bg: 'rgba(245, 201, 122, 0.16)', fg: colors.text.gold, dot: colors.brand.gold },
  neutral: { bg: 'rgba(255,255,255,0.08)', fg: colors.text.secondary },
};

type Props = {
  label: string;
  tone?: Tone;
  showDot?: boolean;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', showDot, style }: Props) {
  const c = toneColor[tone];
  return (
    <View style={[styles.base, { backgroundColor: c.bg }, style]}>
      {showDot && c.dot ? <View style={[styles.dot, { backgroundColor: c.dot }]} /> : null}
      <Text variant="caption" style={{ color: c.fg, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
