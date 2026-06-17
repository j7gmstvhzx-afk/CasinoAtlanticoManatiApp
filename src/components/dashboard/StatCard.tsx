import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { typography } from '@/theme';
import { C, TONES, TONE_GRADIENTS, type Tone } from './shared';

type Props = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  sub?: string;
};

export function StatCard({ label, value, icon, tone = 'navy', sub }: Props) {
  const t = TONES[tone];
  const gradient = TONE_GRADIENTS[tone];
  return (
    <View style={[styles.card, { shadowColor: t.fg }]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    // Responsive: grows to fill, wraps when it can't keep its basis width.
    flexGrow: 1,
    flexBasis: 200,
    minWidth: 168,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 2,
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
