// Floor layout for the Plano (heatmap) tab.
//
// The grid below is an ORDERED default: banks laid out left→right, top→bottom,
// FLOOR_COLUMNS per row. The casino's real physical layout is not encoded yet —
// when it is available, edit the row/col of each bank here (this file is the
// single remap point; the heatmap reads positions exclusively from it).

export type FloorCell = { bank: number; row: number; col: number };

export const FLOOR_COLUMNS = 8;

function defaultLayout(): FloorCell[] {
  const banks: number[] = [];
  for (let b = 9; b <= 52; b++) banks.push(b);
  return banks.map((bank, i) => ({
    bank,
    row: Math.floor(i / FLOOR_COLUMNS),
    col: i % FLOOR_COLUMNS,
  }));
}

export const FLOOR_LAYOUT: FloorCell[] = defaultLayout();
