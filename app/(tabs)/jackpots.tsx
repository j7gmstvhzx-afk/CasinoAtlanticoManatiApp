import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Chip, Header, Screen, Skeleton, Text } from '@/components/ui';
import { JackpotCard } from '@/components/JackpotCard';
import { useJackpotsStore, filterJackpots } from '@/store/useJackpotsStore';
import { colors, radius, spacing } from '@/theme';
import type { JackpotCategory } from '@/types/domain';
import { formatRelativeTime } from '@/utils/format';

const filters: Array<{ key: JackpotCategory | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'progressive', label: 'Progresivos' },
  { key: 'slots', label: 'Slots' },
  { key: 'tables', label: 'Mesas' },
];

export default function JackpotsScreen() {
  const router = useRouter();
  const load = useJackpotsStore((s) => s.load);
  const refresh = useJackpotsStore((s) => s.refresh);
  const snapshot = useJackpotsStore((s) => s.snapshot);
  const loading = useJackpotsStore((s) => s.loading);
  const filter = useJackpotsStore((s) => s.filter);
  const setFilter = useJackpotsStore((s) => s.setFilter);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const list = snapshot?.jackpots ?? [];
  const filtered = useMemo(() => filterJackpots(list, filter), [list, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen>
      <Header title="Premios" subtitle="Casino Atlántico Manatí" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.gold} />
        }
      >
        <Animated.View entering={FadeInDown.duration(360)} style={styles.headerCard}>
          <View style={styles.iconBubble}>
            <Ionicons name="diamond" size={22} color={colors.brand.gold} />
          </View>
          <Text variant="caption" tone="gold">
            LISTADO OFICIAL
          </Text>
          <Text variant="h2" align="center" style={{ marginTop: 4 }}>
            Premios actualizados a diario
          </Text>
          <Text variant="small" tone="muted" align="center" style={{ marginTop: 4 }}>
            Los montos los publica la administración del casino una vez al día.
          </Text>
          {snapshot ? (
            <View style={styles.timestamp}>
              <Ionicons name="time-outline" size={14} color={colors.text.gold} />
              <Text variant="caption" tone="gold">
                ACTUALIZADO {formatRelativeTime(snapshot.updatedAt).toUpperCase()}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
              count={f.key === 'all' ? list.length : list.filter((j) => j.category === f.key).length}
            />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          {loading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} height={88} rounded="lg" />)
            : filtered.map((j, idx) => (
                <Animated.View key={j.id} entering={FadeInDown.delay(idx * 30).duration(280)}>
                  <JackpotCard jackpot={j} onPress={(jp) => router.push(`/jackpot/${jp.id}`)} />
                </Animated.View>
              ))}
          {!loading && filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text tone="muted" align="center">
                No hay premios en esta categoría todavía.
              </Text>
            </View>
          ) : null}
        </View>

        <Text variant="caption" tone="muted" align="center" style={{ paddingHorizontal: spacing.lg }}>
          Los montos pueden cambiar. Consulta en el casino para confirmar.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: spacing.lg,
  },
  headerCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.bg.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.gold,
    alignItems: 'center',
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245,201,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,201,122,0.12)',
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
