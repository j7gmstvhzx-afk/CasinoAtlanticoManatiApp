import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadow } from '@/theme';

type Variant = 'surface' | 'elevated' | 'glass' | 'gold';

type Props = ViewProps & {
  variant?: Variant;
  padded?: boolean;
};

export function Card({ variant = 'surface', padded = true, style, children, ...rest }: Props) {
  if (variant === 'gold') {
    return (
      <LinearGradient
        colors={[colors.brand.gradient[0], colors.brand.gradient[1], colors.brand.gradient[2]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, padded && styles.padded, shadow.gold, style as any]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      {...rest}
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'glass'    && styles.glass,
        variant === 'surface'  && styles.surface,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  surface: {
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    ...shadow.sm,
  },
  elevated: {
    backgroundColor: colors.bg.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    ...shadow.md,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    ...shadow.sm,
  },
});
