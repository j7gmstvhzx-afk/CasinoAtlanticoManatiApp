import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView,
  StyleSheet, Switch, Text as RNText, TextInput, View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MachineEditSheet } from '@/components/slotfloor/MachineEditSheet';
import { StatCard } from '@/components/dashboard/StatCard';
import { HBars, type HBarItem } from '@/components/dashboard/HBars';
import { Donut, type DonutItem } from '@/components/dashboard/Donut';
import { SegmentedTabs } from '@/components/dashboard/SegmentedTabs';
import { BankBrowser } from '@/components/dashboard/BankBrowser';
import { MachineRow } from '@/components/dashboard/MachineRow';
import { C, card, money, mfrColor, shortMfr, useResponsive, MAX_CONTENT } from '@/components/dashboard/shared';
import type { SlotMachine, MachineChange } from '@/types/domain';

type Metric = 'avgCoinIn' | 'avgWin';

const TABS = [
  { key: 'resumen',      label: 'Resumen' },
  { key: 'bancos',       label: 'Bancos' },
  { key: 'fabricantes',  label: 'Fabricantes' },
  { key: 'maquinas',     label: 'Máquinas' },
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

// ── Section: Resumen ──────────────────────────────────────────────────────────

function ResumeSection({ metric, gutter }: { metric: Metric; gutter: number }) {
  const machines    = useSlotFloorStore(s => s.machines);
  const floorStats  = useSlotFloorStore(s => s.floorStats);
  const getBankRanking = useSlotFloorStore(s => s.getBankRanking);

  const { best, worst } = getBankRanking(metric);

  const distData: DonutItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of machines) map.set(m.manufacturer, (map.get(m.manufacturer) ?? 0) + 1);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({ label: shortMfr(name), value: count, color: mfrColor(name, idx) }));
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
      {/* KPI grid — auto-reflows 4 / 2 / 1 across by screen width */}
      <View style={styles.kpiGrid}>
        <StatCard label="Total Máquinas"  value={String(floorStats.total)} icon="grid-outline"        tone="navy"  sub={`${bankCount} bancos en piso`} />
        <StatCard label="Avg Coin-In PD"  value={money(floorStats.avgCoinIn, 0)} icon="trending-up-outline" tone="teal"  sub="Promedio diario por máquina" />
        <StatCard label="Avg Win PD"      value={money(floorStats.avgWin, 0)}    icon="cash-outline"        tone="green" sub="Promedio diario por máquina" />
        <StatCard label="Win %"           value={winPctStr} icon="pie-chart-outline"  tone="gold"  sub="Win PD / Coin-In PD" />
      </View>

      {/* Best 5 banks */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={card.accent} /><RNText style={card.title}>Top 5 Mejores Bancos</RNText></View>
        {bestBars.length ? <HBars data={bestBars} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      {/* Worst 5 banks */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={[card.accent, { backgroundColor: C.red }]} /><RNText style={card.title}>Top 5 Peores Bancos</RNText></View>
        {worstBars.length ? <HBars data={worstBars} barColor={C.red} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      {/* Manufacturer donut */}
      <View style={card.base}>
        <View style={card.titleRow}><View style={card.accent} /><RNText style={card.title}>Distribución por Fabricante</RNText></View>
        {distData.length ? <Donut data={distData} /> : <RNText style={styles.empty}>Sin datos</RNText>}
      </View>

      <RNText style={styles.footer}>Casino Atlántico Manatí · Operaciones de Piso</RNText>
    </ScrollView>
  );
}

// ── Section: Bancos ───────────────────────────────────────────────────────────

function BancosSection({ metric, onEdit, gutter }: { metric: Metric; onEdit: (m: SlotMachine) => void; gutter: number }) {
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const groups = getBankGroups();

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      <BankBrowser groups={groups} rankMetric={metric} onEdit={onEdit} />
      <RNText style={styles.footer}>{groups.length} bancos · {groups.reduce((s, g) => s + g.machines.length, 0)} máquinas</RNText>
    </ScrollView>
  );
}

// ── Section: Fabricantes ──────────────────────────────────────────────────────

function FabricantesSection({ gutter }: { gutter: number }) {
  const machines = useSlotFloorStore(s => s.machines);

  const rows = useMemo(() => {
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
        avgCoinIn:  e.count ? e.totalCoin / e.count : 0,
        avgWin:     e.count ? e.totalWin  / e.count : 0,
        winPct:     e.totalCoin > 0 ? (e.totalWin / e.totalCoin) * 100 : 0,
        color:      mfrColor(mfr, 0),
      }))
      .sort((a, b) => b.avgCoinIn - a.avgCoinIn);
  }, [machines]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      <View style={card.base}>
        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <RNText style={[styles.thCell, { flex: 2 }]}>Fabricante</RNText>
          <RNText style={[styles.thCell, styles.thRight]}>Máqs</RNText>
          <RNText style={[styles.thCell, styles.thRight]}>Avg CI PD</RNText>
          <RNText style={[styles.thCell, styles.thRight]}>Avg Win PD</RNText>
          <RNText style={[styles.thCell, styles.thRight]}>Win %</RNText>
        </View>
        {rows.map((r, i) => (
          <View key={r.mfr} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
            <View style={[{ flex: 2 }, styles.mfrCell]}>
              <View style={[styles.mfrDot, { backgroundColor: r.color }]} />
              <RNText style={styles.tdMfr} numberOfLines={1}>{shortMfr(r.mfr)}</RNText>
            </View>
            <RNText style={styles.tdRight}>{r.count}</RNText>
            <RNText style={styles.tdRight}>{money(r.avgCoinIn, 0)}</RNText>
            <RNText style={[styles.tdRight, { color: C.green }]}>{money(r.avgWin, 0)}</RNText>
            <RNText style={styles.tdRight}>{r.winPct.toFixed(1)}%</RNText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Section: Máquinas ─────────────────────────────────────────────────────────

function MaquinasSection({ onEdit, gutter }: { onEdit: (m: SlotMachine) => void; gutter: number }) {
  const getFiltered       = useSlotFloorStore(s => s.getFilteredMachines);
  const setSearch         = useSlotFloorStore(s => s.setExplorerSearch);
  const clearFilters      = useSlotFloorStore(s => s.clearExplorerFilters);
  const explorerSearch    = useSlotFloorStore(s => s.explorerSearch);
  const filtered          = getFiltered();

  return (
    <View style={styles.section}>
      {/* Search bar */}
      <View style={[styles.searchBar, { marginHorizontal: gutter }]}>
        <Ionicons name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={explorerSearch}
          onChangeText={setSearch}
          placeholder="Buscar por ID, juego, banco..."
          placeholderTextColor={C.muted}
          autoCorrect={false}
        />
        {explorerSearch.length > 0 && (
          <Pressable onPress={clearFilters} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>
      <RNText style={styles.resultCount}>{filtered.length} máquinas</RNText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(m => (
          <MachineRow key={m.id} machine={m} onEdit={onEdit} showBank />
        ))}
        {filtered.length === 0 && (
          <RNText style={styles.empty}>No se encontraron máquinas</RNText>
        )}
      </ScrollView>
    </View>
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
  const machines = useSlotFloorStore(s => s.machines);
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

function CambiosSection({ gutter }: { gutter: number }) {
  const changes = useSlotFloorStore(s => s.machineChanges);

  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of changes) counts[c.type] = (counts[c.type] ?? 0) + 1;
    return counts;
  }, [changes]);

  return (
    <ScrollView contentContainerStyle={[styles.sectionContent, { padding: gutter }]} showsVerticalScrollIndicator={false}>
      {/* Summary pills */}
      {changes.length > 0 && (
        <View style={styles.changeSummary}>
          {Object.entries(summary).map(([type, count]) => (
            <View
              key={type}
              style={[styles.changePill, { backgroundColor: (CHANGE_COLORS[type] ?? C.navy3) + '18', borderColor: (CHANGE_COLORS[type] ?? C.navy3) + '44' }]}
            >
              <RNText style={[styles.changePillText, { color: CHANGE_COLORS[type] ?? C.navy3 }]}>
                {CHANGE_LABELS[type] ?? type}: {count}
              </RNText>
            </View>
          ))}
        </View>
      )}

      {changes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="swap-horizontal-outline" size={40} color={C.faint} />
          <RNText style={styles.emptyTitle}>Sin cambios registrados</RNText>
          <RNText style={styles.emptyBody}>Los cambios se registran automáticamente al editar una máquina.</RNText>
        </View>
      ) : (
        <View style={card.base}>
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

  return (
    <View style={[styles.changeRow, alt && styles.tableRowAlt]}>
      <View style={[styles.changeTypeTag, { backgroundColor: color + '18', borderColor: color + '44' }]}>
        <RNText style={[styles.changeTypeText, { color }]}>{CHANGE_LABELS[c.type] ?? c.type}</RNText>
      </View>
      <View style={styles.changeInfo}>
        <RNText style={styles.changeMcId}>Máquina {c.mc}</RNText>
        {c.game2024 && c.game2025 && c.game2024 !== c.game2025 && (
          <RNText style={styles.changeDetail} numberOfLines={1}>{c.game2024} → {c.game2025}</RNText>
        )}
        {c.location2024 && c.location2025 && c.location2024 !== c.location2025 && (
          <RNText style={styles.changeDetail}>{c.location2024} → {c.location2025}</RNText>
        )}
        {c.periodLabel ? <RNText style={styles.changePeriod}>{c.periodLabel}</RNText> : null}
      </View>
      <RNText style={styles.changeDate}>{date}</RNText>
    </View>
  );
}

// ── Root screen ───────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [tab, setTab]              = useState('resumen');
  const [metric, setMetric]        = useState<Metric>('avgCoinIn');
  const [editMachine, setEditMachine] = useState<SlotMachine | null>(null);

  const init        = useSlotFloorStore(s => s.init);
  const initialized = useSlotFloorStore(s => s.initialized);
  const profile     = useAuthStore(s => s.profile);
  const signOut     = useAuthStore(s => s.signOut);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const gutter    = isDesktop ? 32 : width >= 640 ? 24 : 16;

  useEffect(() => { init(); }, [init]);

  const showMetricToggle = tab === 'resumen' || tab === 'bancos';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        {/* Top bar — responsive: taller + larger logo on desktop */}
        <View style={[styles.topBar, { paddingHorizontal: gutter, paddingVertical: isDesktop ? 14 : 10 }]}>
          <View style={styles.brandRow}>
            <View style={[styles.logoMark, isDesktop && styles.logoMarkLg]}>
              <RNText style={[styles.logoMarkText, isDesktop && styles.logoMarkTextLg]}>CA</RNText>
            </View>
            <View>
              <RNText style={[styles.brandText, isDesktop && styles.brandTextLg]}>Casino Atlántico Manatí</RNText>
              {isDesktop && <RNText style={styles.brandSub}>Plataforma Operativa de Piso</RNText>}
            </View>
          </View>
          <View style={styles.topRight}>
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

        {/* Tabs */}
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} gutter={gutter} />
      </SafeAreaView>

      {!initialized ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={C.gold} />
          <RNText style={styles.loadingText}>Cargando datos del piso...</RNText>
        </View>
      ) : (
        <>
          {tab === 'resumen'     && <ResumeSection metric={metric} gutter={gutter} />}
          {tab === 'bancos'      && <BancosSection metric={metric} onEdit={setEditMachine} gutter={gutter} />}
          {tab === 'fabricantes' && <FabricantesSection gutter={gutter} />}
          {tab === 'maquinas'    && <MaquinasSection onEdit={setEditMachine} gutter={gutter} />}
          {tab === 'apuestas'    && <ApuestasSection gutter={gutter} />}
          {tab === 'cambios'     && <CambiosSection gutter={gutter} />}
        </>
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
    width: 30, height: 30, borderRadius: 9, backgroundColor: C.navy,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText:   { fontSize: 12, fontWeight: '800', color: C.gold, letterSpacing: 0.5 },
  brandText:      { fontSize: 13, fontWeight: '600', color: C.navy3 },
  brandTextLg:    { fontSize: 17, fontWeight: '700', color: C.navy },
  brandSub:       { fontSize: 11, color: C.muted, letterSpacing: 0.3, marginTop: 1 },
  logoMarkLg:     { width: 42, height: 42, borderRadius: 13 },
  logoMarkTextLg: { fontSize: 15 },
  topRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
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

  kpiRow:         { flexDirection: 'row', gap: 14 },
  kpiGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  footer:         { fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 8 },
  empty:          { fontSize: 14, color: C.faint, textAlign: 'center', paddingVertical: 24 },

  loading:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:    { fontSize: 14, color: C.muted },

  searchBar: {
    flexDirection:  'row',
    alignItems:     'center',
    margin:         16,
    backgroundColor: C.card,
    borderRadius:   12,
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderWidth:    1,
    borderColor:    C.border,
  },
  searchInput:    { flex: 1, fontSize: 14, color: C.navy },
  resultCount:    { fontSize: 12, color: C.muted, marginHorizontal: 16, marginTop: -8, marginBottom: 4 },

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

  changeSummary:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  changePill: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1,
  },
  changePillText: { fontSize: 12, fontWeight: '700' },

  changeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 14, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  changeTypeTag: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, minWidth: 96,
  },
  changeTypeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  changeInfo:     { flex: 1 },
  changeMcId:     { fontSize: 13, fontWeight: '700', color: C.navy },
  changeDetail:   { fontSize: 11, color: C.text, marginTop: 2 },
  changePeriod:   { fontSize: 10, color: C.muted, marginTop: 1 },
  changeDate:     { fontSize: 11, color: C.muted },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.navy3 },
  emptyBody:  { fontSize: 13, color: C.muted, textAlign: 'center', maxWidth: 280 },
});
