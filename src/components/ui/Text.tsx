import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography, TypographyToken } from '@/theme';

type Tone = 'primary' | 'secondary' | 'muted' | 'gold' | 'inverse';

type Props = TextProps & {
  variant?: TypographyToken;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
};

const toneMap: Record<Tone, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  gold: colors.text.gold,
  inverse: colors.text.inverse,
};

export function Text({
  variant = 'body',
  tone = 'primary',
  align = 'left',
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        typography[variant],
        { color: toneMap[tone], textAlign: align } as any,
        style,
      ]}
    />
  );
}

export const styles = StyleSheet.create({});
