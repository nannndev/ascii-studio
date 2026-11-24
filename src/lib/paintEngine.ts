import type { AsciiGrid, RgbColor } from '../types/studio';
import { hexToRgb } from './color';

export function createBlankPaintGrid(
  cols: number,
  rows: number,
  tintHex: string
): AsciiGrid {
  const rgb = hexToRgb(tintHex);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      ch: ' ',
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
    }))
  );
}

export function cloneGrid(grid: AsciiGrid): AsciiGrid {
  return grid.map((row) => row.map((c) => ({ ...c })));
}

export function paintStamp(
  grid: AsciiGrid,
  cx: number,
  cy: number,
  ch: string,
  rgb: RgbColor,
  size: number
): void {
  const half = Math.floor(size / 2);
  const rows = grid.length;
  if (!rows) return;
  const cols = grid[0].length;
  for (let dy = -half; dy < size - half; dy++) {
    for (let dx = -half; dx < size - half; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        grid[y][x] = { ch, r: rgb.r, g: rgb.g, b: rgb.b };
      }
    }
  }
}

export function paintLine(
  grid: AsciiGrid,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  ch: string,
  rgb: RgbColor,
  size: number
): void {
  let currX = x0;
  let currY = y0;
  const dx = Math.abs(x1 - currX);
  const sx = currX < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - currY);
  const sy = currY < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    paintStamp(grid, currX, currY, ch, rgb, size);
    if (currX === x1 && currY === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      currX += sx;
    }
    if (e2 <= dx) {
      err += dx;
      currY += sy;
    }
  }
}

export function paintBox(
  grid: AsciiGrid,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  ch: string,
  rgb: RgbColor
): void {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);

  for (let x = minX; x <= maxX; x++) {
    paintStamp(grid, x, minY, ch, rgb, 1);
    paintStamp(grid, x, maxY, ch, rgb, 1);
  }
  for (let y = minY; y <= maxY; y++) {
    paintStamp(grid, minX, y, ch, rgb, 1);
    paintStamp(grid, maxX, y, ch, rgb, 1);
  }
}

export function paintFloodFill(
  grid: AsciiGrid,
  startX: number,
  startY: number,
  newCh: string,
  rgb: RgbColor
): void {
  const rows = grid.length;
  if (!rows) return;
  const cols = grid[0].length;
  if (startY < 0 || startY >= rows || startX < 0 || startX >= cols) return;

  const target = grid[startY][startX];
  if (
    target.ch === newCh &&
    target.r === rgb.r &&
    target.g === rgb.g &&
    target.b === rgb.b
  ) {
    return;
  }

  const targetCh = target.ch;
  const queue: [number, number][] = [[startX, startY]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) break;
    const [x, y] = next;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
    if (grid[y][x].ch !== targetCh) continue;

    grid[y][x] = { ch: newCh, r: rgb.r, g: rgb.g, b: rgb.b };
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}
