import type { ColorPalette, RgbColor } from '../types/studio';

export function hexToRgb(hex: string): RgbColor {
  const clean = (hex || '#e4e4e7').replace('#', '');
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num)) {
    return { r: 228, g: 228, b: 231 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function escapeHtmlChar(ch: string): string {
  if (ch === '&') return '&amp;';
  if (ch === '<') return '&lt;';
  if (ch === '>') return '&gt;';
  return ch;
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function applyColorPalette(
  r: number,
  g: number,
  b: number,
  lum: number,
  x: number,
  y: number,
  cols: number,
  rows: number,
  now: number,
  colorPalette: ColorPalette,
  useColorFlag: boolean,
  tintHex: string
): [number, number, number] {
  if (colorPalette === 'mono') {
    if (useColorFlag) return [r, g, b];
    const t = hexToRgb(tintHex);
    return [t.r, t.g, t.b];
  }

  if (colorPalette === 'original') return [r, g, b];

  const norm = Math.max(0, Math.min(1, lum / 255));

  if (colorPalette === 'gameboy') {
    const gb: [number, number, number][] = [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ];
    return gb[Math.min(3, Math.floor(norm * 4))];
  }

  if (colorPalette === 'vaporwave') {
    return [
      Math.round(45 + norm * 210),
      Math.round(20 + norm * 165),
      Math.round(110 + (1 - Math.abs(norm - 0.5)) * 145),
    ];
  }

  if (colorPalette === 'thermal') {
    if (norm < 0.33) {
      const k = norm / 0.33;
      return [Math.round(k * 120), 0, Math.round(80 + k * 140)];
    }
    if (norm < 0.66) {
      const k = (norm - 0.33) / 0.33;
      return [
        Math.round(120 + k * 135),
        Math.round(k * 120),
        Math.round(220 - k * 200),
      ];
    }
    const k = (norm - 0.66) / 0.34;
    return [255, Math.round(120 + k * 135), Math.round(20 + k * 220)];
  }

  if (colorPalette === 'cyberpunk') {
    return norm > 0.55
      ? [Math.round(56 + norm * 40), Math.round(200 + norm * 55), 255]
      : [
          Math.round(180 + norm * 75),
          Math.round(30 + norm * 60),
          Math.round(180 + norm * 75),
        ];
  }

  if (colorPalette === 'rainbow') {
    const hue =
      ((x / Math.max(1, cols)) * 360 +
        (y / Math.max(1, rows)) * 120 +
        now * 0.08) %
      360;
    const s = 0.9;
    const l = 0.45 + norm * 0.3;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = hue / 60;
    const xVal = c * (1 - Math.abs((hp % 2) - 1));
    let rr = 0;
    let gg = 0;
    let bb = 0;
    if (hp < 1) {
      rr = c;
      gg = xVal;
    } else if (hp < 2) {
      rr = xVal;
      gg = c;
    } else if (hp < 3) {
      gg = c;
      bb = xVal;
    } else if (hp < 4) {
      gg = xVal;
      bb = c;
    } else if (hp < 5) {
      rr = xVal;
      bb = c;
    } else {
      rr = c;
      bb = xVal;
    }
    const m = l - c / 2;
    return [
      Math.round((rr + m) * 255),
      Math.round((gg + m) * 255),
      Math.round((bb + m) * 255),
    ];
  }

  return [r, g, b];
}
