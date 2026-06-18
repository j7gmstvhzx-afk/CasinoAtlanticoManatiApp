import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { typography } from '@/theme';
import { C, TONES, TONE_GRADIENTS, type Tone } from './shared';
import { AnimatedPressable } from './AnimatedPressable';

type Props = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  sub?: string;
  /** When set, the card becomes pressable (e.g. tap-to-filter KPI cards). */
  onPress?: () => void;
  /** Tints the card with its tone when it represents an active filter/selection. */
  active?: boolean;
};

export function StatCard({ label, value, icon, tone = 'navy', sub, onPress, active }: Props) {
  const t = TONES[tone];
  const gradient = TONE_GRADIENTS[tone];
  const Wrapper = onPress ? AnimatedPressable : View;
  const wrapperProps = onPress ? { onPress, hoverScale: 1.01 } : {};
  return (
    <Wrapper
      style={[styles.card, { shadowColor: t.fg }, active && { shadowOpacity: 0.22 }]}
      {...wrapperProps}
    >
      <View style={[styles.cardInner, active && { backgroundColor: t.bg, borderColor: t.fg + '55' }]}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topAccent} />
        <View style={styles.header}>
          {icon ? (
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBadge}>
              <Ionicons name={icon} size={18} color="#fff" />
            </LinearGradient>
          ) : null}
          <Text style={styles.label} numberOfLines={2}>{label}</Text>
        </View>

        <Text
          style={[styles.value, { color: t.fg }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          {value}
        </Text>

        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    // Responsive: grows to fill, wraps when it can't keep its basis width.
    flexGrow: 1,
    flexBasis: 200,
    minWidth: 168,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 2,
  },
  // Separate from `card`: `overflow: hidden` clips the gradient accent bar
  // to the rounded corners, but on iOS it also clips the drop shadow if
  // applied to the same view — so the shadow lives on the outer `card`.
  cardInner: {
    borderRadius: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  value: {
    fontFamily: typography.display.fontFamily,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  sub: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
    flexShrink: 1,
  },
});
