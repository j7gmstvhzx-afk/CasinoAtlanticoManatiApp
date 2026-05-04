import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  Card,
  Header,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
} from '@/components/ui';
import { JackpotCard } from '@/components/JackpotCard';
import { PromotionCard } from '@/components/PromotionCard';
import { EventCard } from '@/components/EventCard';
import { QuickAction } from '@/components/QuickAction';
import { useJackpotsStore } from '@/store/useJackpotsStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { api } from '@/services/api';
import type { CasinoEvent, Promotion } from '@/types/domain';
import { colors, spacing } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

const MAPS_URL = Platform.select({
  ios: 'http://maps.apple.com/?q=Casino+Atl%C3%A1ntico+Manati',
  android: 'geo:0,0?q=Casino+Atl%C3%A1ntico+Manati',
  default: 'https://maps.google.com/?q=Casino+Atl%C3%A1ntico+Manati',
}) as string;

export default function HomeScreen() {
  const router = useRouter();
  const load = useJackpotsStore((s) => s.load);
  const refreshJackpots = useJackpotsStore((s) => s.refresh);
  const snapshot = useJackpotsStore((s) => s.snapshot);
  const loadingJackpots = useJackpotsStore((s) => s.loading);
  const unread = useNotificationsStore((s) => s.unread);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<CasinoEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const loadStatic = async () => {
    const [p, e] = await Promise.all([api.getPromotions(), api.getEvents()]);
    setPromotions(p);
    setEvents(e);
  };

  useEffect(() => {
    loadStatic();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([loadStatic(), refreshJackpots()]);
    setRefreshing(false);
  };

  const featured = useMemo(
    () => snapshot?.jackpots.find((j) => j.isFeatured) ?? snapshot?.jackpots[0],
    [snapshot],
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  const open = (url: string) => {
    Haptics.selectionAsync();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen>
      <Header
        title="Casino Atlántico"
        subtitle="Manatí, Puerto Rico"
        rightSlot={
          <Pressable
            onPress={() => router.push('/notifications')}
            style={styles.bellWrap}
            hitSlop={10}
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
            {unread > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.gold} />
        }
      >
        {/* Saludo */}
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <Card variant="glass">
            <Text variant="caption" tone="gold">
              {greeting.toUpperCase()}
            </Text>
            <Text variant="h2" style={{ marginTop: 4 }}>
              Bienvenido a Atlántico
            </Text>
            <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
              Promociones, premios, menú y más en un solo lugar.
            </Text>
          </Card>
        </Animated.View>

        {/* Premio destacado */}
        <Animated.View entering={FadeInDown.delay(60).duration(360)} style={styles.padded}>
          {loadingJackpots || !featured ? (
            <Skeleton height={220} rounded="xl" />
          ) : (
            <JackpotCard
              jackpot={featured}
              variant="hero"
              onPress={(j) => router.push(`/jackpot/${j.id}`)}
            />
          )}
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(120).duration(360)}>
          <View style={styles.quickRow}>
            <QuickAction icon="map" label="Mapa" hint="Cómo llegar" tint={colors.brand.gold} onPress={() => open(MAPS_URL)} />
            <QuickAction
              icon="logo-whatsapp"
              label="WhatsApp"
              hint="Atención"
              tint="#25D366"
              onPress={() => open('https://wa.me/17875552200')}
            />
            <QuickAction icon="call" label="Llamar" hint="787-555-2200" tint="#6EA0E6" onPress={() => open('tel:+17875552200')} />
            <QuickAction icon="restaurant" label="Menú" hint="Cocina criolla" tint="#3FD79A" onPress={() => router.push('/menu')} />
          </View>
        </Animated.View>

        {/* Premios del día (jackpots) */}
        <Animated.View entering={FadeInDown.delay(180).duration(360)}>
          <SectionHeader
            title="Premios del día"
            caption={
              snapshot
                ? `Actualizado ${formatRelativeTime(snapshot.updatedAt)}`
                : 'Cargando...'
            }
            actionLabel="Ver todos"
            onAction={() => router.push('/jackpots')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {loadingJackpots
              ? [1, 2, 3].map((i) => <Skeleton key={i} width={220} height={140} rounded="lg" style={{ marginRight: spacing.md }} />)
              : (snapshot?.jackpots ?? [])
                  .filter((j) => j.id !== featured?.id)
                  .slice(0, 6)
                  .map((j) => (
                    <JackpotCard
                      key={j.id}
                      jackpot={j}
                      variant="tile"
                      onPress={(jp) => router.push(`/jackpot/${jp.id}`)}
                    />
                  ))}
          </ScrollView>
        </Animated.View>

        {/* Promociones */}
        <Animated.View entering={FadeInDown.delay(240).duration(360)}>
          <SectionHeader
            title="Promociones"
            caption="Solo por tiempo limitado"
            actionLabel="Ver todas"
            onAction={() => router.push('/promotions')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {promotions.length === 0
              ? [1, 2].map((i) => <Skeleton key={i} width={240} height={160} rounded="lg" style={{ marginRight: spacing.md }} />)
              : promotions.map((p) => (
                  <PromotionCard
                    key={p.id}
                    promo={p}
                    variant="compact"
                    onPress={(pr) => router.push(`/promotion/${pr.id}`)}
                  />
                ))}
          </ScrollView>
        </Animated.View>

        {/* Eventos */}
        <Animated.View entering={FadeInDown.delay(300).duration(360)}>
          <SectionHeader title="Próximos eventos" caption="No te los pierdas" />
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
            {events.length === 0
              ? [1, 2].map((i) => <Skeleton key={i} height={92} rounded="lg" />)
              : events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
          </View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.danger,
    borderWidth: 2,
    borderColor: colors.bg.base,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  hScroll: {
    paddingHorizontal: spacing.lg,
    paddingRight: spacing.lg,
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
});
