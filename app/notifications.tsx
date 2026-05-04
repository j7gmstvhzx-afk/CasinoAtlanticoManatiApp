import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Header, Screen, Text } from '@/components/ui';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import type { AppNotification } from '@/types/domain';
import { colors, radius, spacing } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

const iconFor: Record<AppNotification['kind'], keyof typeof Ionicons.glyphMap> = {
  jackpot: 'diamond',
  promo: 'gift',
  event: 'calendar',
  system: 'information-circle',
};

const tintFor: Record<AppNotification['kind'], string> = {
  jackpot: '#F5C97A',
  promo: '#E5484D',
  event: '#6EA0E6',
  system: '#7B86A8',
};

export default function NotificationsScreen() {
  const items = useNotificationsStore((s) => s.items);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unread = useNotificationsStore((s) => s.unread);

  return (
    <Screen>
      <Header
        title="Notificaciones"
        subtitle={unread > 0 ? `${unread} sin leer` : 'Todo al día'}
        showBack
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unread > 0 ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Button label="Marcar todas como leídas" variant="outline" onPress={markAllRead} />
          </View>
        ) : null}

        <View style={styles.list}>
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={36} color={colors.text.muted} />
              <Text variant="body" tone="muted" align="center">
                No tienes notificaciones todavía.
              </Text>
            </View>
          ) : (
            items.map((n, idx) => (
              <Animated.View
                key={n.id}
                entering={FadeInDown.delay(idx * 50).duration(280)}
                style={[styles.item, !n.read && styles.itemUnread]}
              >
                <View style={[styles.icon, { backgroundColor: `${tintFor[n.kind]}20`, borderColor: `${tintFor[n.kind]}40` }]}>
                  <Ionicons name={iconFor[n.kind]} size={18} color={tintFor[n.kind]} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{n.title}</Text>
                  <Text variant="small" tone="secondary">
                    {n.body}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {formatRelativeTime(n.createdAt)}
                  </Text>
                </View>
                {!n.read ? <View style={styles.dot} /> : null}
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 60,
    gap: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  itemUnread: {
    borderColor: colors.border.gold,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.gold,
    marginTop: 6,
  },
  empty: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
});
