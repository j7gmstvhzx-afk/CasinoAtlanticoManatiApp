import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Button, Card, Header, Screen, Text } from '@/components/ui';
import { Countdown } from '@/components/Countdown';
import { api } from '@/services/api';
import type { Promotion } from '@/types/domain';
import { colors, radius, spacing } from '@/theme';

const accentMap: Record<Promotion['accent'], { from: string; to: string; tone: 'gold' | 'info' | 'success' | 'hot' }> = {
  gold: { from: '#7A5410', to: '#D4A24C', tone: 'gold' },
  atlantic: { from: '#1F3A6B', to: '#3D6FB8', tone: 'info' },
  ruby: { from: '#7A1F2A', to: '#E5484D', tone: 'hot' },
  emerald: { from: '#0F4D38', to: '#1FB07A', tone: 'success' },
};

export default function PromotionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [promo, setPromo] = useState<Promotion | undefined>();

  useEffect(() => {
    api.getPromotions().then((list) => setPromo(list.find((p) => p.id === id)));
  }, [id]);

  if (!promo) {
    return (
      <Screen>
        <Header showBack title="Promoción" />
        <View style={styles.empty}>
          <Text variant="body" tone="muted">Cargando...</Text>
        </View>
      </Screen>
    );
  }

  const a = accentMap[promo.accent];

  return (
    <Screen>
      <Header showBack title={promo.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <View style={styles.hero}>
            <LinearGradient colors={[a.from, a.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            {promo.badge ? <Badge label={promo.badge} tone={a.tone} /> : null}
            <Text variant="display" style={{ color: '#fff', marginTop: spacing.sm }}>
              {promo.title}
            </Text>
            <Text variant="body" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {promo.subtitle}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.padded}>
          <Card variant="elevated" style={{ gap: spacing.md }}>
            <Text variant="h3">Tiempo restante</Text>
            <Countdown endsAt={promo.endsAt} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={styles.padded}>
          <Card variant="glass" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="information-circle" size={18} color={colors.text.gold} />
              <Text variant="bodyStrong">Detalles</Text>
            </View>
            <Text variant="body" tone="secondary">
              {promo.description}
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.padded}>
          <Button label={promo.cta} variant="gold" fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 60, gap: spacing.lg },
  padded: { paddingHorizontal: spacing.lg },
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xl,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
