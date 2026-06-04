import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Text as RNText, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MachineEditSheet } from '@/components/slotfloor/MachineEditSheet';
import { StatCard } from '@/components/dashboard/StatCard';
import { HBars, type HBarItem } from '@/components/dashboard/HBars';
import { Donut, type DonutItem } from '@/components/dashboard/Donut';
import { DetailTable } from '@/components/dashboard/DetailTable';
import { C, card, money, compactMoney, mfrColor } from '@/components/dashboard/shared';
import type { CoinInPeriod, SlotMachine } from '@/types/domain';

const PERIODS: { key: CoinInPeriod; label: string; reportLabel: string }[] = [
  { key: 'ytd',        label: 'YTD',        reportLabel: 'Año en Curso' },
  { key: 'semiannual', label: '6 Meses',    reportLabel: 'Últimos 6 Meses' },
  { key: 'quarterly',  label: 'Trimestre',  reportLabel: 'Trimestre Actual' },
  { key: 'mtd',        label: 'Mes',        reportLabel: 'Mes en Curso' },
  { key: 'annual',     label: 'Anual',      reportLabel: 'Últimos 12 Meses' },
];

function windowFor(period: CoinInPeriod): { from: string; to: string; days: number } {
  const today = new Date();
  const d = new Date(today);
  switch (period) {
    case 'mtd':        d.setDate(1); break;
    case 'quarterly':  d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1); break;
    case 'semiannual': d.setMonth(d.getMonth() - 6); break;
    case 'annual':     d.setFullYear(d.getFullYear() - 1); break;
    default:           d.setMonth(0, 1); break;
  }
  const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  const from = iso(d), to = iso(today);
  const days = Math.max(Math.round((today.getTime() - d.getTime()) / 86400000), 1);
  return { from, to, days };
}

export default function DashboardScreen() {
  const [period, setPeriod] = useState<CoinInPeriod>('ytd');
  const [editMachine, setEditMachine] = useState<SlotMachine | null>(null);

  const init        = useSlotFloorStore(s => s.init);
  const initialized = useSlotFloorStore(s => s.initialized);
  const machines    = useSlotFloorStore(s => s.machines);
  const coinIn      = useSlotFloorStore(s => s.coinIn);
  const changes     = useSlotFloorStore(s => s.machineChanges);
  const floorStats  = useSlotFloorStore(s => s.floorStats);
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const profile     = useAuthStore(s => s.profile);
  const signOut     = useAuthStore(s => s.signOut);

  useEffect(() => { init(); }, [init]);

  const reportLabel = PERIODS.find(p => p.key === period)?.reportLabel ?? '';

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const { from, to, days } = windowFor(period);

    let totalCoin = 0;
    const coinByMfr  = new Map<string, number>();
    const idToMfr    = new Map(machines.map(m => [m.id, m.manufacturer]));
    for (const e of coinIn) {
      if (e.date < from || e.date > to) continue;
      totalCoin += e.amount;
      const mfr = idToMfr.get(e.machineId);
      if (mfr) coinByMfr.set(mfr, (coinByMfr.get(mfr) ?? 0) + e.amount);
    }

    const total       = machines.length;
    const avgPerMach  = total ? totalCoin / total : 0;
    const dailyPerMach = total && days ? totalCoin / total / days : 0;
    const bankCount   = new Set(machines.map(m => m.location.split('-')[0])).size;

    // manufacturer bars (by coin-in, desc)
    const mfrBars: HBarItem[] = Array.from(coinByMfr.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, val], idx) => ({
        key: name, label: name.replace('Light & Wonder', 'L&W'),
        value: val, display: money(val), color: C.navy,
      }));

    // top banks (gold bars)
    const banks = getBankGroups(period);
    const bankBars: HBarItem[] = banks.slice(0, 10).map(b => ({
      key: b.bank, label: `Banco ${b.bank}`,
      value: b.totalCoinIn, display: money(b.totalCoinIn), color: C.gold,
    }));

    // distribution donut (machine count by manufacturer)
    const distMap = new Map<string, number>();
    for (const m of machines) distMap.set(m.manufacturer, (distMap.get(m.manufacturer) ?? 0) + 1);
    const dist: DonutItem[] = Array.from(distMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({ label: name, value: count, color: mfrColor(name, idx) }));

    // changes donut
    const changeDist: DonutItem[] = [
      { label: 'Compras',       value: changes.filter(c => c.type === 'compra').length,       color: C.green },
      { label: 'Reubicaciones', value: changes.filter(c => c.type === 'reubicacion').length,  color: C.gold },
      { label: 'Cambios Juego', value: changes.filter(c => c.type === 'cambio_juego').length, color: C.navy3 },
    ];

    return { totalCoin, total, avgPerMach, dailyPerMach, bankCount, mfrBars, bankBars, dist, changeDist, changesTotal: changes.length };
  }, [machines, coinIn, changes, period, getBankGroups]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        {/* top control row */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}><RNText style={styles.logoMarkText}>CA</RNText></View>
            <RNText style={styles.brandText}>Casino Atlántico Manatí</RNText>
          </View>
          <View style={styles.topRight}>
            {profile && (
              <View style={[styles.roleBadge, profile.role === 'admin' ? styles.adminBadge : styles.viewerBadge]}>
                <RNText style={[styles.roleText, profile.role === 'admin' ? styles.adminText : styles.viewerText]}>
                  {profile.role.toUpperCase()}
                </RNText>
              </View>
            )}
            <Pressable onPress={signOut} hitSlop={8} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color={C.navy3} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {!initialized ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={C.gold} />
          <RNText style={styles.loadingText}>Cargando datos...</RNText>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* ── Title block ─────────────────────────────────────────────── */}
          <View style={styles.titleBlock}>
            <View style={styles.titleLeft}>
              <RNText style={styles.title}>Slot Floor Analytics</RNText>
              <RNText style={styles.subtitle}>Panel Ejecutivo de Performance de Máquinas</RNText>
            </View>
            <View style={styles.periodLabel}>
              <RNText style={styles.periodLabelCap}>PERÍODO DE REPORTE</RNText>
              <RNText style={styles.periodLabelVal}>{reportLabel}</RNText>
            </View>
          </View>
          <View style={styles.divider} />

          {/* ── Period selector ─────────────────────────────────────────── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodBar}>
            {PERIODS.map(p => {
              const active = p.key === period;
              return (
                <Pressable key={p.key} style={[styles.chip, active && styles.chipActive]} onPress={() => setPeriod(p.key)}>
                  <RNText style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</RNText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ── KPI grid (2×2) ──────────────────────────────────────────── */}
          <View style={styles.kpiRow}>
            <StatCard
              label="Total de Máquinas"
              value={String(metrics.total)}
              pillText={`${metrics.bankCount} Bancos Activos`}
              pillTone="neutral"
            />
            <StatCard
              label="Avg Coin-In / Máq."
              value={money(metrics.avgPerMach)}
              pillText={`Diario: ${money(metrics.dailyPerMach)}`}
              pillTone="positive"
            />
          </View>
          <View style={styles.kpiRow}>
            <StatCard
              label="Coin-In Total"
              value={compactMoney(metrics.totalCoin)}
              pillText={`${money(metrics.totalCoin)}`}
              pillTone="neutral"
            />
            <StatCard
              label="Cambios de Juego"
              value={String(metrics.changesTotal)}
              pillText={`${metrics.dist.length} Fabricantes`}
              pillTone="gold"
            />
          </View>

          {/* ── Performance por Fabricante ──────────────────────────────── */}
          <View style={card.base}>
            <View style={card.titleRow}>
              <View style={card.accent} />
              <RNText style={card.title}>Performance por Fabricante</RNText>
            </View>
            {metrics.mfrBars.length ? <HBars data={metrics.mfrBars} barColor={C.navy} />
              : <RNText style={styles.empty}>Sin datos para este período</RNText>}
          </View>

          {/* ── Top 10 Bancos ───────────────────────────────────────────── */}
          <View style={card.base}>
            <View style={card.titleRow}>
              <View style={card.accent} />
              <RNText style={card.title}>Top 10 Bancos por Coin-In</RNText>
            </View>
            {metrics.bankBars.length ? <HBars data={metrics.bankBars} barColor={C.gold} />
              : <RNText style={styles.empty}>Sin datos para este período</RNText>}
          </View>

          {/* ── Distribución de Máquinas ────────────────────────────────── */}
          <View style={card.base}>
            <View style={card.titleRow}>
              <View style={card.accent} />
              <RNText style={card.title}>Distribución de Máquinas</RNText>
            </View>
            {metrics.dist.length ? <Donut data={metrics.dist} />
              : <RNText style={styles.empty}>Sin datos</RNText>}
          </View>

          {/* ── Análisis de Cambios ─────────────────────────────────────── */}
          <View style={card.base}>
            <View style={card.titleRow}>
              <View style={card.accent} />
              <RNText style={card.title}>Análisis de Cambios 2024 → 2025</RNText>
            </View>
            {metrics.changesTotal ? <Donut data={metrics.changeDist} />
              : <RNText style={styles.empty}>Sin registros de cambios</RNText>}
          </View>

          {/* ── Detail tabbed table ─────────────────────────────────────── */}
          <DetailTable period={period} onEditMachine={setEditMachine} />

          <RNText style={styles.footer}>Casino Atlántico Manatí · Operaciones de Piso</RNText>
        </ScrollView>
      )}

      <MachineEditSheet
        machine={editMachine}
        visible={editMachine !== null}
        onClose={() => setEditMachine(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.page },

  topSafe: { backgroundColor: C.card },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 30, height: 30, borderRadius: 9, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText: { fontSize: 12, fontWeight: '800', color: C.gold, letterSpacing: 0.5 },
  brandText: { fontSize: 13, fontWeight: '600', color: C.navy3 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  roleBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadge: { backgroundColor: '#f6ecdd', borderWidth: 1, borderColor: C.gold },
  viewerBadge: { backgroundColor: '#eef1f5' },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  adminText: { color: C.gold },
  viewerText: { color: C.navy3 },
  logoutBtn: { padding: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 48 },

  titleBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  titleLeft: { flex: 1 },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 32,
    fontWeight: '900',
    color: C.ink,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: C.navy3, marginTop: 4 },
  periodLabel: { alignItems: 'flex-end' },
  periodLabelCap: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.6 },
  periodLabelVal: { fontSize: 14, fontWeight: '700', color: C.ink, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 2 },

  periodBar: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.navy, borderColor: C.navy },
  chipText: { fontSize: 13, fontWeight: '600', color: C.muted },
  chipTextActive: { color: '#ffffff' },

  kpiRow: { flexDirection: 'row', gap: 14 },

  empty: { fontSize: 14, color: C.faint, textAlign: 'center', paddingVertical: 24 },
  footer: { fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 8 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.muted },
});
