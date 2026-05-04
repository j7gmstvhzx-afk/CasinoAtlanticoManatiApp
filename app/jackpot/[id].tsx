import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Card, Header, Screen, Text } from '@/components/ui';
import { useJackpotsStore } from '@/store/useJackpotsStore';
import { colors, palette, radius, spacing } from '@/theme';
import { formatCurrency, formatRelativeTime } from '@/utils/format';

const categoryLabel = {
  progressive: 'Progresivo',
  slots: 'Slot',
  tables: 'Mesa',
};

export default function JackpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useJackpotsStore((s) => s.load);
  const snapshot = useJackpotsStore((s) => s.snapshot);

  useEffect(() => {
    load();
  }, [load]);

  const jp = snapshot?.jackpots.find((j) => j.id === id);

  if (!jp || !snapshot) {
    return (
      <Screen>
        <Header showBack title="Premio" />
        <View style={styles.empty}>
          <Text tone="muted">Cargando...</Text>
        </View>
      </Screen>
    );
  }

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
            {jp.isNew ? <Badge label="Nuevo" tone="new" showDot /> : <Badge label="Premio destacado" tone="gold" showDot />}
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
              {jp.game.toUpperCase()}
            </Text>
            <Text style={styles.heroAmount}>{formatCurrency(jp.amount)}</Text>
            <Text variant="small" tone="muted">
              Actualizado {formatRelativeTime(snapshot.updatedAt)}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(360)} style={styles.padded}>
          <Card variant="elevated" style={{ gap: spacing.md }}>
            <Text variant="h3">Detalles</Text>
            <DetailRow icon="game-controller" label="Juego" value={jp.game} />
            <DetailRow icon="layers" label="Categoría" value={categoryLabel[jp.category]} />
            <DetailRow icon="cash" label="Monto del premio" value={formatCurrency(jp.amount)} />
            <DetailRow
              icon="time"
              label="Última actualización"
              value={formatRelativeTime(snapshot.updatedAt)}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)} style={styles.padded}>
          <Card variant="glass" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="information-circle" size={18} color={colors.text.gold} />
              <Text variant="bodyStrong">¿Cómo funciona?</Text>
            </View>
            <Text variant="small" tone="secondary">
              Visita Casino Atlántico Manatí y juega en cualquiera de las máquinas o mesas
              participantes. Los montos los publica la administración una vez al día y pueden
              variar al momento de tu visita.
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
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
