import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { Header, Screen, SectionHeader, Skeleton, Text } from '@/components/ui';
import { PromotionCard } from '@/components/PromotionCard';
import { EventCard } from '@/components/EventCard';
import { api } from '@/services/api';
import type { CasinoEvent, Promotion } from '@/types/domain';
import { spacing } from '@/theme';

export default function PromotionsScreen() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<CasinoEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, e] = await Promise.all([api.getPromotions(), api.getEvents()]);
      setPromotions(p);
      setEvents(e);
      setLoading(false);
    })();
  }, []);

  return (
    <Screen>
      <Header title="Promociones & Eventos" subtitle="Lo que está pasando esta semana" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Promociones activas" caption="Aprovecha antes de que terminen" />
        <View style={styles.list}>
          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} height={220} rounded="xl" />)
            : promotions.map((p, idx) => (
                <Animated.View key={p.id} entering={FadeInDown.delay(idx * 80).duration(360)}>
                  <PromotionCard promo={p} onPress={(pr) => router.push(`/promotion/${pr.id}`)} />
                </Animated.View>
              ))}
        </View>

        <SectionHeader title="Eventos próximos" caption="Reserva tu lugar gratis" />
        <View style={styles.list}>
          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} height={92} rounded="lg" />)
            : events.map((e, idx) => (
                <Animated.View key={e.id} entering={FadeInDown.delay(idx * 80).duration(360)}>
                  <EventCard event={e} />
                </Animated.View>
              ))}
        </View>

        {!loading && events.length === 0 && promotions.length === 0 ? (
          <Text variant="body" tone="muted" align="center">
            No hay actividades programadas todavía.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: spacing.xl,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
