import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Pressable, ScrollView,
  StyleSheet, Switch, Text as RNText, TextInput, View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlotFloorStore, useActiveMachines } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui';
import { MachineEditSheet } from '@/components/slotfloor/MachineEditSheet';
import { StatCard } from '@/components/dashboard/StatCard';
import { HBars, type HBarItem } from '@/components/dashboard/HBars';
import { Donut, type DonutItem } from '@/components/dashboard/Donut';
import { SegmentedTabs } from '@/components/dashboard/SegmentedTabs';
import { BankBrowser } from '@/components/dashboard/BankBrowser';
import { Comparativa2025 } from '@/components/dashboard/Comparativa2025';
import { FloorHeatmap } from '@/components/dashboard/FloorHeatmap';
import { MachineRow } from '@/components/dashboard/MachineRow';
import { C, CHIP_BLUE, card, money, mfrColor, shortMfr, bankOf } from '@/components/dashboard/shared';
import { SLOT_FLOOR_2025 } from '@/data/slotFloor2025';
import { generateFloorReport, resolvePeriodLabel } from '@/lib/reportGenerator';
import type { SlotMachine, MachineChange } from '@/types/domain';

type Metric = 'avgCoinIn' | 'avgWin';

const TABS = [
  { key: 'resumen',      label: 'Resumen' },
  { key: 'plano',        label: 'Plano' },
  { key: 'bancos',       label: 'Bancos' },
  { key: 'comparativa',  label: 'Comparativa vs 2025' },
  { key: 'fabricantes',  label: 'Fabricantes' },
  { key: 'apuestas',     label: 'Apuestas' },
  { key: 'cambios',      label: 'Cambios' },
];

const CHANGE_LABELS: Record<string, string> = {
  compra:       'Compra',
  reubicacion:  'Reubicación',
  cambio_juego: 'Cambio de Juego',
  removida:     'Removida',
};
const CHANGE_COLORS: Record<string, string> = {
  compra:       C.green,
  reubicacion:  C.gold,
  cambio_juego: C.navy3,
  removida:     C.red,
};

// ── Floor health (Resumen hero card) ──────────────────────────────────────────
//
// Answers "¿cómo va el piso?" in one glance: score = % of comparable machines
// (position has 2025 data AND current data exists) whose active-metric delta
// vs 2025 is better than −15%. Alert banks = banks whose aggregate delta
// dropped more than 20%.

function computeFloorHealth(machines: SlotMachine[], metric: Metric) {
  const pick = (m: { avgCoinIn?: number | null; avgWin?: number | null }) =>
    metric === 'avgWin' ? m.avgWin ?? 0 : m.avgCoinIn ?? 0;

  let comparable = 0, healthy = 0, nowSum = 0, thenSum = 0;
  const bankNow = new Map<string, number>();
  const bankThen = new Map<string, number>();

  for (const m of machines) {
    const ref = SLOT_FLOOR_2025[m.location];
    if (!ref || m.avgCoinIn == null || m.avgWin == null) continue;
    const now = pick(m), then = pick(ref);
    comparable++;
    nowSum += now; thenSum += then;
    if (then === 0 || (now - then) / then >= -0.15) healthy++;
    const bank = bankOf(m.location);
    bankNow.set(bank, (bankNow.get(bank) ?? 0) + now);
    bankThen.set(bank, (bankThen.get(bank) ?? 0) + then);
  }
  if (comparable === 0) return null;

  let alertBanks = 0;
  for (const [bank, then] of bankThen) {
    if (then > 0 && ((bankNow.get(bank) ?? 0) - then) / then < -0.20) alertBanks++;
  }

  return {
    score: Math.round((healthy / comparable) * 100),
    deltaPct: thenSum > 0 ? ((nowSum - thenSum) / thenSum) * 100 : 0,
    alertBanks,
    comparable,
  };
}

function FloorHealthCard({ metric }: { metric: Metric }) {
  const machines = useActiveMachines();
  const health = useMemo(() => computeFloorHealth(machines, metric), [machines, metric]);
  if (!health) return null;

  const tone = health.score >= 90 ? C.green : health.score >= 70 ? '#b45309' : C.red;
  const toneBg = health.score >= 90 ? C.greenBg : health.score >= 70 ? '#fdf6ec' : C.redBg;
  const statusLabel = health.score >= 90 ? 'Saludable' : health.score >= 70 ? 'Atención' : 'Crítico';
  const deltaUp = health.deltaPct >= 0;

  return (
    <View style={[styles.healthCard, { borderLeftColor: tone }]}>
      <View style={[styles.healthScoreBox, { backgroundColor: toneBg }]}>
        <RNText style={[styles.healthScore, { color: tone }]}>{health.score}</RNText>
        <RNText style={[styles.healthScoreSub, { color: tone }]}>/100</RNText>
      </View>
      <View style={styles.healthBody}>
        <View style={styles.healthTitleRow}>
          <RNText style={styles.healthTitle}>Salud del Piso</RNText>
          <View style={[styles.healthStatusChip, { backgroundColor: toneBg, borderColor: tone + '55' }]}>
            <RNText style={[styles.healthStatusText, { color: tone }]}>{statusLabel}</RNText>
          </View>
        </View>
        <RNText style={styles.healthDetail}>
          <RNText style={{ color: deltaUp ? C.green : C.red, fontWeight: '800' }}>
            {deltaUp ? '↑' : '↓'} {Math.abs(health.deltaPct).toFixed(1)}%
          </RNText>
          {' '}vs 2025 ({metric === 'avgWin' ? 'Win' : 'Coin-In'})
          {health.alertBanks > 0
            ? <RNText style={{ color: C.red, fontWeight: '700' }}>  ·  ⚠ {health.alertBanks} {health.alertBanks === 1 ? 'banco' : 'bancos'} con caída &gt;20%</RNText>
            : '  ·  sin bancos en alerta'}
        </RNText>
        <RNText style={styles.healthFootnote}>
          % de máquinas comparables sin caída mayor a 15% · {health.comparable} máquinas con dato 2025
        </RNText>
      </View>
    </View>
  );
}

// ── Section: Resumen ──────────────────────────────────────────────────────────

function ResumeSection({ metric, gutter, onOpenBank, onOpenMfr }: {
  metric: Metric; gutter: number;
  onOpenBank: (bank: string) => void;
  onOpenMfr: (mfr: string) => void;
}) {
  const machines = useActiveMachines();
  const floorStats  = useSlotFloorStore(s => s.floorStats);
  const getBankRanking = useSlotFloorStore(s => s.getBankRanking);

  const { best, worst } = getBankRanking(metric);

  const distData: DonutItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of machines) map.set(m.manufacturer, (map.get(m.manufacturer) ?? 0) + 1);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({ label: shortMfr(name), key: name, value: count, color: mfrColor(name, idx) }));
  }, [machines]);

  const bestBars: HBarItem[] = best.map(g => ({
    key:     g.bank,
    label:   `Banco ${g.bank.padStart(2, '0')}`,
    value:   metric === 'avgWin' ? g.avgWin : g.avgCoinIn,
    display: money(metric === 'avgWin' ? g.avgWin : g.avgCoinIn, 0),
    color:   C.green,
  }));
  const worstBars: HBarItem[] = worst.map(g => ({
    key:     g.bank,
    label:   `Banco ${g.bank.padStart(2, '0')}`,
    value:   metric === 'avgWin' ? g.avgWin : g.avgCoinIn,
    display: money(metric === 'avgWin' ? g.avgWin : g.avgCoinIn, 0),
    color:   C.red,
  }));

  const winPctStr = floorStats.winPct.toFixed(1) + '%';
  const bankCount = new Set(machines.map(m => m.location.split('-')[0])).size;

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      {/* Floor health — the 5-second answer */}
      <FloorHealthCard metric={metric} />

      {/* KPI grid — auto-reflows across screen width */}
      <View style={styles.kpiGrid}>
        <StatCard label="Total Máquinas"  value={String(floorStats.active)} icon="grid-outline"        tone="navy"  sub={`${bankCount} bancos en el piso de juego`} />
        <StatCard label="Avg Coin-In PD"  value={money(floorStats.avgCoinIn, 0)} icon="trending-up-outline" tone="teal"  sub="Promedio apostado por máquina al día" />
        <StatCard label="Avg Win PD"      value={money(floorStats.avgWin, 0)}    icon="cash-outline"        tone="green" sub="Ganancia del casino por máquina al día" />
        <StatCard label="Win %"           value={winPctStr} icon="pie-chart-outline"  tone="gold"  sub="Win ÷ Coin-In · retención del casino" />
        <StatCard
          label="Avg WWCJPR PD"
          value={money(floorStats.avgWin * 0.50, 0)}
          icon="wallet-outline"
          tone="red"
          sub="Win neto después de 50% Comisión de Juegos de Puerto Rico (CJPR)"
        />
      </View>

      {/* Best 5 banks */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={card.accent} /><RNText style={card.title}>Top 5 Mejores Bancos</RNText></View>
        <RNText style={styles.chartContext}>Ordenado por {metric === 'avgWin' ? 'Avg Win PD — ganancia promedio del casino por máquina al día' : 'Avg Coin-In PD — promedio apostado por máquina al día'} · toca un banco para ver su detalle</RNText>
        {bestBars.length ? <HBars data={bestBars} onPress={onOpenBank} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      {/* Worst 5 banks */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={[card.accent, { backgroundColor: C.red }]} /><RNText style={card.title}>Top 5 Peores Bancos</RNText></View>
        <RNText style={styles.chartContext}>Ordenado por {metric === 'avgWin' ? 'Avg Win PD — ganancia promedio del casino por máquina al día' : 'Avg Coin-In PD — promedio apostado por máquina al día'} · toca un banco para ver su detalle</RNText>
        {worstBars.length ? <HBars data={worstBars} barColor={C.red} onPress={onOpenBank} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      {/* Manufacturer donut */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={card.accent} /><RNText style={card.title}>Distribución por Fabricante</RNText></View>
        {distData.length ? <Donut data={distData} onSlicePress={onOpenMfr} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      <RNText style={styles.footer}>Casino Atlántico Manatí · Operaciones de Piso</RNText>
    </ScrollView>
  );
}

// ── Section: Plano (floor heatmap) ────────────────────────────────────────────

function PlanoSection({ metric, gutter, onOpenBank }: {
  metric: Metric; gutter: number;
  onOpenBank: (bank: string) => void;
}) {
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const machines      = useSlotFloorStore(s => s.machines);
  const groups        = useMemo(() => getBankGroups(), [machines, getBankGroups]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      <RNText style={styles.sectionIntro}>
        Mapa de calor del piso: cada celda es un banco, coloreado por su{' '}
        <RNText style={{ fontWeight: '700' }}>{metric === 'avgWin' ? 'Avg Win PD' : 'Avg Coin-In PD'}</RNText>{' '}
        en quintiles — de rojo (más bajo) a verde (más alto). Usa el interruptor Coin-In/Win
        del encabezado para cambiar la métrica.
      </RNText>
      <FloorHeatmap groups={groups} metric={metric} onOpenBank={onOpenBank} />
      <RNText style={styles.footer}>Casino Atlántico Manatí · Plano de rendimiento por banco</RNText>
    </ScrollView>
  );
}

// ── Section: Bancos ───────────────────────────────────────────────────────────

type FilterDef = { id: string; label: string; type: 'coinIn' | 'win'; max: number };
const BANK_FILTERS: FilterDef[] = [
  { id: 'ci3000', label: 'CI < $3,000',  type: 'coinIn', max: 3000 },
  { id: 'ci1500', label: 'CI < $1,500',  type: 'coinIn', max: 1500 },
  { id: 'ci1000', label: 'CI < $1,000',  type: 'coinIn', max: 1000 },
  { id: 'win300', label: 'Win < $300',   type: 'win',    max: 300  },
  { id: 'win200', label: 'Win < $200',   type: 'win',    max: 200  },
  { id: 'win100', label: 'Win < $100',   type: 'win',    max: 100  },
];

function BancosSection({ metric, onEdit, gutter, focusBank }: {
  metric: Metric; onEdit: (m: SlotMachine) => void; gutter: number;
  focusBank?: string | null;
}) {
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const machines      = useSlotFloorStore(s => s.machines);
  const groups        = getBankGroups();

  const [filterId, setFilterId] = useState<string | null>(null);
  const activeFilter = BANK_FILTERS.find(f => f.id === filterId) ?? null;

  // Drill-down from Plano/Resumen: clear any filter and scroll to the bank
  // once its card has reported its position.
  const scrollRef = useRef<ScrollView>(null);
  const bankYs    = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!focusBank) return;
    setFilterId(null);
    const t = setTimeout(() => {
      const y = bankYs.current[focusBank];
      if (y != null) scrollRef.current?.scrollTo({ y: Math.max(y + gutter - 12, 0), animated: true });
    }, 300);
    return () => clearTimeout(t);
  }, [focusBank, gutter]);

  const filteredMachines = useMemo(() => {
    if (!activeFilter) return [];
    return [...machines]
      .filter(m => {
        if (!m.active) return false;
        const val = activeFilter.type === 'coinIn' ? (m.avgCoinIn ?? 0) : (m.avgWin ?? 0);
        return val > 0 && val < activeFilter.max;
      })
      .sort((a, b) => {
        const va = activeFilter.type === 'coinIn' ? (a.avgCoinIn ?? 0) : (a.avgWin ?? 0);
        const vb = activeFilter.type === 'coinIn' ? (b.avgCoinIn ?? 0) : (b.avgWin ?? 0);
        return va - vb;
      });
  }, [machines, activeFilter]);

  return (
    <View style={styles.section}>
      {/* Quick-filter chips — always-visible wrapping row */}
      <View style={[styles.filterBar, { paddingHorizontal: gutter }]}>
        <RNText style={styles.filterBarLabel}>Filtrar máquinas:</RNText>
        <View style={styles.filterChipRow}>
          <Pressable
            style={[styles.filterChip, !filterId && styles.filterChipActive]}
            onPress={() => setFilterId(null)}
          >
            <RNText style={[styles.filterChipText, !filterId && styles.filterChipTextActive]}>Todos los bancos</RNText>
          </Pressable>
          {BANK_FILTERS.map(f => (
            <Pressable
              key={f.id}
              style={[styles.filterChip, filterId === f.id && styles.filterChipActive,
                f.type === 'win' ? styles.filterChipWin : styles.filterChipCI,
                filterId === f.id && (f.type === 'win' ? styles.filterChipWinActive : styles.filterChipCIActive),
              ]}
              onPress={() => setFilterId(filterId === f.id ? null : f.id)}
            >
              <RNText style={[styles.filterChipText, filterId === f.id && styles.filterChipTextActive]}>{f.label}</RNText>
            </Pressable>
          ))}
        </View>
      </View>

      {activeFilter ? (
        /* Filtered flat machine list */
        <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
          <View style={styles.filterResultHeader}>
            <RNText style={styles.filterResultTitle}>
              {filteredMachines.length} máquinas con {activeFilter.label}
            </RNText>
            <RNText style={styles.filterResultSub}>
              {activeFilter.type === 'coinIn'
                ? `Avg Coin-In PD (total apostado por máquina al día) menor a ${money(activeFilter.max, 0)}`
                : `Avg Win PD (ganancia del casino por máquina al día) menor a ${money(activeFilter.max, 0)}`}
            </RNText>
          </View>
          <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
            {filteredMachines.map(m => (
              <MachineRow key={m.id} machine={m} onEdit={onEdit} />
            ))}
            {filteredMachines.length === 0 && (
              <RNText style={styles.empty}>No hay máquinas que cumplan con este filtro</RNText>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Normal bank cards view */
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
          <BankBrowser
            groups={groups}
            rankMetric={metric}
            onEdit={onEdit}
            focusBank={focusBank}
            onBankLayout={(bank, y) => { bankYs.current[bank] = y; }}
          />
          <RNText style={styles.footer}>{groups.length} bancos · {groups.reduce((s, g) => s + g.machines.length, 0)} máquinas</RNText>
        </ScrollView>
      )}
    </View>
  );
}

// ── Section: Comparativa vs 2025 ──────────────────────────────────────────────

function ComparativaSection({ metric, gutter }: { metric: Metric; gutter: number }) {
  const machines = useActiveMachines();

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      <Comparativa2025 machines={machines} metric={metric} />
      <RNText style={styles.footer}>Casino Atlántico Manatí · Comparativa de rendimiento por posición vs. snapshot 2025</RNText>
    </ScrollView>
  );
}

// ── Section: Fabricantes ──────────────────────────────────────────────────────

function FabricantesSection({ gutter, highlightMfr }: { gutter: number; highlightMfr?: string | null }) {
  const machines = useActiveMachines();
  const floorStats = useSlotFloorStore(s => s.floorStats);

  const rows = useMemo(() => {
    const total     = machines.length;
    const floorAvgCI = floorStats.avgCoinIn;
    const map = new Map<string, { count: number; totalCoin: number; totalWin: number }>();
    for (const m of machines) {
      const e = map.get(m.manufacturer) ?? { count: 0, totalCoin: 0, totalWin: 0 };
      e.count++;
      e.totalCoin += m.avgCoinIn ?? 0;
      e.totalWin  += m.avgWin   ?? 0;
      map.set(m.manufacturer, e);
    }
    return Array.from(map.entries())
      .map(([mfr, e]) => ({
        mfr,
        count:      e.count,
        sharePct:   total > 0 ? (e.count / total) * 100 : 0,
        avgCoinIn:  e.count ? e.totalCoin / e.count : 0,
        avgWin:     e.count ? e.totalWin  / e.count : 0,
        winPct:     e.totalCoin > 0 ? (e.totalWin / e.totalCoin) * 100 : 0,
        vsFloor:    floorAvgCI > 0 ? ((e.count ? e.totalCoin / e.count : 0) / floorAvgCI) * 100 : 100,
        color:      mfrColor(mfr, 0),
      }))
      .sort((a, b) => b.avgCoinIn - a.avgCoinIn);
  }, [machines, floorStats]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>

      {/* Intro context */}
      <RNText style={styles.sectionIntro}>
        Comparación de rendimiento por fabricante de máquinas tragamonedas. Cada métrica es un
        promedio <RNText style={{ fontWeight: '700' }}>por día, por máquina</RNText> calculado a
        partir de los datos del período actual.
      </RNText>

      {/* Summary strip */}
      <View style={styles.mfrSummaryRow}>
        <View style={styles.mfrSummaryCard}>
          <RNText style={styles.mfrSummaryNum}>{rows.length}</RNText>
          <RNText style={styles.mfrSummaryLabel}>Fabricantes{'\n'}en el Piso</RNText>
        </View>
        <View style={[styles.mfrSummaryCard, { borderLeftColor: rows[0]?.color, borderLeftWidth: 4 }]}>
          <RNText style={[styles.mfrSummaryNum, { color: rows[0]?.color }]}>{rows[0]?.count ?? 0}</RNText>
          <RNText style={styles.mfrSummaryLabel}>Máquinas del{'\n'}líder ({rows[0]?.mfr ?? '—'})</RNText>
        </View>
        <View style={styles.mfrSummaryCard}>
          <RNText style={[styles.mfrSummaryNum, { color: C.green }]}>{money(rows[0]?.avgWin ?? 0, 0)}</RNText>
          <RNText style={styles.mfrSummaryLabel}>Mejor Avg{'\n'}Win PD</RNText>
        </View>
      </View>

      {/* Per-manufacturer cards */}
      {rows.map((r, idx) => {
        const abovePct  = r.vsFloor - 100;
        const fillWidth = Math.min(Math.max(r.vsFloor, 10), 190) / 190;
        return (
          <View key={r.mfr} style={[styles.mfrCard, idx === 0 && styles.mfrCardTop, highlightMfr === r.mfr && styles.mfrCardFocused]}>

            {/* Header: color bar + name + count */}
            <View style={[styles.mfrColorStripe, { backgroundColor: r.color }]} />
            <View style={styles.mfrCardInner}>
              <View style={styles.mfrCardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.mfrCardTitleRow}>
                    <RNText style={styles.mfrCardName}>{r.mfr}</RNText>
                    {idx === 0 && (
                      <View style={styles.mfrTopBadge}>
                        <RNText style={styles.mfrTopBadgeText}>🏆 Mejor CI PD</RNText>
                      </View>
                    )}
                  </View>
                  <RNText style={styles.mfrCardSub}>
                    {r.count} máquinas · {r.sharePct.toFixed(1)}% del piso
                  </RNText>
                </View>
                <View style={styles.mfrRankBadge}>
                  <RNText style={styles.mfrRankNum}>#{idx + 1}</RNText>
                </View>
              </View>

              {/* Four metric blocks */}
              <View style={styles.mfrMetricGrid}>
                <View style={styles.mfrMetricItem}>
                  <RNText style={styles.mfrMetricValue}>{money(r.avgCoinIn, 0)}</RNText>
                  <RNText style={styles.mfrMetricLabel}>Avg Coin-In PD</RNText>
                  <RNText style={styles.mfrMetricNote}>Promedio apostado{'\n'}por máquina al día</RNText>
                </View>
                <View style={[styles.mfrMetricItem, styles.mfrMetricBorder]}>
                  <RNText style={[styles.mfrMetricValue, { color: C.green }]}>{money(r.avgWin, 0)}</RNText>
                  <RNText style={styles.mfrMetricLabel}>Avg Win PD</RNText>
                  <RNText style={styles.mfrMetricNote}>Ganancia del casino{'\n'}por máquina al día</RNText>
                </View>
                <View style={[styles.mfrMetricItem, styles.mfrMetricBorder]}>
                  <RNText style={[styles.mfrMetricValue, { color: C.gold }]}>{money(r.avgWin * 0.50, 0)}</RNText>
                  <RNText style={styles.mfrMetricLabel}>WWCJPR PD</RNText>
                  <RNText style={styles.mfrMetricNote}>Win neto después{'\n'}de 50% CJPR</RNText>
                </View>
                <View style={[styles.mfrMetricItem, styles.mfrMetricBorder]}>
                  <RNText style={[styles.mfrMetricValue, { color: C.navy3 }]}>{r.winPct.toFixed(1)}%</RNText>
                  <RNText style={styles.mfrMetricLabel}>Win %</RNText>
                  <RNText style={styles.mfrMetricNote}>Ganancia ÷ Coin-In{'\n'}(retención del casino)</RNText>
                </View>
              </View>

              {/* vs Floor bar */}
              <View style={styles.mfrBarSection}>
                <View style={styles.mfrBarLabelRow}>
                  <RNText style={styles.mfrBarLabel}>Rendimiento vs. promedio del piso</RNText>
                  <RNText style={[styles.mfrBarDelta, { color: abovePct >= 0 ? C.green : C.red }]}>
                    {abovePct >= 0 ? '+' : ''}{abovePct.toFixed(0)}%
                  </RNText>
                </View>
                <View style={styles.mfrBarTrack}>
                  <View style={[styles.mfrBarFill, { width: `${fillWidth * 100}%` as any, backgroundColor: r.color }]} />
                  <View style={styles.mfrBarMidLine} />
                </View>
                <View style={styles.mfrBarEndLabels}>
                  <RNText style={styles.mfrBarEndLabel}>0%</RNText>
                  <RNText style={styles.mfrBarEndLabel}>Promedio piso</RNText>
                  <RNText style={styles.mfrBarEndLabel}>+90%</RNText>
                </View>
              </View>
            </View>
          </View>
        );
      })}

      <RNText style={styles.footer}>
        Avg Coin-In PD = promedio de lo apostado por máquina en un día · Avg Win PD = ganancia del casino por máquina en un día
      </RNText>
    </ScrollView>
  );
}

// ── Section: Apuestas ─────────────────────────────────────────────────────────

const DENO_LABELS: Record<string, string> = { '0.01': '1¢', '0.05': '5¢', '0.10': '10¢', '0.25': '25¢', '1.00': '$1' };
const DENO_COLORS: Record<string, string> = { '0.01': '#2d6a6a', '0.05': '#2d6a6a', '0.10': '#2d6a6a', '0.25': C.gold, '1.00': C.gold };

function BetKpiCard({ label, value, sub, teal = false }: { label: string; value: string; sub?: string; teal?: boolean }) {
  return (
    <View style={styles.betKpiCard}>
      <RNText style={styles.betKpiLabel}>{label}</RNText>
      <RNText style={[styles.betKpiValue, teal ? styles.betKpiValueTeal : styles.betKpiValueGold]}>{value}</RNText>
      {sub ? <RNText style={styles.betKpiSub}>{sub}</RNText> : null}
    </View>
  );
}

function BetSegCard({ title, count, low, high, avg, teal = false }: {
  title: string; count: number; low: number; high: number; avg: number; teal?: boolean;
}) {
  const accent = teal ? '#2d6a6a' : C.gold;
  return (
    <View style={[styles.betSegCard, { borderLeftColor: accent }]}>
      <RNText style={[styles.betSegTitle, { color: accent }]}>{title}</RNText>
      <View style={styles.betSegRow}>
        <RNText style={styles.betSegKey}>Cantidad de máquinas:</RNText>
        <RNText style={styles.betSegNum}>{count}</RNText>
      </View>
      <View style={styles.betSegRow}>
        <RNText style={styles.betSegKey}>Min Bet más bajo:</RNText>
        <RNText style={[styles.betSegNum, { color: accent }]}>{money(low, 2)}</RNText>
      </View>
      <View style={styles.betSegRow}>
        <RNText style={styles.betSegKey}>Min Bet más alto:</RNText>
        <RNText style={[styles.betSegNum, { color: accent }]}>{money(high, 2)}</RNText>
      </View>
      <View style={styles.betSegRow}>
        <RNText style={styles.betSegKey}>Promedio:</RNText>
        <RNText style={[styles.betSegNum, { color: accent }]}>{money(avg, 2)}</RNText>
      </View>
    </View>
  );
}

function ApuestasSection({ gutter }: { gutter: number }) {
  const machines = useActiveMachines();
  const [betView, setBetView] = useState<'min' | 'max'>('min');
  const [expandedDeno, setExpandedDeno] = useState<string | null>(null);

  const minStats = useMemo(() => {
    const all = machines.map(m => m.minBet).filter(b => typeof b === 'number' && b > 0) as number[];
    if (!all.length) return null;
    const lowest = Math.min(...all);
    const highest = Math.max(...all);
    const avg = all.reduce((s, v) => s + v, 0) / all.length;
    const acc  = machines.filter(m => (m.minBet ?? 0) <= 0.40 && (m.minBet ?? 0) > 0);
    const high = machines.filter(m => (m.minBet ?? 0) >= 0.50);
    const accBets  = acc.map(m => m.minBet as number);
    const highBets = high.map(m => m.minBet as number);
    return {
      lowest, highest, avg,
      accCount: acc.length, accMachines: acc,
      accLow: accBets.length ? Math.min(...accBets) : 0,
      accHigh: accBets.length ? Math.max(...accBets) : 0,
      accAvg: accBets.length ? accBets.reduce((s, v) => s + v, 0) / accBets.length : 0,
      highCount: high.length, highMachines: high,
      highLow: highBets.length ? Math.min(...highBets) : 0,
      highHigh: highBets.length ? Math.max(...highBets) : 0,
      highAvg: highBets.length ? highBets.reduce((s, v) => s + v, 0) / highBets.length : 0,
    };
  }, [machines]);

  const maxStats = useMemo(() => {
    const withBet = machines.filter(m => m.maxBet01 || m.maxBet02 || m.maxBet05 || m.maxBet10);
    const bets = withBet.map(m => Math.max(m.maxBet01 ?? 0, m.maxBet02 ?? 0, m.maxBet05 ?? 0, m.maxBet10 ?? 0));
    if (!bets.length) return null;
    const floorMax = Math.max(...bets);
    const avg = bets.reduce((s, v) => s + v, 0) / bets.length;
    const multiCount  = machines.filter(m => m.multiDeno).length;
    const singleCount = machines.filter(m => !m.multiDeno).length;
    const denoMap = new Map<string, SlotMachine[]>();
    for (const m of machines) {
      const d = m.denomination;
      denoMap.set(d, [...(denoMap.get(d) ?? []), m]);
    }
    const denoBuckets = Array.from(denoMap.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
    return { floorMax, avg, multiCount, singleCount, denoBuckets, topBets: withBet.map((m, i) => ({ m, bet: bets[i] })).sort((a, b) => b.bet - a.bet).slice(0, 20) };
  }, [machines]);

  const topBetBars: HBarItem[] = useMemo(() =>
    (maxStats?.topBets ?? []).map(({ m, bet }) => ({
      key: m.id, label: `${m.id} · ${m.location}`, value: bet, display: money(bet, 2), color: C.navy,
    })), [maxStats]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      {/* Bold view switcher */}
      <View style={styles.betSwitcher}>
        <Pressable
          style={[styles.betSwitchBtn, betView === 'min' && styles.betSwitchBtnActive]}
          onPress={() => setBetView('min')}
        >
          <RNText style={[styles.betSwitchLabel, betView === 'min' && styles.betSwitchLabelActive]}>MIN BET</RNText>
          <RNText style={[styles.betSwitchSub, betView === 'min' && { color: '#fff' }]}>Apuesta Mínima</RNText>
        </Pressable>
        <Pressable
          style={[styles.betSwitchBtn, betView === 'max' && styles.betSwitchBtnActive]}
          onPress={() => setBetView('max')}
        >
          <RNText style={[styles.betSwitchLabel, betView === 'max' && styles.betSwitchLabelActive]}>MAX BET</RNText>
          <RNText style={[styles.betSwitchSub, betView === 'max' && { color: '#fff' }]}>Apuesta Máxima</RNText>
        </Pressable>
      </View>

      {betView === 'min' && minStats && (
        <>
          {/* Hero stats row */}
          <View style={styles.betHeroRow}>
            <View style={[styles.betHeroCard, { backgroundColor: '#eef7f7', borderColor: '#2d6a6a33' }]}>
              <RNText style={styles.betHeroLabel}>MÁS BAJO</RNText>
              <RNText style={[styles.betHeroVal, { color: '#2d6a6a' }]}>{money(minStats.lowest, 2)}</RNText>
            </View>
            <View style={[styles.betHeroCard, styles.betHeroCardCenter]}>
              <RNText style={styles.betHeroLabel}>PROMEDIO</RNText>
              <RNText style={[styles.betHeroVal, { color: C.navy }]}>{money(minStats.avg, 2)}</RNText>
            </View>
            <View style={[styles.betHeroCard, { backgroundColor: '#fdf5e7', borderColor: '#b8863f33' }]}>
              <RNText style={styles.betHeroLabel}>MÁS ALTO</RNText>
              <RNText style={[styles.betHeroVal, { color: '#b8863f' }]}>{money(minStats.highest, 2)}</RNText>
            </View>
          </View>

          {/* Rango visual */}
          <View style={styles.betRangeBar}>
            <RNText style={styles.betRangeLabel}>{money(minStats.lowest, 2)}</RNText>
            <View style={styles.betRangeTrack}>
              <View style={[styles.betRangeFill, { width: `${(minStats.avg / minStats.highest) * 100}%` as any }]} />
              <View style={styles.betRangeMarker} />
            </View>
            <RNText style={styles.betRangeLabel}>{money(minStats.highest, 2)}</RNText>
          </View>

          {/* Segmentos interactivos */}
          <Pressable
            style={[styles.betSegPress, { borderLeftColor: '#2d6a6a' }]}
            onPress={() => setExpandedDeno(expandedDeno === 'acc' ? null : 'acc')}
          >
            <View style={styles.betSegPressHeader}>
              <View>
                <RNText style={[styles.betSegPressTitle, { color: '#2d6a6a' }]}>Accessible Bet · ≤ $0.40</RNText>
                <RNText style={styles.betSegPressSub}>Multi Line y apuestas accesibles</RNText>
              </View>
              <View style={styles.betSegPressRight}>
                <RNText style={[styles.betSegCount, { color: '#2d6a6a' }]}>{minStats.accCount}</RNText>
                <RNText style={styles.betSegCountLabel}>máquinas</RNText>
                <Ionicons name={expandedDeno === 'acc' ? 'chevron-up' : 'chevron-down'} size={16} color="#2d6a6a" />
              </View>
            </View>
            <View style={styles.betSegStats}>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.accLow, 2)}</RNText><RNText style={styles.betStatLab}>Mínimo</RNText></View>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.accAvg, 2)}</RNText><RNText style={styles.betStatLab}>Promedio</RNText></View>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.accHigh, 2)}</RNText><RNText style={styles.betStatLab}>Máximo</RNText></View>
            </View>
          </Pressable>
          {expandedDeno === 'acc' && (
            <View style={styles.betMachineList}>
              {minStats.accMachines.sort((a, b) => a.minBet - b.minBet).map((m, i) => (
                <View key={m.id} style={[styles.betMachineRow, i % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                  <RNText style={styles.betMcId}>{m.id}</RNText>
                  <RNText style={styles.betMcLoc}>{m.location}</RNText>
                  <RNText style={styles.betMcGame} numberOfLines={1}>{m.game}</RNText>
                  <RNText style={[styles.betMcVal, { color: '#2d6a6a' }]}>{money(m.minBet, 2)}</RNText>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={[styles.betSegPress, { borderLeftColor: C.gold }]}
            onPress={() => setExpandedDeno(expandedDeno === 'high' ? null : 'high')}
          >
            <View style={styles.betSegPressHeader}>
              <View>
                <RNText style={[styles.betSegPressTitle, { color: C.gold }]}>High Bet · $0.50 – $1.00</RNText>
                <RNText style={styles.betSegPressSub}>Easy Bet y apuestas premium</RNText>
              </View>
              <View style={styles.betSegPressRight}>
                <RNText style={[styles.betSegCount, { color: C.gold }]}>{minStats.highCount}</RNText>
                <RNText style={styles.betSegCountLabel}>máquinas</RNText>
                <Ionicons name={expandedDeno === 'high' ? 'chevron-up' : 'chevron-down'} size={16} color={C.gold} />
              </View>
            </View>
            <View style={styles.betSegStats}>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.highLow, 2)}</RNText><RNText style={styles.betStatLab}>Mínimo</RNText></View>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.highAvg, 2)}</RNText><RNText style={styles.betStatLab}>Promedio</RNText></View>
              <View style={styles.betStatItem}><RNText style={styles.betStatVal}>{money(minStats.highHigh, 2)}</RNText><RNText style={styles.betStatLab}>Máximo</RNText></View>
            </View>
          </Pressable>
          {expandedDeno === 'high' && (
            <View style={styles.betMachineList}>
              {minStats.highMachines.sort((a, b) => a.minBet - b.minBet).map((m, i) => (
                <View key={m.id} style={[styles.betMachineRow, i % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                  <RNText style={styles.betMcId}>{m.id}</RNText>
                  <RNText style={styles.betMcLoc}>{m.location}</RNText>
                  <RNText style={styles.betMcGame} numberOfLines={1}>{m.game}</RNText>
                  <RNText style={[styles.betMcVal, { color: C.gold }]}>{money(m.minBet, 2)}</RNText>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {betView === 'max' && maxStats && (
        <>
          {/* Hero row */}
          <View style={styles.betHeroRow}>
            <View style={[styles.betHeroCard, { flex: 1.5, backgroundColor: '#f0f4fb', borderColor: C.navy + '33' }]}>
              <RNText style={styles.betHeroLabel}>FLOOR MAX BET</RNText>
              <RNText style={[styles.betHeroVal, { color: C.navy, fontSize: 36 }]}>{money(maxStats.floorMax, 2)}</RNText>
              <RNText style={styles.betHeroSub}>Apuesta más alta disponible</RNText>
            </View>
            <View style={[styles.betHeroCard, { backgroundColor: '#eef7f7', borderColor: '#2d6a6a33' }]}>
              <RNText style={styles.betHeroLabel}>PROMEDIO</RNText>
              <RNText style={[styles.betHeroVal, { color: '#2d6a6a' }]}>{money(maxStats.avg, 2)}</RNText>
              <RNText style={styles.betHeroSub}>Por máquina</RNText>
            </View>
          </View>

          {/* Multi/Single deno */}
          <View style={styles.kpiRow}>
            <View style={styles.denoStatCard}>
              <RNText style={styles.denoStatNum}>{maxStats.multiCount}</RNText>
              <RNText style={styles.denoStatLabel}>Multi-Denominación</RNText>
              <RNText style={styles.denoStatSub}>Ofrecen múltiples opciones de denom.</RNText>
            </View>
            <View style={styles.denoStatCard}>
              <RNText style={styles.denoStatNum}>{maxStats.singleCount}</RNText>
              <RNText style={styles.denoStatLabel}>Denominación Fija</RNText>
              <RNText style={styles.denoStatSub}>Solo una denominación disponible</RNText>
            </View>
          </View>

          {/* Denominaciones — interactive tiles */}
          <View style={styles.denoTileRow}>
            {maxStats.denoBuckets.map(([deno, mList]) => (
              <Pressable
                key={deno}
                style={[styles.denoTile, { borderColor: (DENO_COLORS[deno] ?? C.navy3) + '55' },
                  expandedDeno === deno && { borderColor: DENO_COLORS[deno] ?? C.navy3, borderWidth: 2 }]}
                onPress={() => setExpandedDeno(expandedDeno === deno ? null : deno)}
              >
                <View style={[styles.denoTileBadge, { backgroundColor: DENO_COLORS[deno] ?? C.navy3 }]}>
                  <RNText style={styles.denoTileBadgeText}>{DENO_LABELS[deno] ?? deno}</RNText>
                </View>
                <RNText style={styles.denoTileCount}>{mList.length}</RNText>
                <RNText style={styles.denoTileSub}>máquinas</RNText>
                <Ionicons
                  name={expandedDeno === deno ? 'chevron-up' : 'chevron-down'}
                  size={13} color={C.muted} style={{ marginTop: 4 }}
                />
              </Pressable>
            ))}
          </View>

          {/* Expanded deno machine list */}
          {expandedDeno && maxStats.denoBuckets.find(([d]) => d === expandedDeno) && (
            <View style={styles.betMachineList}>
              <View style={styles.betMachineListHeader}>
                <RNText style={styles.betMcHeaderText}>ID · Ubicación · Juego</RNText>
                <RNText style={styles.betMcHeaderText}>Max Bet</RNText>
              </View>
              {(maxStats.denoBuckets.find(([d]) => d === expandedDeno)![1] as SlotMachine[])
                .sort((a, b) => {
                  const ba = Math.max(a.maxBet01 ?? 0, a.maxBet02 ?? 0, a.maxBet05 ?? 0, a.maxBet10 ?? 0);
                  const bb = Math.max(b.maxBet01 ?? 0, b.maxBet02 ?? 0, b.maxBet05 ?? 0, b.maxBet10 ?? 0);
                  return bb - ba;
                })
                .map((m, i) => {
                  const mb = Math.max(m.maxBet01 ?? 0, m.maxBet02 ?? 0, m.maxBet05 ?? 0, m.maxBet10 ?? 0);
                  return (
                    <View key={m.id} style={[styles.betMachineRow, i % 2 === 1 && { backgroundColor: '#f8fafc' }]}>
                      <RNText style={styles.betMcId}>{m.id}</RNText>
                      <RNText style={styles.betMcLoc}>{m.location}</RNText>
                      <RNText style={styles.betMcGame} numberOfLines={1}>{m.game}</RNText>
                      <RNText style={[styles.betMcVal, { color: C.navy }]}>{mb > 0 ? money(mb, 2) : '—'}</RNText>
                    </View>
                  );
                })}
            </View>
          )}

          {/* Top 20 Max Bet chart */}
          <View style={[card.base, { marginTop: 6 }]}>
            <View style={card.titleRow}><View style={card.accent} /><RNText style={card.title}>Top 20 Apuesta Máxima</RNText></View>
            {topBetBars.length ? <HBars data={topBetBars} /> : <RNText style={styles.empty}>Sin datos</RNText>}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ── Section: Cambios ──────────────────────────────────────────────────────────

// Colors come from CHANGE_COLORS so the cards can't drift from the row tags.
const CAMBIOS_KPI_DEFS = [
  { type: 'compra',       icon: 'add-circle-outline'      as const, label: 'Compras' },
  { type: 'reubicacion',  icon: 'swap-horizontal-outline' as const, label: 'Reubicaciones' },
  { type: 'cambio_juego', icon: 'game-controller-outline' as const, label: 'Cambios de Juego' },
  { type: 'removida',     icon: 'remove-circle-outline'   as const, label: 'Removidas' },
];

function CambiosSection({ gutter }: { gutter: number }) {
  const changes = useSlotFloorStore(s => s.machineChanges);

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { type } of CAMBIOS_KPI_DEFS) counts[type] = 0;
    for (const c of changes) if (c.type in counts) counts[c.type]++;
    return counts;
  }, [changes]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      {/* KPI dashboard */}
      {changes.length > 0 && (
        <View style={styles.cambiosKpiGrid}>
          {CAMBIOS_KPI_DEFS.map(({ type, icon, label }) => {
            const color = CHANGE_COLORS[type] ?? C.navy3;
            return (
              <View key={type} style={[styles.cambiosKpiCard, { borderLeftColor: color }]}>
                <View style={[styles.cambiosKpiIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <View style={styles.cambiosKpiBody}>
                  <RNText style={[styles.cambiosKpiCount, { color }]}>{summary[type]}</RNText>
                  <RNText style={styles.cambiosKpiLabel}>{label}</RNText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {changes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="swap-horizontal-outline" size={40} color={C.faint} />
          <RNText style={styles.emptyTitle}>Sin cambios registrados</RNText>
          <RNText style={styles.emptyBody}>Los cambios se registran automáticamente al editar una máquina.</RNText>
        </View>
      ) : (
        <View style={[card.base, { padding: 0, overflow: 'hidden' }]}>
          {changes.map((c, i) => (
            <ChangeRow key={c.id ?? i} change={c} alt={i % 2 === 1} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ChangeRow({ change: c, alt }: { change: MachineChange; alt: boolean }) {
  const color = CHANGE_COLORS[c.type] ?? C.navy3;
  const date  = c.recordedAt ? new Date(c.recordedAt).toLocaleDateString('es-PR') : '—';

  let locationLine: string | null = null;
  if (c.type === 'compra' && c.location2025) {
    locationLine = `→ ${c.location2025}`;
  } else if (c.type === 'reubicacion' && c.location2024 && c.location2025) {
    locationLine = `${c.location2024} → ${c.location2025}`;
  } else if (c.type === 'removida' && c.location2024) {
    locationLine = c.location2024;
  }

  let gameLine: string | null = null;
  if (c.type === 'compra' && c.game2025) {
    gameLine = c.game2025;
  } else if (c.game2024 && c.game2025 && c.game2024 !== c.game2025) {
    gameLine = `${c.game2024} → ${c.game2025}`;
  }

  return (
    <View style={[styles.changeRow, alt && styles.tableRowAlt]}>
      <View style={[styles.changeTypeTag, { backgroundColor: color + '18', borderColor: color + '44' }]}>
        <RNText style={[styles.changeTypeText, { color }]}>{CHANGE_LABELS[c.type] ?? c.type}</RNText>
      </View>
      <View style={styles.changeInfo}>
        <RNText style={styles.changeMcId}>Máquina {c.mc}</RNText>
        {gameLine ? <RNText style={styles.changeDetail} numberOfLines={2}>{gameLine}</RNText> : null}
        {locationLine ? <RNText style={styles.changeLocationLine}>{locationLine}</RNText> : null}
        {c.periodLabel ? <RNText style={styles.changePeriod}>{c.periodLabel}</RNText> : null}
      </View>
      <RNText style={styles.changeDate}>{date}</RNText>
    </View>
  );
}

// ── Global search results ─────────────────────────────────────────────────────

const SEARCH_LIMIT = 50;

function SearchResults({ gutter, onEdit }: { gutter: number; onEdit: (m: SlotMachine) => void }) {
  const query    = useSlotFloorStore(s => s.explorerSearch);
  const machines = useSlotFloorStore(s => s.machines);
  const getFilteredMachines = useSlotFloorStore(s => s.getFilteredMachines);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => getFilteredMachines(), [machines, query]);
  const results = all.slice(0, SEARCH_LIMIT);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      <View style={styles.filterResultHeader}>
        <RNText style={styles.filterResultTitle}>
          {all.length} {all.length === 1 ? 'resultado' : 'resultados'} para “{query.trim()}”
        </RNText>
        <RNText style={styles.filterResultSub}>
          Búsqueda por ID, juego, fabricante o ubicación
          {all.length > SEARCH_LIMIT ? ` · mostrando las primeras ${SEARCH_LIMIT}` : ''}
        </RNText>
      </View>
      <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
        {results.map(m => (
          <MachineRow key={m.id} machine={m} onEdit={onEdit} />
        ))}
        {results.length === 0 && (
          <RNText style={styles.empty}>Sin coincidencias — intenta con el ID, el juego o la ubicación (ej. 09-01)</RNText>
        )}
      </View>
    </ScrollView>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

const SKELETON_TINT = { backgroundColor: C.track };

function DashboardSkeleton({ gutter }: { gutter: number }) {
  return (
    <View style={{ padding: gutter, gap: 14 }}>
      <View style={styles.kpiGrid}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={styles.skelKpi}>
            <Skeleton width={36} height={36} rounded="md" style={SKELETON_TINT} />
            <Skeleton width="70%" height={22} style={SKELETON_TINT} />
            <Skeleton width="50%" height={12} style={SKELETON_TINT} />
          </View>
        ))}
      </View>
      {[0, 1].map(i => (
        <View key={i} style={styles.skelCard}>
          <Skeleton width="40%" height={16} style={SKELETON_TINT} />
          <Skeleton width="100%" height={28} style={SKELETON_TINT} />
          <Skeleton width="85%" height={28} style={SKELETON_TINT} />
          <Skeleton width="70%" height={28} style={SKELETON_TINT} />
        </View>
      ))}
    </View>
  );
}

// ── Root screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [tab, setTab]              = useState('resumen');
  const [metric, setMetric]        = useState<Metric>('avgCoinIn');
  const [editMachine, setEditMachine] = useState<SlotMachine | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [focusBank, setFocusBank]     = useState<string | null>(null);
  const [focusMfr, setFocusMfr]       = useState<string | null>(null);

  const init          = useSlotFloorStore(s => s.init);
  const initialized   = useSlotFloorStore(s => s.initialized);
  const machines      = useActiveMachines();
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const explorerSearch    = useSlotFloorStore(s => s.explorerSearch);
  const setExplorerSearch = useSlotFloorStore(s => s.setExplorerSearch);
  const profile       = useAuthStore(s => s.profile);
  const signOut       = useAuthStore(s => s.signOut);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const gutter    = isDesktop ? 32 : width >= 640 ? 24 : 16;

  useEffect(() => { init(); }, [init]);

  const periodLabel = useMemo(() => resolvePeriodLabel(machines), [machines]);

  const handleGenerateReport = () => {
    generateFloorReport({
      machines,
      bankGroups: getBankGroups(),
      periodLabel,
    });
  };

  // Cross-filtering: charts and the heatmap jump into the relevant tab.
  const openBank = (bank: string) => { setFocusBank(bank); setTab('bancos'); };
  const openMfr  = (mfr: string)  => { setFocusMfr(mfr); setTab('fabricantes'); };
  const handleTabChange = (t: string) => {
    if (t !== 'bancos')      setFocusBank(null);
    if (t !== 'fabricantes') setFocusMfr(null);
    setTab(t);
  };
  const closeSearch = () => { setSearchOpen(false); setExplorerSearch(''); };

  const searching = searchOpen && explorerSearch.trim().length >= 2;
  const showMetricToggle = ['resumen', 'plano', 'bancos', 'comparativa'].includes(tab);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        {/* Top bar — responsive: taller + larger logo on desktop */}
        <View style={[styles.topBar, { paddingHorizontal: gutter, paddingVertical: isDesktop ? 14 : 10 }]}>
          <View style={styles.brandRow}>
            <View style={[styles.logoMark, isDesktop && styles.logoMarkLg]}>
              <View style={[styles.logoChipRing, isDesktop && styles.logoChipRingLg]}>
                <RNText style={[styles.logoMarkText, isDesktop && styles.logoMarkTextLg]}>CA</RNText>
              </View>
            </View>
            <View>
              <RNText style={[styles.brandText, isDesktop && styles.brandTextLg]}>Casino Atlántico Manatí</RNText>
              <View style={styles.periodChip}>
                <Ionicons name="calendar-outline" size={11} color={C.gold} />
                <RNText style={styles.periodChipText}>Período: {periodLabel}</RNText>
              </View>
            </View>
          </View>
          <View style={styles.topRight}>
            <Pressable
              onPress={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              hitSlop={8}
              accessibilityLabel={searchOpen ? 'Cerrar búsqueda' : 'Buscar máquinas'}
              style={[styles.searchBtn, searchOpen && styles.searchBtnActive]}
            >
              <Ionicons name={searchOpen ? 'close' : 'search'} size={18} color={searchOpen ? '#fff' : C.navy3} />
            </Pressable>
            {showMetricToggle && (
              <View style={styles.metricToggle}>
                <RNText style={[styles.metricLabel, metric === 'avgCoinIn' && styles.metricLabelActive]}>Coin-In</RNText>
                <Switch
                  value={metric === 'avgWin'}
                  onValueChange={v => setMetric(v ? 'avgWin' : 'avgCoinIn')}
                  trackColor={{ false: C.navy3 + '55', true: C.green + '88' }}
                  thumbColor={metric === 'avgWin' ? C.green : C.navy3}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <RNText style={[styles.metricLabel, metric === 'avgWin' && styles.metricLabelActive]}>Win</RNText>
              </View>
            )}
            <Pressable onPress={handleGenerateReport} style={styles.reportBtn}>
              <Ionicons name="document-text-outline" size={15} color="#fff" />
              {isDesktop && <RNText style={styles.reportBtnText}>Generar Reporte</RNText>}
            </Pressable>
            {profile && (
              <View style={[styles.roleBadge, profile.role === 'admin' ? styles.adminBadge : styles.viewerBadgeStyle]}>
                <RNText style={[styles.roleText, profile.role === 'admin' ? styles.adminText : styles.viewerText]}>
                  {profile.role.toUpperCase()}
                </RNText>
              </View>
            )}
            <Pressable onPress={signOut} hitSlop={8} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color={C.navy3} />
            </Pressable>
          </View>
        </View>

        {/* Global search bar */}
        {searchOpen && (
          <View style={[styles.searchBar, { paddingHorizontal: gutter }]}>
            <Ionicons name="search" size={16} color={C.muted} />
            <TextInput
              style={styles.searchInput}
              value={explorerSearch}
              onChangeText={setExplorerSearch}
              placeholder="Buscar máquina por ID, juego, fabricante o ubicación (ej. 09-01)…"
              placeholderTextColor={C.faint}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {explorerSearch.length > 0 && (
              <Pressable onPress={() => setExplorerSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={C.muted} />
              </Pressable>
            )}
          </View>
        )}

        {/* Tabs */}
        <SegmentedTabs tabs={TABS} active={tab} onChange={handleTabChange} gutter={gutter} />
      </SafeAreaView>

      {!initialized ? (
        <DashboardSkeleton gutter={gutter} />
      ) : (
        <Animated.View
          key={searching ? 'search' : tab}
          entering={FadeIn.duration(240)}
          style={{ flex: 1 }}
        >
          {searching ? (
            <SearchResults gutter={gutter} onEdit={setEditMachine} />
          ) : (
            <>
              {tab === 'resumen'     && <ResumeSection metric={metric} gutter={gutter} onOpenBank={openBank} onOpenMfr={openMfr} />}
              {tab === 'plano'       && <PlanoSection metric={metric} gutter={gutter} onOpenBank={openBank} />}
              {tab === 'bancos'      && <BancosSection metric={metric} onEdit={setEditMachine} gutter={gutter} focusBank={focusBank} />}
              {tab === 'comparativa' && <ComparativaSection metric={metric} gutter={gutter} />}
              {tab === 'fabricantes' && <FabricantesSection gutter={gutter} highlightMfr={focusMfr} />}
              {tab === 'apuestas'    && <ApuestasSection gutter={gutter} />}
              {tab === 'cambios'     && <CambiosSection gutter={gutter} />}
            </>
          )}
        </Animated.View>
      )}

      <MachineEditSheet
        machine={editMachine}
        visible={editMachine !== null}
        onClose={() => setEditMachine(null)}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.page },
  topSafe:  { backgroundColor: C.card },
  topBar: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor:  C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: CHIP_BLUE,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  logoMarkLg:     { width: 44, height: 44, borderRadius: 22 },
  logoChipRing: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoChipRingLg: { width: 32, height: 32, borderRadius: 16 },
  logoMarkText:   { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  brandText:      { fontSize: 13, fontWeight: '600', color: C.navy3 },
  brandTextLg:    { fontSize: 17, fontWeight: '700', color: C.navy },
  brandSub:       { fontSize: 11, color: C.muted, letterSpacing: 0.3, marginTop: 1 },
  periodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3,
    alignSelf: 'flex-start',
    backgroundColor: '#fdf5e7', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: C.gold + '55',
  },
  periodChipText: { fontSize: 10, fontWeight: '700', color: '#b8863f', letterSpacing: 0.2 },
  logoMarkTextLg: { fontSize: 12 },
  topRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.navy, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  reportBtnText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  metricToggle:   { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metricLabel:    { fontSize: 11, fontWeight: '600', color: C.muted },
  metricLabelActive: { color: C.navy, fontWeight: '700' },
  roleBadge:      { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  adminBadge:     { backgroundColor: '#f6ecdd', borderWidth: 1, borderColor: C.gold },
  viewerBadgeStyle: { backgroundColor: '#eef1f5' },
  roleText:       { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  adminText:      { color: C.gold },
  viewerText:     { color: C.navy3 },
  logoutBtn:      { padding: 2 },

  section:        { flex: 1 },
  sectionContent: { padding: 16, gap: 14, paddingBottom: 48 },

  // ── Filter bar (Bancos quick-filter chips) ─────────────────────────────────
  filterBar: {
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  filterBarLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.3,
  },
  filterChipRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  filterChip: {
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: C.page, borderWidth: 1, borderColor: C.border,
  },
  filterChipCI: {
    borderColor: C.navy3 + '55',
  },
  filterChipCIActive: {
    backgroundColor: C.navy, borderColor: C.navy,
  },
  filterChipWin: {
    borderColor: C.green + '55',
  },
  filterChipWinActive: {
    backgroundColor: C.green, borderColor: C.green,
  },
  filterChipActive: {
    backgroundColor: C.navy, borderColor: C.navy,
  },
  filterChipText: {
    fontSize: 12, fontWeight: '600', color: C.muted,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterResultHeader: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, gap: 4,
  },
  filterResultTitle: {
    fontSize: 15, fontWeight: '800', color: C.navy,
  },
  filterResultSub: {
    fontSize: 12, color: C.muted, lineHeight: 17,
  },

  kpiRow:         { flexDirection: 'row', gap: 14 },
  kpiGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  footer:         { fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 8 },
  empty:          { fontSize: 14, color: C.faint, textAlign: 'center', paddingVertical: 24 },

  loading:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:    { fontSize: 14, color: C.muted },

  // ── Floor health card ───────────────────────────────────────────────────────
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 5,
    padding: 16,
  },
  healthScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  healthScore:    { fontSize: 34, fontWeight: '900', letterSpacing: -1.5 },
  healthScoreSub: { fontSize: 13, fontWeight: '700', opacity: 0.7 },
  healthBody:     { flex: 1, gap: 4 },
  healthTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  healthTitle:    { fontSize: 16, fontWeight: '800', color: C.navy, letterSpacing: -0.2 },
  healthStatusChip: {
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  healthStatusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  healthDetail:     { fontSize: 13, color: C.text, lineHeight: 19 },
  healthFootnote:   { fontSize: 10.5, color: C.faint },

  // ── Global search ───────────────────────────────────────────────────────────
  searchBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.page, borderWidth: 1, borderColor: C.border,
  },
  searchBtnActive: {
    backgroundColor: C.navy, borderColor: C.navy,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
    backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.navy,
    paddingVertical: 4,
    ...(({ outlineStyle: 'none' } as any)),
  },

  // ── Loading skeleton ────────────────────────────────────────────────────────
  skelKpi: {
    flexGrow: 1, flexBasis: 200,
    backgroundColor: C.card, borderRadius: 16, padding: 20, gap: 10,
    borderWidth: 1, borderColor: C.border,
  },
  skelCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 20, gap: 12,
    borderWidth: 1, borderColor: C.border,
  },


  // ── Apuestas sub-tabs ─────────────────────────────────────────────────────
  betTabRow: {
    flexDirection: 'row', backgroundColor: C.card,
    borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  betTab: {
    flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center',
  },
  betTabActive: { backgroundColor: C.navy },
  betTabText: { fontSize: 13, fontWeight: '600', color: C.muted },
  betTabTextActive: { color: '#fff' },

  // ── Apuestas redesign ────────────────────────────────────────────────────
  betSwitcher: {
    flexDirection: 'row', gap: 12,
  },
  betSwitchBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card, padding: 16, alignItems: 'center', gap: 4,
  },
  betSwitchBtnActive: {
    backgroundColor: C.navy, borderColor: C.navy,
  },
  betSwitchLabel: {
    fontSize: 13, fontWeight: '900', color: C.muted, letterSpacing: 1.5,
  },
  betSwitchLabelActive: { color: '#fff' },
  betSwitchSub: {
    fontSize: 11, color: C.faint,
  },

  betHeroRow: { flexDirection: 'row', gap: 12 },
  betHeroCard: {
    flex: 1, borderRadius: 16, borderWidth: 1, padding: 18, gap: 6,
    backgroundColor: '#f5f8fc', borderColor: C.border,
  },
  betHeroCardCenter: {
    backgroundColor: '#f5f8fc', borderColor: C.border,
  },
  betHeroLabel: {
    fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 1,
  },
  betHeroVal: {
    fontSize: 30, fontWeight: '900', letterSpacing: -1, color: C.navy,
  },
  betHeroSub: { fontSize: 11, color: C.muted },

  betRangeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  betRangeLabel: { fontSize: 12, fontWeight: '700', color: C.navy3 },
  betRangeTrack: {
    flex: 1, height: 10, backgroundColor: C.track, borderRadius: 5, overflow: 'hidden', position: 'relative',
  },
  betRangeFill: {
    height: '100%', backgroundColor: '#2d6a6a', borderRadius: 5,
  },
  betRangeMarker: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, backgroundColor: C.gold,
  },

  betSegPress: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, borderLeftWidth: 5, overflow: 'hidden',
  },
  betSegPressHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingBottom: 12,
  },
  betSegPressTitle: { fontSize: 15, fontWeight: '800' },
  betSegPressSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  betSegPressRight: { alignItems: 'flex-end', gap: 2 },
  betSegCount: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  betSegCountLabel: { fontSize: 10, color: C.muted },
  betSegStats: {
    flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border, paddingVertical: 12, paddingHorizontal: 16,
  },
  betStatItem: { flex: 1, alignItems: 'center' },
  betStatVal: { fontSize: 16, fontWeight: '800', color: C.navy },
  betStatLab: { fontSize: 10, color: C.muted, marginTop: 2 },

  betMachineList: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, overflow: 'hidden', marginTop: -4,
  },
  betMachineListHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: C.border,
  },
  betMcHeaderText: { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.4 },
  betMachineRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 9,
    paddingHorizontal: 14, gap: 8, backgroundColor: C.card,
  },
  betMcId:   { fontSize: 12, fontWeight: '800', color: C.navy, width: 42 },
  betMcLoc:  { fontSize: 11, color: C.gold, fontWeight: '700', width: 46 },
  betMcGame: { flex: 1, fontSize: 12, color: C.text },
  betMcVal:  { fontSize: 13, fontWeight: '800', minWidth: 48, textAlign: 'right' },

  denoStatCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, gap: 4,
  },
  denoStatNum:   { fontSize: 36, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  denoStatLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  denoStatSub:   { fontSize: 11, color: C.muted, lineHeight: 15 },

  denoTileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  denoTile: {
    flexGrow: 1, flexBasis: 100, minWidth: 90,
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, alignItems: 'center', gap: 6,
  },
  denoTileBadge: {
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7,
  },
  denoTileBadgeText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  denoTileCount: { fontSize: 30, fontWeight: '900', color: C.navy, letterSpacing: -1 },
  denoTileSub: { fontSize: 11, color: C.muted },

  betHeading: {
    fontSize: 20, fontWeight: '800', color: C.navy, letterSpacing: -0.3,
  },
  betSubheading: {
    fontSize: 13, color: C.muted, lineHeight: 18, marginTop: -6, marginBottom: 4,
  },

  betKpiCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 18,
    gap: 6,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#1a2332', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  betKpiLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  betKpiValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  betKpiValueTeal: { color: '#2d6a6a' },
  betKpiValueGold: { color: C.gold },
  betKpiSub: { fontSize: 11, color: C.muted, lineHeight: 15 },

  betSegCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 20,
    gap: 12, borderLeftWidth: 4,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#1a2332', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  betSegTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  betSegRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  betSegKey: { fontSize: 13, color: C.text },
  betSegNum: { fontSize: 14, fontWeight: '700', color: C.navy },

  denoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  denoCard: {
    flex: 1, minWidth: 120,
    backgroundColor: '#f8fafb', borderRadius: 12, padding: 16,
    borderWidth: 1, gap: 6,
  },
  denoBadge: {
    alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  denoBadgeText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  denoLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  denoCount: { fontSize: 28, fontWeight: '800', color: C.navy },
  denoSub: { fontSize: 11, color: C.muted, lineHeight: 15 },

  tableRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 4, gap: 6 },
  tableRowAlt:    { backgroundColor: C.rowLine },
  tableHeader:    { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 2 },
  thCell:         { fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  thRight:        { textAlign: 'right' },
  tdCell:         { fontSize: 12, color: C.text },
  tdRight:        { fontSize: 12, color: C.navy3, textAlign: 'right', fontWeight: '600' },
  mfrCell:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mfrDot:         { width: 8, height: 8, borderRadius: 4 },
  tdMfr:          { fontSize: 12, fontWeight: '600', color: C.text },

  cambiosKpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20,
  },
  cambiosKpiCard: {
    flex: 1, minWidth: 140, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#1a2332', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  cambiosKpiIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  cambiosKpiBody:  { flex: 1 },
  cambiosKpiCount: { fontSize: 30, fontWeight: '800', lineHeight: 34 },
  cambiosKpiLabel: { fontSize: 12, color: C.muted, fontWeight: '600', marginTop: 2 },

  changeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  changeTypeTag: {
    borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
    minWidth: 104, alignItems: 'center',
  },
  changeTypeText:     { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textAlign: 'center' },
  changeInfo:         { flex: 1 },
  changeMcId:         { fontSize: 15, fontWeight: '700', color: C.navy },
  changeDetail:       { fontSize: 13, color: C.text, marginTop: 3 },
  changeLocationLine: { fontSize: 13, color: C.navy3, marginTop: 2, fontWeight: '600' },
  changePeriod:       { fontSize: 11, color: C.muted, marginTop: 2 },
  changeDate:         { fontSize: 13, color: C.muted, fontWeight: '500' },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.navy3 },
  emptyBody:  { fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 280 },

  // ── Resumen context ───────────────────────────────────────────────────────
  chartContext: {
    fontSize: 11, color: C.muted, lineHeight: 16,
    marginTop: -4, marginBottom: 8,
    paddingHorizontal: 4,
  },

  // ── Fabricantes redesign ──────────────────────────────────────────────────
  sectionIntro: {
    fontSize: 13, color: C.muted, lineHeight: 19,
    backgroundColor: C.card, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: C.border,
  },
  mfrSummaryRow: { flexDirection: 'row', gap: 12 },
  mfrSummaryCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    padding: 16, gap: 4, borderWidth: 1, borderColor: C.border,
  },
  mfrSummaryNum: {
    fontSize: 30, fontWeight: '900', color: C.navy, letterSpacing: -1,
  },
  mfrSummaryLabel: { fontSize: 11, color: C.muted, lineHeight: 15 },

  mfrCard: {
    backgroundColor: C.card, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#1a2332', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 2,
  },
  mfrCardTop: { borderColor: '#f0d090', shadowOpacity: 0.12 },
  mfrCardFocused: { borderColor: C.navy, borderWidth: 2 },
  mfrColorStripe: { height: 5 },
  mfrCardInner: { padding: 16, gap: 14 },

  mfrCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mfrCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  mfrCardName: { fontSize: 18, fontWeight: '800', color: C.navy, letterSpacing: -0.3 },
  mfrCardSub:  { fontSize: 12, color: C.muted, marginTop: 3 },
  mfrTopBadge: {
    backgroundColor: '#fdf5e7', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#f0d090',
  },
  mfrTopBadgeText: { fontSize: 10, fontWeight: '700', color: '#b8863f' },
  mfrRankBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f6fa', alignItems: 'center', justifyContent: 'center',
  },
  mfrRankNum: { fontSize: 13, fontWeight: '900', color: C.navy3 },

  mfrMetricGrid: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden',
  },
  mfrMetricItem: { flex: 1, padding: 14, gap: 3, backgroundColor: '#fafbfc' },
  mfrMetricBorder: { borderLeftWidth: 1, borderLeftColor: C.border },
  mfrMetricValue: { fontSize: 22, fontWeight: '900', color: C.navy, letterSpacing: -0.5 },
  mfrMetricLabel: { fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 0.3, textTransform: 'uppercase' },
  mfrMetricNote:  { fontSize: 10, color: C.faint, lineHeight: 14, marginTop: 2 },

  mfrBarSection: { gap: 6 },
  mfrBarLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mfrBarLabel:    { fontSize: 11, color: C.muted, fontWeight: '600' },
  mfrBarDelta:    { fontSize: 13, fontWeight: '800' },
  mfrBarTrack: {
    height: 10, backgroundColor: C.track, borderRadius: 5, overflow: 'hidden',
    position: 'relative',
  },
  mfrBarFill:    { height: '100%', borderRadius: 5 },
  mfrBarMidLine: {
    position: 'absolute', left: '52.6%', top: 0, bottom: 0,
    width: 2, backgroundColor: C.navy3 + '66',
  },
  mfrBarEndLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  mfrBarEndLabel:  { fontSize: 9, color: C.faint },
});
