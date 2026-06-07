import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SlotMachine } from '@/types/domain';
import type { BankGroup } from '@/store/useSlotFloorStore';

// ── Palette (RGB tuples) ─────────────────────────────────────────────────────
const NAVY:  [number, number, number] = [26, 35, 50];
const NAVY2: [number, number, number] = [26, 79, 122];
const GOLD:  [number, number, number] = [184, 134, 63];
const GREEN: [number, number, number] = [31, 157, 87];
const RED:   [number, number, number] = [192, 57, 43];
const GRAY:  [number, number, number] = [138, 149, 165];
const LIGHT: [number, number, number] = [247, 249, 252];
const BORDER:[number, number, number] = [232, 236, 241];

// ── Helpers ──────────────────────────────────────────────────────────────────
const money = (n: number, d = 0) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => n.toFixed(1) + '%';

function holdColor(hold: number): [number, number, number] {
  if (hold < 7) return RED;
  if (hold <= 10) return GOLD;
  return GREEN;
}

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

type ReportInput = {
  machines: SlotMachine[];
  bankGroups: BankGroup[];
  periodLabel: string;
};

// ── PDF builder ──────────────────────────────────────────────────────────────
export function generateFloorReport({ machines, bankGroups, periodLabel }: ReportInput): boolean {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();   // 792
  const pageH = doc.internal.pageSize.getHeight();  // 612
  const margin = 40;
  const contentW = pageW - margin * 2;

  // ── Aggregates ──
  const withAvg  = machines.filter(m => m.avgCoinIn != null && m.avgWin != null);
  const totalCI  = withAvg.reduce((s, m) => s + (m.avgCoinIn ?? 0), 0);
  const totalWin = withAvg.reduce((s, m) => s + (m.avgWin ?? 0), 0);
  const totalWW  = totalWin * 0.5;
  const hold     = totalCI > 0 ? (totalWin / totalCI) * 100 : 0;
  const avgPerMc = withAvg.length ? totalCI / withAvg.length : 0;

  const now = new Date();
  const generated = 'Generado: ' + now.toLocaleString('es-PR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  // ── Running header (every page) ──
  function drawHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...NAVY);
    doc.text('Casino Atlántico Manatí', margin, margin + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text('El Más Que Paga', margin, margin + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(`Reporte de piso de tragamonedas · ${periodLabel}`, margin, margin + 32);

    // Right block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    doc.text(periodLabel, pageW - margin, margin + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(generated, pageW - margin, margin + 20, { align: 'right' });
    doc.text('Datos internos · Acceso restringido', pageW - margin, margin + 31, { align: 'right' });

    // Navy rule
    doc.setFillColor(...NAVY);
    doc.rect(margin, margin + 40, contentW, 3, 'F');
  }

  // ── Footer (every page) ──
  function drawFooter(pageNum: number, pageCount: number) {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(margin, pageH - 28, pageW - margin, pageH - 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(174, 183, 196);
    doc.text(`Casino Atlántico Manatí · ${periodLabel} · Confidencial`, margin, pageH - 16);
    doc.text(`Página ${pageNum} de ${pageCount}`, pageW - margin, pageH - 16, { align: 'right' });
  }

  // ── KPI cards (page 1) ──
  function drawKpis(y: number): number {
    const kpis: Array<{ label: string; value: string; sub: string; accent: [number, number, number] }> = [
      { label: 'COIN-IN PD TOTAL', value: money(totalCI), sub: `${withAvg.length} máquinas activas`, accent: NAVY },
      { label: 'WIN PD TOTAL',     value: money(totalWin), sub: 'Ganancia bruta diaria', accent: GREEN },
      { label: 'HOLD %',           value: pct(hold), sub: 'Rango aceptable 7-10%', accent: GOLD },
      { label: 'WWCJPR PD',        value: money(totalWW), sub: 'Win neto tras 50% CJPR', accent: RED },
      { label: 'PROMEDIO / MÁQ',   value: money(avgPerMc), sub: 'Coin-In PD por máquina', accent: NAVY2 },
    ];
    const gap = 10;
    const cardW = (contentW - gap * (kpis.length - 1)) / kpis.length;
    const cardH = 66;
    kpis.forEach((k, i) => {
      const x = margin + i * (cardW + gap);
      doc.setFillColor(...LIGHT);
      doc.setDrawColor(...BORDER);
      doc.roundedRect(x, y, cardW, cardH, 5, 5, 'FD');
      // accent left bar
      doc.setFillColor(...k.accent);
      doc.rect(x, y + 4, 4, cardH - 8, 'F');
      // label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(k.label, x + 12, y + 16);
      // value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...k.accent);
      doc.text(k.value, x + 12, y + 38);
      // sub
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.text(k.sub, x + 12, y + 54);
    });
    return y + cardH;
  }

  function sectionTitle(text: string, y: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    doc.text(text, margin, y);
    return y + 6;
  }

  // ════════════════════════ PAGE 1 ════════════════════════
  drawHeader();
  let y = margin + 58;
  y = sectionTitle(`Métricas del período — ${periodLabel}`, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    `Promedios diarios (PD = Por Día) sobre ${withAvg.length} máquinas con datos del período.`,
    margin, y + 8,
  );
  y = drawKpis(y + 18) + 24;

  // Bank table
  y = sectionTitle(`Detalle por banco — ${periodLabel}`, y) + 8;

  const maxBankCI = bankGroups.reduce((m, g) => Math.max(m, g.totalCoinIn), 0) || 1;
  const bankBody = bankGroups.map(g => {
    const bHold = g.totalCoinIn > 0 ? (g.totalWin / g.totalCoinIn) * 100 : 0;
    return [
      `Banco ${g.bank.padStart(2, '0')}`,
      String(g.machines.length),
      money(g.totalCoinIn),
      money(g.totalWin),
      money(g.totalWin * 0.5),
      pct(bHold),
      g.totalCoinIn, // raw value for bar column
    ];
  });
  bankBody.push([
    'TOTAL', String(withAvg.length), money(totalCI), money(totalWin), money(totalWW), pct(hold), 0,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: margin + 58, bottom: 40 },
    head: [['Banco', 'Máqs', 'Coin-In PD', 'Win PD', 'WWCJPR PD', 'Hold %', 'Coin-In relativo']],
    body: bankBody,
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 4, textColor: NAVY },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' },
      4: { halign: 'right', textColor: GOLD, fontStyle: 'bold' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 170 },
    },
    didParseCell: (data) => {
      // Color hold % column
      if (data.section === 'body' && data.column.index === 5) {
        const raw = parseFloat(String(data.cell.raw).replace('%', ''));
        if (!isNaN(raw)) data.cell.styles.textColor = holdColor(raw);
      }
      // TOTAL row styling
      if (data.section === 'body' && data.row.index === bankBody.length - 1) {
        data.cell.styles.fillColor = NAVY;
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
      // Hide raw number text in bar column (body rows only — header keeps its title)
      if (data.section !== 'head' && data.column.index === 6) data.cell.text = [''];
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 6
          && data.row.index < bankGroups.length) {
        const raw = bankBody[data.row.index][6] as number;
        const w = Math.max((raw / maxBankCI) * (data.cell.width - 8), 1);
        const bx = data.cell.x + 4;
        const by = data.cell.y + (data.cell.height - 10) / 2;
        doc.setFillColor(238, 241, 245);
        doc.roundedRect(bx, by, data.cell.width - 8, 10, 2, 2, 'F');
        doc.setFillColor(...NAVY2);
        doc.roundedRect(bx, by, w, 10, 2, 2, 'F');
      }
    },
  });

  // Hold legend under bank table
  const afterBankY = (doc as any).lastAutoTable.finalY + 14;
  if (afterBankY < pageH - 60) {
    const legendY = afterBankY;
    const items: Array<[string, [number, number, number]]> = [
      ['Hold óptimo (>10%)', GREEN], ['Aceptable (7-10%)', GOLD], ['Bajo umbral (<7%)', RED],
    ];
    let lx = margin;
    doc.setFontSize(8);
    items.forEach(([txt, col]) => {
      doc.setFillColor(...col);
      doc.roundedRect(lx, legendY - 7, 8, 8, 1, 1, 'F');
      doc.setTextColor(...GRAY);
      doc.setFont('helvetica', 'normal');
      doc.text(txt, lx + 12, legendY);
      lx += doc.getTextWidth(txt) + 34;
    });
  }

  // ════════════════════════ PAGE 2 ════════════════════════
  doc.addPage();
  drawHeader();
  y = margin + 58;

  // Manufacturer table
  y = sectionTitle('Rendimiento por fabricante', y) + 8;
  const mfrMap = new Map<string, { count: number; ci: number; win: number }>();
  for (const m of machines) {
    const e = mfrMap.get(m.manufacturer) ?? { count: 0, ci: 0, win: 0 };
    e.count++; e.ci += m.avgCoinIn ?? 0; e.win += m.avgWin ?? 0;
    mfrMap.set(m.manufacturer, e);
  }
  const mfrBody = [...mfrMap.entries()].sort((a, b) => b[1].ci - a[1].ci).map(([mfr, e]) => {
    const mHold = e.ci > 0 ? (e.win / e.ci) * 100 : 0;
    return [mfr, String(e.count), money(e.ci), money(e.win), money(e.win * 0.5), pct(mHold)];
  });
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: margin + 58, bottom: 40 },
    head: [['Fabricante', 'Máqs', 'Coin-In PD', 'Win PD', 'WWCJPR PD', 'Hold %']],
    body: mfrBody,
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 4, textColor: NAVY },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }, 2: { halign: 'right', fontStyle: 'bold' },
      3: { halign: 'right' }, 4: { halign: 'right', textColor: GOLD, fontStyle: 'bold' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const raw = parseFloat(String(data.cell.raw).replace('%', ''));
        if (!isNaN(raw)) data.cell.styles.textColor = holdColor(raw);
      }
    },
  });

  // Top machines table
  y = (doc as any).lastAutoTable.finalY + 22;
  y = sectionTitle('Top 15 máquinas por Coin-In PD', y) + 8;
  const topBody = [...withAvg]
    .sort((a, b) => (b.avgCoinIn ?? 0) - (a.avgCoinIn ?? 0))
    .slice(0, 15)
    .map((m, i) => {
      const mHold = (m.avgCoinIn ?? 0) > 0 ? ((m.avgWin ?? 0) / (m.avgCoinIn ?? 1)) * 100 : 0;
      return [
        String(i + 1), m.id, m.location, m.game,
        money(m.avgCoinIn ?? 0), money(m.avgWin ?? 0), money((m.avgWin ?? 0) * 0.5), pct(mHold),
      ];
    });
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin, top: margin + 58, bottom: 40 },
    head: [['#', 'ID', 'Ubicación', 'Juego', 'Coin-In PD', 'Win PD', 'WWCJPR PD', 'Hold %']],
    body: topBody,
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 4, textColor: NAVY },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { textColor: GRAY, fontStyle: 'bold', cellWidth: 24 },
      1: { fontStyle: 'bold' },
      2: { textColor: GOLD, fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'right' },
      6: { halign: 'right', textColor: GOLD, fontStyle: 'bold' },
      7: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const raw = parseFloat(String(data.cell.raw).replace('%', ''));
        if (!isNaN(raw)) data.cell.styles.textColor = holdColor(raw);
      }
    },
  });

  // ── Footers with page numbers ──
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    drawFooter(p, pageCount);
  }

  // ── Download ──
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]+/g, '_');
  doc.save(`Reporte_Piso_${safePeriod}.pdf`);
  return true;
}
