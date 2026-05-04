import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Card, Chip, Header, Screen, Skeleton, Text } from '@/components/ui';
import { api } from '@/services/api';
import type { MenuCategory, MenuItem } from '@/types/domain';
import { colors, radius, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

const filters: Array<{ key: MenuCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'all', label: 'Todo', icon: 'restaurant' },
  { key: 'entradas', label: 'Entradas', icon: 'fast-food' },
  { key: 'criollo', label: 'Criollo', icon: 'leaf' },
  { key: 'parrilla', label: 'Parrilla', icon: 'flame' },
  { key: 'mariscos', label: 'Mariscos', icon: 'fish' },
  { key: 'bebidas', label: 'Bebidas', icon: 'wine' },
  { key: 'postres', label: 'Postres', icon: 'ice-cream' },
];

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MenuCategory | 'all'>('all');

  useEffect(() => {
    api.getMenu().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  return (
    <Screen>
      <Header title="Menú Criollo" subtitle="Cocina puertorriqueña en Atlántico" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
              count={f.key === 'all' ? items.length : items.filter((i) => i.category === f.key).length}
            />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {loading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} height={84} rounded="lg" />)
            : filtered.map((item, idx) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(idx * 30).duration(280)}>
                  <Card variant="surface" padded={false}>
                    <View style={styles.row}>
                      <View style={styles.thumb}>
                        <Ionicons
                          name={iconFor(item.category)}
                          size={22}
                          color={colors.text.gold}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={styles.titleRow}>
                          <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                            {item.name}
                          </Text>
                          <Text variant="bodyStrong" tone="gold">
                            {formatCurrency(item.price)}
                          </Text>
                        </View>
                        <Text variant="small" tone="muted" numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View style={styles.tagRow}>
                          {item.popular ? <Badge label="Popular" tone="hot" /> : null}
                          {item.spicy ? <Badge label="Picante" tone="warning" /> : null}
                          {item.vegetarian ? <Badge label="Vegetariano" tone="success" /> : null}
                        </View>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))}
          {!loading && filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text tone="muted">No hay platos en esta categoría todavía.</Text>
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text variant="caption" tone="muted" align="center">
            Los precios y disponibilidad pueden cambiar. Consulta con el restaurante.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const iconFor = (cat: MenuCategory): keyof typeof Ionicons.glyphMap => {
  switch (cat) {
    case 'entradas':
      return 'fast-food';
    case 'criollo':
      return 'leaf';
    case 'parrilla':
      return 'flame';
    case 'mariscos':
      return 'fish';
    case 'bebidas':
      return 'wine';
    case 'postres':
      return 'ice-cream';
  }
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
    gap: spacing.lg,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,201,122,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
});
