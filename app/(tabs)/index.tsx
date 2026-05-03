import React, { useEffect, useMemo, useState } from 'react';
import {
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
  Badge,
  Button,
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
import { useUserStore } from '@/store/useUserStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { api } from '@/services/api';
import type { CasinoEvent, Promotion } from '@/types/domain';
import { colors, spacing } from '@/theme';
import { tierLabel } from '@/utils/format';

export default function HomeScreen() {
  const router = useRouter();
  const init = useJackpotsStore((s) => s.init);
  const jackpots = useJackpotsStore((s) => s.jackpots);
  const loadingJackpots = useJackpotsStore((s) => s.loading);
  const user = useUserStore((s) => s.user);
  const unread = useNotificationsStore((s) => s.unread);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<CasinoEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => init(), [init]);

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
    await loadStatic();
    setRefreshing(false);
  };

  const featuredJackpot = useMemo(
    () => jackpots.find((j) => j.trend === 'hot') ?? jackpots[0],
    [jackpots],
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  })();

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.gold}
          />
        }
      >
        {/* Welcome / user state */}
        <Animated.View entering={FadeInDown.duration(360)}>
          <Card variant="glass" style={styles.welcome}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="gold">
                {greeting.toUpperCase()}
              </Text>
              <Text variant="h2">{user.displayName}</Text>
              <View style={styles.welcomeRow}>
                <Badge label={`Club ${tierLabel[user.tier]}`} tone="gold" showDot />
                {user.isGuest ? (
                  <Pressable onPress={() => router.push('/auth')}>
                    <Text variant="small" tone="gold">
                      Crear cuenta →
                    </Text>
                  </Pressable>
                ) : (
                  <Text variant="small" tone="muted">
                    {user.points} pts disponibles
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Featured live jackpot */}
        <Animated.View entering={FadeInDown.delay(60).duration(360)} style={{ paddingHorizontal: spacing.lg }}>
          {loadingJackpots || !featuredJackpot ? (
            <Skeleton height={220} rounded="xl" />
          ) : (
            <JackpotCard jackpot={featuredJackpot} variant="hero" onPress={(j) => router.push(`/jackpot/${j.id}`)} />
          )}
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(120).duration(360)}>
          <View style={styles.quickRow}>
            <QuickAction icon="map" label="Mapa" hint="Cómo llegar" tint={colors.brand.gold} onPress={() => {}} />
            <QuickAction icon="restaurant" label="Menú" hint="Cocina criolla" tint="#3FD79A" onPress={() => {}} />
            <QuickAction icon="logo-whatsapp" label="WhatsApp" hint="Atención" tint="#25D366" onPress={() => {}} />
            <QuickAction icon="call" label="Llamar" hint="787-555-2200" tint="#6EA0E6" onPress={() => {}} />
          </View>
        </Animated.View>

        {/* Live jackpots horizontal */}
        <Animated.View entering={FadeInDown.delay(180).duration(360)}>
          <SectionHeader
            title="Jackpots en vivo"
            caption="Actualizados al segundo"
            actionLabel="Ver todos"
            onAction={() => router.push('/jackpots')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {loadingJackpots
              ? [1, 2, 3].map((i) => <Skeleton key={i} width={220} height={140} rounded="lg" style={{ marginRight: spacing.md }} />)
              : jackpots
                  .filter((j) => j.id !== featuredJackpot?.id)
                  .slice(0, 6)
                  .map((j) => <JackpotCard key={j.id} jackpot={j} variant="tile" onPress={(jp) => router.push(`/jackpot/${jp.id}`)} />)}
          </ScrollView>
        </Animated.View>

        {/* Promotions */}
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

        {/* Events */}
        <Animated.View entering={FadeInDown.delay(300).duration(360)}>
          <SectionHeader title="Próximos eventos" caption="Reserva tu lugar" />
          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
            {events.length === 0
              ? [1, 2].map((i) => <Skeleton key={i} height={92} rounded="lg" />)
              : events.slice(0, 3).map((e) => <EventCard key={e.id} event={e} />)}
          </View>
        </Animated.View>

        {/* Footer CTA */}
        <Animated.View entering={FadeInDown.delay(360).duration(360)} style={{ paddingHorizontal: spacing.lg }}>
          <Card variant="elevated" style={{ alignItems: 'center', gap: spacing.md }}>
            <Text variant="h3" align="center">
              ¿Listo para tu próxima visita?
            </Text>
            <Text variant="small" tone="muted" align="center">
              Únete al Club Atlántico y acumula puntos en cada jugada.
            </Text>
            <Button
              label={user.isGuest ? 'Crear cuenta' : 'Ver mis recompensas'}
              variant="gold"
              fullWidth
              onPress={() => router.push(user.isGuest ? '/auth' : '/rewards')}
            />
          </Card>
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
  welcome: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
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
