import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Button, Card, Header, Screen, Text } from '@/components/ui';
import { AnimatedAmount } from '@/components/AnimatedAmount';
import { useJackpotsStore } from '@/store/useJackpotsStore';
import { colors, palette, radius, spacing } from '@/theme';
import { formatRelativeTime, formatNumber } from '@/utils/format';

const trendBadge = {
  hot: { tone: 'hot' as const, label: 'Caliente' },
  rising: { tone: 'rising' as const, label: 'Subiendo' },
  new: { tone: 'new' as const, label: 'Nuevo' },
  steady: { tone: 'neutral' as const, label: 'Estable' },
};

const categoryLabel = {
  progressive: 'Progresivo',
  slots: 'Slot',
  tables: 'Mesa',
};

export default function JackpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const init = useJackpotsStore((s) => s.init);
  const jackpots = useJackpotsStore((s) => s.jackpots);

  useEffect(() => init(), [init]);

  const jp = jackpots.find((j) => j.id === id);

  if (!jp) {
    return (
      <Screen>
        <Header showBack title="Jackpot" />
        <View style={styles.empty}>
          <Text variant="body" tone="muted">Cargando...</Text>
        </View>
      </Screen>
    );
  }

  const tb = trendBadge[jp.trend];

  return (
    <Screen>
      <Header showBack title={jp.name} subtitle={categoryLabel[jp.category]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(360)} style={styles.padded}>
          <View style={styles.hero}>
            <LinearGradient
              colors={[jp.imageColor, palette.midnight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Badge label={tb.label} tone={tb.tone} showDot />
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
              JACKPOT EN VIVO
            </Text>
            <AnimatedAmount value={jp.amount} style={styles.heroAmount as any} />
            <Text variant="small" tone="muted">
              Actualizado {formatRelativeTime(jp.updatedAt)}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.padded}>
          <Card variant="elevated" style={{ gap: spacing.md }}>
            <Text variant="h3">Detalles del juego</Text>
            <DetailRow icon="game-controller" label="Juego" value={jp.game} />
            <DetailRow icon="layers" label="Categoría" value={categoryLabel[jp.category]} />
            <DetailRow icon="trending-up" label="Tendencia" value={tb.label} />
            <DetailRow icon="speedometer" label="Velocidad" value={`+$${formatNumber(Number(jp.ticker.toFixed(2)))}/s aprox.`} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={styles.padded}>
          <Card variant="glass" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="information-circle" size={18} color={colors.text.gold} />
              <Text variant="bodyStrong">¿Cómo se gana?</Text>
            </View>
            <Text variant="small" tone="secondary">
              Visita Casino Atlántico Manatí y juega en cualquiera de las máquinas o mesas
              participantes. El jackpot se actualiza en tiempo real y se entrega al ganador
              al instante.
            </Text>
          </Card>
        </Animated.View>

        <View style={styles.padded}>
          <Button label="Ver ubicación en el mapa" variant="gold" fullWidth />
        </View>
      </ScrollView>
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={16} color={colors.text.gold} />
      </View>
      <Text variant="small" tone="muted" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
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
  },
  heroAmount: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    color: '#FFE7AF',
    letterSpacing: -0.6,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,201,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
