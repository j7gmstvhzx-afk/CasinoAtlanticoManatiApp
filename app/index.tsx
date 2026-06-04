import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Text as RNText, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MachineEditSheet } from '@/components/slotfloor/MachineEditSheet';
import { TopMachinesTab }  from '@/components/slotfloor/tabs/TopMachinesTab';
import { BankRankingTab }  from '@/components/slotfloor/tabs/BankRankingTab';
import { AllBanksTab }     from '@/components/slotfloor/tabs/AllBanksTab';
import { ManufacturerTab } from '@/components/slotfloor/tabs/ManufacturerTab';
import { AllMachinesTab }  from '@/components/slotfloor/tabs/AllMachinesTab';
import { GameChangesTab }  from '@/components/slotfloor/tabs/GameChangesTab';
import { ComparisonTab }   from '@/components/slotfloor/tabs/ComparisonTab';
import { BestChangesTab }  from '@/components/slotfloor/tabs/BestChangesTab';
import type { SlotMachine } from '@/types/domain';

const NAVY = '#1a2332';
const GOLD = '#d4a574';
const TEAL = '#2a9d8f';

const TABS = [
  { label: 'Top 20 Máquinas',    Component: TopMachinesTab },
  { label: 'Ranking de Bancos',  Component: BankRankingTab },
  { label: 'Todos los Bancos',   Component: AllBanksTab },
  { label: 'Fabricantes',        Component: ManufacturerTab },
  { label: 'Todas las Máquinas', Component: AllMachinesTab },
  { label: 'Cambios',            Component: GameChangesTab },
  { label: 'Comparativa',        Component: ComparisonTab },
  { label: 'Mejores Cambios',    Component: BestChangesTab },
];

export default function OperationsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [editMachine, setEditMachine] = useState<SlotMachine | null>(null);
  const init        = useSlotFloorStore(s => s.init);
  const initialized = useSlotFloorStore(s => s.initialized);
  const machines    = useSlotFloorStore(s => s.machines);
  const profile     = useAuthStore(s => s.profile);
  const signOut     = useAuthStore(s => s.signOut);

  useEffect(() => { init(); }, [init]);

  const { Component: ActiveTab } = TABS[activeIndex];

  return (
    <View style={styles.root}>
      {/* ── Header (navy) ─────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <View>
            <RNText style={styles.headerTitle}>Piso de Máquinas</RNText>
            <RNText style={styles.headerSub}>Casino Atlántico Manatí</RNText>
          </View>
          <View style={styles.headerRight}>
            {machines.length > 0 && (
              <View style={styles.machineCount}>
                <RNText style={styles.machineCountText}>{machines.length} máqs.</RNText>
              </View>
            )}
            {profile && (
              <View style={[styles.roleBadge, profile.role === 'admin' ? styles.adminBadge : styles.viewerBadge]}>
                <RNText style={[styles.roleText, profile.role === 'admin' ? styles.adminText : styles.viewerText]}>
                  {profile.role.toUpperCase()}
                </RNText>
              </View>
            )}
            <Pressable onPress={signOut} hitSlop={8} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.80)" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <View style={styles.tabBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarInner}
        >
          {TABS.map((tab, i) => {
            const active = i === activeIndex;
            return (
              <Pressable key={i} style={styles.tab} onPress={() => setActiveIndex(i)}>
                <RNText style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </RNText>
                {active && <View style={styles.tabIndicator} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {!initialized ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={TEAL} />
            <RNText style={styles.loadingText}>Cargando datos...</RNText>
          </View>
        ) : (
          <ActiveTab onEditMachine={setEditMachine} />
        )}
      </View>

      {/* ── Edit Sheet ─────────────────────────────────────────────────── */}
      <MachineEditSheet
        machine={editMachine}
        visible={editMachine !== null}
        onClose={() => setEditMachine(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f4f8' },

  // Header
  header: { backgroundColor: NAVY },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: GOLD,
    marginTop: 2,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  machineCount:    { backgroundColor: 'rgba(212,165,116,0.20)', borderWidth: 1, borderColor: 'rgba(212,165,116,0.40)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  machineCountText:{ fontSize: 12, color: GOLD, fontWeight: '700' },
  roleBadge:       { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadge:      { backgroundColor: 'rgba(212,165,116,0.25)', borderWidth: 1.5, borderColor: GOLD },
  viewerBadge:     { backgroundColor: 'rgba(255,255,255,0.12)' },
  roleText:        { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  adminText:       { color: GOLD },
  viewerText:      { color: 'rgba(255,255,255,0.75)' },
  logoutBtn:       { padding: 4 },

  // Tab bar
  tabBarWrap: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabBarInner: { paddingHorizontal: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 13, alignItems: 'center', position: 'relative' },
  tabText:       { fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  tabTextActive: { color: NAVY, fontWeight: '700' },
  tabIndicator:  { position: 'absolute', bottom: 0, left: 6, right: 6, height: 3, backgroundColor: GOLD, borderRadius: 1.5 },

  // Content
  content:     { flex: 1 },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#94a3b8' },
});
