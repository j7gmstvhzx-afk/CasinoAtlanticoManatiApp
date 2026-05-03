import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Header, Screen, SectionHeader, Skeleton, Text } from '@/components/ui';
import { TierProgress } from '@/components/TierProgress';
import { DailySpin } from '@/components/DailySpin';
import { RewardCard } from '@/components/RewardCard';
import { useUserStore } from '@/store/useUserStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { api } from '@/services/api';
import type { Reward } from '@/types/domain';
import { colors, spacing } from '@/theme';

export default function RewardsScreen() {
  const user = useUserStore((s) => s.user);
  const addPoints = useUserStore((s) => s.addPoints);
  const spendPoints = useUserStore((s) => s.spendPoints);
  const bumpStreak = useUserStore((s) => s.bumpStreak);
  const markSpinClaimed = useUserStore((s) => s.markSpinClaimed);
  const pushNotification = useNotificationsStore((s) => s.push);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const r = await api.getRewards();
      setRewards(r);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toDateString();
  const lastSpin = user.lastSpinAt ? new Date(user.lastSpinAt).toDateString() : null;
  const spinAvailable = lastSpin !== today;

  const handleSpin = async () => {
    setSpinning(true);
    const res = await api.claimDailySpin();
    setTimeout(() => {
      addPoints(res.points);
      bumpStreak();
      markSpinClaimed();
      setLastReward(res.label);
      setSpinning(false);
      pushNotification({
        id: `spin-${Date.now()}`,
        title: '¡Ganaste puntos!',
        body: `Tu giro diario te dio ${res.label}.`,
        createdAt: new Date().toISOString(),
        read: false,
        kind: 'loyalty',
      });
    }, 1300);
  };

  const handleRedeem = async (r: Reward) => {
    const res = await api.redeemReward(r, user.points);
    if (!res.ok) {
      Alert.alert('Puntos insuficientes', `Necesitas ${r.cost - user.points} pts más para canjear "${r.title}".`);
      return;
    }
    spendPoints(r.cost);
    pushNotification({
      id: `redeem-${Date.now()}`,
      title: 'Premio canjeado',
      body: `Has canjeado "${r.title}". Pasa por el counter VIP.`,
      createdAt: new Date().toISOString(),
      read: false,
      kind: 'loyalty',
    });
    Alert.alert('¡Listo!', `Has canjeado "${r.title}". Recógelo en el counter del Club.`);
  };

  return (
    <Screen>
      <Header title="Club Atlántico" subtitle="Tu programa de lealtad" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <TierProgress tier={user.tier} points={user.points} pointsToNext={user.pointsToNextTier} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.padded}>
          <DailySpin
            available={spinAvailable}
            streak={user.streak}
            spinning={spinning}
            onSpin={handleSpin}
            lastReward={lastReward}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)}>
          <SectionHeader title="Premios disponibles" caption="Canjea con tus puntos" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {loading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} width={168} height={180} rounded="lg" style={{ marginRight: spacing.md }} />
                ))
              : rewards.map((r) => (
                  <RewardCard key={r.id} reward={r} userPoints={user.points} onRedeem={handleRedeem} />
                ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(360)} style={styles.padded}>
          <Card variant="elevated" style={{ gap: spacing.md }}>
            <Text variant="h3">¿Cómo gano puntos?</Text>
            <View style={styles.howRow}>
              <Text variant="body" tone="secondary">
                · 1 pt por cada $1 jugado en máquinas
              </Text>
              <Text variant="body" tone="secondary">
                · 2 pts por cada $1 en mesas de juego
              </Text>
              <Text variant="body" tone="secondary">
                · Bonos por torneos y noches VIP
              </Text>
              <Text variant="body" tone="secondary">
                · Puntos extra en tu cumpleaños
              </Text>
            </View>
            <Button label="Ver términos del programa" variant="outline" fullWidth onPress={() => {}} />
          </Card>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: spacing.xl,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  hScroll: {
    paddingHorizontal: spacing.lg,
  },
  howRow: {
    gap: 6,
    backgroundColor: colors.bg.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
});
