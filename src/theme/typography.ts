import { Platform, TextStyle } from 'react-native';

const family = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
}) as string;

const familyDisplay = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
}) as string;

export const typography = {
  display: {
    fontFamily: familyDisplay,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  h1: {
    fontFamily: family,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    fontWeight: '700',
  },
  h2: {
    fontFamily: family,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    fontWeight: '700',
  },
  h3: {
    fontFamily: family,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  small: {
    fontFamily: family,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  caption: {
    fontFamily: family,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
