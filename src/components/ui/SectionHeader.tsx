import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, caption, actionLabel, onAction }: Props) {
  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        <Text variant="h2">{title}</Text>
        {caption ? (
          <Text variant="small" tone="muted" style={{ marginTop: 2 }}>
            {caption}
          </Text>
        ) : null}
      </View>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={10} style={styles.action}>
          <Text variant="bodyStrong" tone="gold">
            {actionLabel ?? 'Ver más'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.text.gold} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
