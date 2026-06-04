import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { C } from './shared';

type PillTone = 'neutral' | 'positive' | 'gold';

type Props = {
  label: string;
  value: string;
  pillText?: string;
  pillTone?: PillTone;
};

export function StatCard({ label, value, pillText, pillTone = 'neutral' }: Props) {
  const pill = PILL[pillTone];
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {pillText ? (
        <View style={[styles.pill, { backgroundColor: pill.bg }]}>
          <Text style={[styles.pillText, { color: pill.fg }]}>{pillText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const PILL: Record<PillTone, { bg: string; fg: string }> = {
  neutral:  { bg: '#eef1f5', fg: C.navy3 },
  positive: { bg: C.greenBg, fg: C.green },
  gold:     { bg: '#f6ecdd', fg: C.gold },
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
    minHeight: 132,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  value: {
    fontSize: 34,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -1,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
