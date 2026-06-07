import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { C } from './shared';

export type TabItem = { key: string; label: string };

type Props = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  gutter?: number;
};

export function SegmentedTabs({ tabs, active, onChange, gutter = 16 }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}
      >
        {tabs.map(tab => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChange(tab.key)}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: C.page,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.navy,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: C.navy,
    fontWeight: '700',
  },
});
