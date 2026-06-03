import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { SlotMachine } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, fmtDeno, type TabProps } from './shared';

export function AllBanksTab({ onEditMachine }: TabProps) {
  const machines = useSlotFloorStore(s => s.machines);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Group machines by bank
  const bankMap = new Map<string, SlotMachine[]>();
  for (const m of machines) {
    const bank = m.location.split('-')[0];
    if (!bankMap.has(bank)) bankMap.set(bank, []);
    bankMap.get(bank)!.push(m);
  }
  const banks = Array.from(bankMap.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  const toggle = (bank: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(bank) ? next.delete(bank) : next.add(bank);
      return next;
    });
  };

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
      <View style={tabStyles.kpiGrid}>
        <View style={tabStyles.kpiCard}>
          <Text style={tabStyles.kpiLabel}>Bancos</Text>
          <Text style={tabStyles.kpiValue}>{banks.length}</Text>
        </View>
        <View style={tabStyles.kpiCard}>
          <Text style={tabStyles.kpiLabel}>Total Máquinas</Text>
          <Text style={tabStyles.kpiValue}>{machines.length}</Text>
        </View>
        <View style={tabStyles.kpiCard}>
          <Text style={tabStyles.kpiLabel}>Activas</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>
            {machines.filter(m => m.active).length}
          </Text>
        </View>
      </View>

      {banks.map(([bank, macs]) => {
        const isOpen  = expanded.has(bank);
        const active  = macs.filter(m => m.active).length;
        return (
          <View key={bank} style={tabStyles.card}>
            {/* Bank header */}
            <Pressable style={styles.bankHeader} onPress={() => toggle(bank)}>
              <View style={styles.bankLeft}>
                <View style={[styles.bankDot, { backgroundColor: isOpen ? NAVY : GOLD }]} />
                <Text style={styles.bankTitle}>Banco {bank}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{macs.length}</Text>
                </View>
              </View>
              <View style={styles.bankRight}>
                <Text style={styles.activeText}>{active} activas</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {/* Machine list */}
            {isOpen && (
              <View style={styles.machineList}>
                {/* Mini table header */}
                <View style={[styles.miniRow, styles.miniHeader]}>
                  <Text style={[styles.miniMc,   styles.miniHeaderText]}>MC</Text>
                  <Text style={[styles.miniGame,  styles.miniHeaderText]}>Juego</Text>
                  <Text style={[styles.miniDeno,  styles.miniHeaderText]}>Deno</Text>
                  <Text style={[styles.miniStatus,styles.miniHeaderText]}>Estado</Text>
                </View>
                {macs.map((m, i) => (
                  <Pressable
                    key={m.id}
                    style={[styles.miniRow, i === macs.length - 1 && styles.miniLast]}
                    onPress={() => onEditMachine(m)}
                  >
                    <Text style={[styles.miniMc, styles.miniMcText]}>{m.id}</Text>
                    <Text style={[styles.miniGame, styles.miniGameText]} numberOfLines={1}>{m.game}</Text>
                    <Text style={[styles.miniDeno, styles.miniDenoText]}>{fmtDeno(m.denomination)}</Text>
                    <View style={[styles.miniStatus, styles.statusDot, { backgroundColor: m.active ? '#dcfce7' : '#fee2e2' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: m.active ? '#16a34a' : '#dc2626' }}>
                        {m.active ? 'ACTIVA' : 'INACT.'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bankRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bankDot:   { width: 10, height: 10, borderRadius: 5 },
  bankTitle: { fontSize: 15, fontWeight: '700', color: NAVY },
  countBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText:  { fontSize: 11, fontWeight: '600', color: '#64748b' },
  activeText: { fontSize: 12, color: '#64748b' },
  machineList: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 4 },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    gap: 4,
  },
  miniHeader:     { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6, marginBottom: 2 },
  miniLast:       { borderBottomWidth: 0 },
  miniHeaderText: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },
  miniMc:         { width: 48 },
  miniGame:       { flex: 1 },
  miniDeno:       { width: 40, textAlign: 'center' },
  miniStatus:     { width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 4, paddingVertical: 2 },
  miniMcText:     { fontSize: 11, fontWeight: '600', color: NAVY, fontFamily: 'monospace' },
  miniGameText:   { fontSize: 11, color: '#2d3e50' },
  miniDenoText:   { fontSize: 11, color: '#64748b', textAlign: 'center' },
  statusDot:      {},
});
