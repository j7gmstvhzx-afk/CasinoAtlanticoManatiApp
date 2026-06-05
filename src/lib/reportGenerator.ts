import type { SlotMachine } from '@/types/domain';
import type { BankGroup } from '@/store/useSlotFloorStore';

// ── Helpers ──────────────────────────────────────────────────────────────────
const money = (n: number, d = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const pct = (n: number) => n.toFixed(1) + '%';

function holdColor(hold: number): string {
  if (hold < 7) return '#c0392b';     // bajo umbral (rojo)
  if (hold <= 10) return '#b8863f';   // aceptable (dorado)
  return '#1f9d57';                   // óptimo (verde)
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── Period label resolution ──────────────────────────────────────────────────
export function resolvePeriodLabel(machines: SlotMachine[]): string {
  const counts = new Map<string, number>();
  for (const m of machines) {
    const p = (m.period ?? '').trim();
    if (p) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  if (counts.size === 0) return 'Período actual';
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// ── Report builder ───────────────────────────────────────────────────────────
type ReportInput = {
  machines: SlotMachine[];
  bankGroups: BankGroup[];
  periodLabel: string;
};

function buildReportHtml({ machines, bankGroups, periodLabel }: ReportInput): string {
  const withAvg = machines.filter(m => m.avgCoinIn != null && m.avgWin != null);
  const totalCI  = withAvg.reduce((s, m) => s + (m.avgCoinIn ?? 0), 0);
  const totalWin = withAvg.reduce((s, m) => s + (m.avgWin ?? 0), 0);
  const totalWWCJPR = totalWin * 0.5;
  const hold = totalCI > 0 ? (totalWin / totalCI) * 100 : 0;
  const bankCount = bankGroups.length;
  const avgPerMachineCI = withAvg.length ? totalCI / withAvg.length : 0;

  const now = new Date();
  const generated = now.toLocaleString('es-PR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  // ── KPI cards ──
  const kpis = [
    { label: 'COIN-IN PD TOTAL', value: money(totalCI), sub: `${withAvg.length} máquinas activas`, accent: '#1a2332' },
    { label: 'WIN PD TOTAL',     value: money(totalWin), sub: 'Ganancia bruta diaria', accent: '#1f9d57' },
    { label: 'HOLD %',           value: pct(hold), sub: 'Rango aceptable (7-10%)', accent: '#b8863f' },
    { label: 'WWCJPR PD',        value: money(totalWWCJPR), sub: 'Win neto tras 50% CJPR', accent: '#c0392b' },
    { label: 'PROMEDIO POR MÁQ', value: money(avgPerMachineCI), sub: 'Coin-In PD por máquina', accent: '#2d6a6a' },
  ];
  const kpiHtml = kpis.map(k => `
    <div class="kpi" style="border-left-color:${k.accent}">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" style="color:${k.accent}">${k.value}</div>
      <div class="kpi-sub">${esc(k.sub)}</div>
    </div>`).join('');

  // ── Bank table ──
  const maxBankCI = bankGroups.reduce((m, g) => Math.max(m, g.totalCoinIn), 0) || 1;
  const bankRows = bankGroups.map((g, i) => {
    const bHold = g.totalCoinIn > 0 ? (g.totalWin / g.totalCoinIn) * 100 : 0;
    const barPct = Math.max((g.totalCoinIn / maxBankCI) * 100, 1);
    return `
      <tr class="${i % 2 ? 'alt' : ''}">
        <td class="bank-cell">Banco ${esc(g.bank.padStart(2, '0'))}</td>
        <td class="num">${g.machines.length}</td>
        <td class="num bold">${money(g.totalCoinIn)}</td>
        <td class="num">${money(g.totalWin)}</td>
        <td class="num gold">${money(g.totalWin * 0.5)}</td>
        <td class="num" style="color:${holdColor(bHold)};font-weight:700">${pct(bHold)}</td>
        <td class="bar-cell">
          <div class="bar-track"><div class="bar-fill" style="width:${barPct}%"></div></div>
        </td>
      </tr>`;
  }).join('');

  // ── Manufacturer table ──
  const mfrMap = new Map<string, { count: number; ci: number; win: number }>();
  for (const m of machines) {
    const e = mfrMap.get(m.manufacturer) ?? { count: 0, ci: 0, win: 0 };
    e.count++; e.ci += m.avgCoinIn ?? 0; e.win += m.avgWin ?? 0;
    mfrMap.set(m.manufacturer, e);
  }
  const mfrRows = [...mfrMap.entries()]
    .sort((a, b) => b[1].ci - a[1].ci)
    .map(([mfr, e], i) => {
      const mHold = e.ci > 0 ? (e.win / e.ci) * 100 : 0;
      return `
        <tr class="${i % 2 ? 'alt' : ''}">
          <td class="bank-cell">${esc(mfr)}</td>
          <td class="num">${e.count}</td>
          <td class="num bold">${money(e.ci)}</td>
          <td class="num">${money(e.win)}</td>
          <td class="num gold">${money(e.win * 0.5)}</td>
          <td class="num" style="color:${holdColor(mHold)};font-weight:700">${pct(mHold)}</td>
        </tr>`;
    }).join('');

  // ── Top machines table ──
  const topMachines = [...withAvg]
    .sort((a, b) => (b.avgCoinIn ?? 0) - (a.avgCoinIn ?? 0))
    .slice(0, 15);
  const topRows = topMachines.map((m, i) => {
    const mHold = (m.avgCoinIn ?? 0) > 0 ? ((m.avgWin ?? 0) / (m.avgCoinIn ?? 1)) * 100 : 0;
    return `
      <tr class="${i % 2 ? 'alt' : ''}">
        <td class="rank">${i + 1}</td>
        <td class="bold">${esc(m.id)}</td>
        <td class="gold-text">${esc(m.location)}</td>
        <td>${esc(m.game)}</td>
        <td class="num bold">${money(m.avgCoinIn ?? 0)}</td>
        <td class="num">${money(m.avgWin ?? 0)}</td>
        <td class="num gold">${money((m.avgWin ?? 0) * 0.5)}</td>
        <td class="num" style="color:${holdColor(mHold)};font-weight:700">${pct(mHold)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reporte de Piso — Casino Atlántico Manatí — ${esc(periodLabel)}</title>
<style>
  @page { size: letter landscape; margin: 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a2332; background: #fff; font-size: 12px; line-height: 1.4;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .page { padding: 0 4px; }
  .page-break { page-break-before: always; }

  /* Header band */
  header { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #1a2332; }
  .brand-slogan { font-size: 12px; font-weight: 700; color: #b8863f; margin-top: 2px; }
  .brand-sub { font-size: 12px; color: #6b7a8d; margin-top: 2px; }
  .header-right { text-align: right; }
  .period-big { font-size: 22px; font-weight: 800; color: #1a2332; }
  .header-meta { font-size: 10px; color: #8a95a5; margin-top: 4px; line-height: 1.5; }
  .rule { height: 4px; background: #1a2332; border-radius: 2px; margin: 12px 0 22px; }

  /* Section titles */
  .section-title { font-size: 15px; font-weight: 800; color: #1a2332; margin: 22px 0 12px; }
  .section-title:first-of-type { margin-top: 0; }
  .section-sub { font-size: 11px; color: #8a95a5; margin: -8px 0 12px; }

  /* KPI cards */
  .kpi-row { display: flex; gap: 12px; margin-bottom: 8px; }
  .kpi {
    flex: 1; background: #f7f9fc; border: 1px solid #e8ecf1;
    border-left: 5px solid #1a2332; border-radius: 8px; padding: 12px 14px;
  }
  .kpi-label { font-size: 9px; font-weight: 700; color: #8a95a5; letter-spacing: 0.8px; }
  .kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 4px 0; }
  .kpi-sub { font-size: 10px; color: #8a95a5; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: #1a2332; color: #fff; font-size: 10px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase; padding: 9px 10px; text-align: left;
  }
  thead th.num { text-align: right; }
  tbody td { padding: 7px 10px; font-size: 11.5px; border-bottom: 1px solid #eef1f5; }
  tbody tr.alt { background: #f7f9fc; }
  tbody tr.total td { background: #1a2332; color: #fff; font-weight: 800; border: none; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.bold { font-weight: 700; }
  td.gold { color: #b8863f; font-weight: 700; }
  td.gold-text { color: #b8863f; font-weight: 700; }
  td.bank-cell { font-weight: 700; color: #1a2332; }
  td.rank { color: #8a95a5; font-weight: 700; width: 24px; }

  /* Bars inside table */
  td.bar-cell { width: 200px; padding-right: 14px; }
  .bar-track { background: #eef1f5; border-radius: 4px; height: 16px; overflow: hidden; }
  .bar-fill { background: #1a4f7a; height: 100%; border-radius: 4px; }

  /* Legend */
  .legend { display: flex; gap: 18px; margin-top: 10px; font-size: 10px; color: #6b7a8d; }
  .legend span { display: inline-flex; align-items: center; gap: 5px; }
  .dot { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }

  /* Footer */
  footer {
    margin-top: 26px; padding-top: 10px; border-top: 1px solid #e8ecf1;
    display: flex; justify-content: space-between; font-size: 10px; color: #aeb7c4;
  }

  @media print {
    .no-print { display: none !important; }
    .section-block { page-break-inside: avoid; }
  }
  .print-btn {
    position: fixed; top: 16px; right: 16px; z-index: 99;
    background: #1a2332; color: #fff; border: none; border-radius: 10px;
    padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>

  <div class="page">
    <!-- Header -->
    <header>
      <div>
        <div class="brand-title">Casino Atlántico Manatí</div>
        <div class="brand-slogan">El Más Que Paga</div>
        <div class="brand-sub">Reporte de piso de tragamonedas · ${esc(periodLabel)}</div>
      </div>
      <div class="header-right">
        <div class="period-big">${esc(periodLabel)}</div>
        <div class="header-meta">
          Generado: ${esc(generated)}<br>
          Datos internos · Acceso restringido
        </div>
      </div>
    </header>
    <div class="rule"></div>

    <!-- KPIs -->
    <div class="section-title">Métricas del período — ${esc(periodLabel)}</div>
    <div class="section-sub">Promedios diarios (PD = Por Día) calculados sobre ${withAvg.length} máquinas con datos del período.</div>
    <div class="kpi-row">${kpiHtml}</div>

    <!-- Bank table -->
    <div class="section-block">
      <div class="section-title">Detalle por banco — ${esc(periodLabel)}</div>
      <table>
        <thead>
          <tr>
            <th>Banco</th>
            <th class="num">Máqs</th>
            <th class="num">Coin-In PD</th>
            <th class="num">Win PD</th>
            <th class="num">WWCJPR PD</th>
            <th class="num">Hold %</th>
            <th>Coin-In relativo</th>
          </tr>
        </thead>
        <tbody>
          ${bankRows}
          <tr class="total">
            <td>TOTAL</td>
            <td class="num">${withAvg.length}</td>
            <td class="num">${money(totalCI)}</td>
            <td class="num">${money(totalWin)}</td>
            <td class="num">${money(totalWWCJPR)}</td>
            <td class="num">${pct(hold)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div class="legend">
        <span><i class="dot" style="background:#1f9d57"></i> Hold óptimo (&gt;10%)</span>
        <span><i class="dot" style="background:#b8863f"></i> Aceptable (7-10%)</span>
        <span><i class="dot" style="background:#c0392b"></i> Bajo umbral (&lt;7%)</span>
      </div>
    </div>
    <footer>
      <span>Casino Atlántico Manatí · ${esc(periodLabel)} · Confidencial</span>
      <span>Página 1</span>
    </footer>
  </div>

  <!-- Page 2: Manufacturers + Top machines -->
  <div class="page page-break">
    <header>
      <div>
        <div class="brand-title">Casino Atlántico Manatí</div>
        <div class="brand-sub">Detalle por fabricante y top máquinas · ${esc(periodLabel)}</div>
      </div>
      <div class="header-right">
        <div class="header-meta">Generado: ${esc(generated)}</div>
      </div>
    </header>
    <div class="rule"></div>

    <div class="section-block">
      <div class="section-title">Rendimiento por fabricante</div>
      <table>
        <thead>
          <tr>
            <th>Fabricante</th>
            <th class="num">Máqs</th>
            <th class="num">Coin-In PD</th>
            <th class="num">Win PD</th>
            <th class="num">WWCJPR PD</th>
            <th class="num">Hold %</th>
          </tr>
        </thead>
        <tbody>${mfrRows}</tbody>
      </table>
    </div>

    <div class="section-block">
      <div class="section-title">Top 15 máquinas por Coin-In PD</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Ubicación</th>
            <th>Juego</th>
            <th class="num">Coin-In PD</th>
            <th class="num">Win PD</th>
            <th class="num">WWCJPR PD</th>
            <th class="num">Hold %</th>
          </tr>
        </thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>

    <footer>
      <span>Casino Atlántico Manatí · ${esc(periodLabel)} · Confidencial</span>
      <span>Página 2</span>
    </footer>
  </div>

  <script>
    // Auto-open print dialog shortly after load for convenience
    window.addEventListener('load', function () {
      setTimeout(function () { try { window.print(); } catch (e) {} }, 400);
    });
  </script>
</body>
</html>`;
}

// ── Public entry point ───────────────────────────────────────────────────────
export function generateFloorReport(input: ReportInput): boolean {
  const html = buildReportHtml(input);
  if (typeof window === 'undefined' || !window.open) return false;
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
