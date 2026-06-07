import { Platform, TextStyle } from 'react-native';

// On web: Inter (body) + Playfair Display (display/headers) loaded via app/+html.tsx
const family = Platform.select({
  web:     "'Inter', system-ui, sans-serif",
  ios:     '-apple-system',
  android: 'sans-serif',
  default: "'Inter', sans-serif",
}) as string;

const familyDisplay = Platform.select({
  web:     "'Playfair Display', Georgia, serif",
  ios:     'Georgia',
  android: 'serif',
  default: "'Playfair Display', serif",
}) as string;

export const typography = {
  display: {
    fontFamily: familyDisplay,
    fontSize:   32,
    lineHeight: 38,
    letterSpacing: -0.5,
    fontWeight: '800',
  },
  h1: {
    fontFamily: familyDisplay,
    fontSize:   24,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontWeight: '700',
  },
  h2: {
    fontFamily: family,
    fontSize:   20,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontWeight: '700',
  },
  h3: {
    fontFamily: family,
    fontSize:   17,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontFamily: family,
    fontSize:   15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontFamily: family,
    fontSize:   15,
    lineHeight: 22,
    fontWeight: '600',
  },
  small: {
    fontFamily: family,
    fontSize:   13,
    lineHeight: 18,
    fontWeight: '400',
  },
  caption: {
    fontFamily: family,
    fontSize:   11,
    lineHeight: 14,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize:   13,
    lineHeight: 18,
    fontWeight: '500',
  },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
