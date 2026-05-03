import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Chip, Header, Screen, Skeleton, Text } from '@/components/ui';
import { JackpotCard } from '@/components/JackpotCard';
import { useJackpotsStore } from '@/store/useJackpotsStore';
import { colors, spacing } from '@/theme';
import type { JackpotCategory } from '@/types/domain';
import { formatCurrency, formatRelativeTime } from '@/utils/format';

const filters: Array<{ key: JackpotCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'progressive', label: 'Progresivos' },
  { key: 'slots', label: 'Slots' },
  { key: 'tables', label: 'Mesas' },
];

export default function JackpotsScreen() {
  const router = useRouter();
  const init = useJackpotsStore((s) => s.init);
  const jackpots = useJackpotsStore((s) => s.jackpots);
  const loading = useJackpotsStore((s) => s.loading);
  const filter = useJackpotsStore((s) => s.filter);
  const setFilter = useJackpotsStore((s) => s.setFilter);
  const [now, setNow] = useState(Date.now());

  useEffect(() => init(), [init]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? jackpots : jackpots.filter((j) => j.category === filter)),
    [jackpots, filter],
  );

  const total = useMemo(() => jackpots.reduce((s, j) => s + j.amount, 0), [jackpots]);

  return (
    <Screen>
      <Header title="Jackpots" subtitle="En vivo · stream activo" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.totalCard}>
          <Text variant="caption" tone="gold">
            ACUMULADO TOTAL EN VIVO
          </Text>
          <Text variant="display" tone="gold">
            {formatCurrency(total)}
          </Text>
          <Text variant="small" tone="muted">
            Última sincronización {formatRelativeTime(new Date(now).toISOString())}
          </Text>
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
              count={
                f.key === 'all'
                  ? jackpots.length
                  : jackpots.filter((j) => j.category === f.key).length
              }
            />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          {loading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} height={88} rounded="lg" />)
            : filtered.map((j) => (
                <JackpotCard key={j.id} jackpot={j} onPress={(jp) => router.push(`/jackpot/${jp.id}`)} />
              ))}
          {!loading && filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="body" tone="muted" align="center">
                No hay jackpots en esta categoría todavía.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: spacing.lg,
  },
  totalCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: 24,
    backgroundColor: colors.bg.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.gold,
    alignItems: 'center',
    gap: 4,
  },
  filtersRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
});
