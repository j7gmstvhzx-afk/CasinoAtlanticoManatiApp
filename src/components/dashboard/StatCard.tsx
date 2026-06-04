import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, TONES, type Tone } from './shared';

type Props = {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: Tone;
  sub?: string;
};

export function StatCard({ label, value, icon, tone = 'navy', sub }: Props) {
  const t = TONES[tone];
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.iconBadge, { backgroundColor: t.bg }]}>
            <Ionicons name={icon} size={18} color={t.fg} />
          </View>
        ) : null}
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
      </View>

      <Text
        style={[styles.value, { color: t.fg }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {value}
      </Text>

      {sub ? <Text style={styles.sub} numberOfLines={2}>{sub}</Text> : null}
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
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
    gap: 12,
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
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  sub: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 16,
  },
});
