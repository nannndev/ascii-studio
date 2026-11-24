import { BAYER_4X4, BRAILLE_MAP, CHARSETS } from '../constants/studio';
import type {
  AsciiCell,
  AsciiGrid,
  AudioFxTarget,
  FrameStyle,
  StudioMode,
  StudioSettings,
} from '../types/studio';
import { applyColorPalette, escapeHtmlChar, hexToRgb } from './color';
import { preprocessSampleBuffer } from './imageProcessing';

export interface RenderFxRuntime {
  now: number;
  fxStartTime: number;
  audioActive: boolean;
  audioBass: number;
  audioFxTarget: AudioFxTarget;
  mouseCol: number;
  mouseRow: number;
  mouseClickTime: number;
  mouseClickCol: number;
  mouseClickRow: number;
}

export function getActiveCharset(settings: StudioSettings): string[] {
  const raw =
    settings.charsetKey === 'custom'
      ? settings.customCharset || '@#S%?*+;:,. '
      : CHARSETS[settings.charsetKey] || CHARSETS.standard;
  const chars = Array.from(raw);
  return settings.invert ? chars : chars.slice().reverse();
}

export function isColorRenderingEnabled(
  settings: StudioSettings,
  mode: StudioMode
): boolean {
  return (
    settings.color ||
    settings.colorPalette !== 'mono' ||
    settings.detailMode === 'halfblock_hd' ||
    mode === 'paint'
  );
}

export function renderGridFromImageData(
  imgData: Uint8ClampedArray,
  cols: number,
  rows: number,
  sampleW: number,
  sampleH: number,
  mode: StudioMode,
  settings: StudioSettings,
  runtime: RenderFxRuntime
): AsciiGrid {
  const contrast = mode === 'text' ? 1.0 : settings.contrast;
  const fxElapsed = ((runtime.now - runtime.fxStartTime) / 1000) * settings.fxSpeed;

  let extraBrightness = 0;
  if (settings.fxMode === 'pulse') {
    extraBrightness = Math.sin(fxElapsed * 3.5) * 65 * settings.fxIntensity;
  }
  if (
    runtime.audioActive &&
    (runtime.audioFxTarget === 'pulse' || runtime.audioFxTarget === 'all')
  ) {
    extraBrightness += (runtime.audioBass - 0.15) * 110;
  }

  const brightness = (mode === 'text' ? 0 : settings.brightness) + extraBrightness;
  const sharpenVal = mode === 'text' ? 0 : settings.sharpen;

  const { rgbBuf, finalLum } = preprocessSampleBuffer(
    imgData,
    sampleW,
    sampleH,
    contrast,
    brightness,
    sharpenVal,
    settings.edgeDetect
  );

  const isCutout = (lum: number) =>
    (settings.cutoutMode === 'dark' && lum < settings.cutoutThreshold) ||
    (settings.cutoutMode === 'light' && lum > 255 - settings.cutoutThreshold);

  const grid: AsciiGrid = [];

  if (settings.detailMode === 'braille_hd') {
    const errBuf = new Float32Array(finalLum);
    const dotBits = new Uint8Array(sampleW * sampleH);

    for (let py = 0; py < sampleH; py++) {
      for (let px = 0; px < sampleW; px++) {
        const idx = py * sampleW + px;
        const oldVal = errBuf[idx];
        const isLit = oldVal >= 127.5;
        const quant = isLit ? 255 : 0;
        dotBits[idx] = settings.invert ? (isLit ? 0 : 1) : isLit ? 1 : 0;

        const err = oldVal - quant;
        if (px + 1 < sampleW) errBuf[idx + 1] += err * (7 / 16);
        if (py + 1 < sampleH) {
          if (px > 0) errBuf[idx + sampleW - 1] += err * (3 / 16);
          errBuf[idx + sampleW] += err * (5 / 16);
          if (px + 1 < sampleW) errBuf[idx + sampleW + 1] += err * (1 / 16);
        }
      }
    }

    for (let y = 0; y < rows; y++) {
      const rowArr: AsciiCell[] = [];
      for (let x = 0; x < cols; x++) {
        let mask = 0;
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumL = 0;

        for (let k = 0; k < 8; k++) {
          const sx = x * 2 + BRAILLE_MAP[k][0];
          const sy = y * 4 + BRAILLE_MAP[k][1];
          const si = sy * sampleW + sx;
          if (dotBits[si]) mask |= BRAILLE_MAP[k][2];
          sumR += rgbBuf[si * 3];
          sumG += rgbBuf[si * 3 + 1];
          sumB += rgbBuf[si * 3 + 2];
          sumL += finalLum[si];
        }

        const brailleCh = String.fromCharCode(0x2800 | mask);
        const avgLum = sumL / 8;
        const [pr, pg, pb] = applyColorPalette(
          sumR / 8,
          sumG / 8,
          sumB / 8,
          avgLum,
          x,
          y,
          cols,
          rows,
          runtime.now,
          settings.colorPalette,
          settings.color,
          settings.tintHex
        );
        rowArr.push({
          ch: isCutout(avgLum) ? ' ' : brailleCh,
          r: Math.round(pr),
          g: Math.round(pg),
          b: Math.round(pb),
        });
      }
      grid.push(rowArr);
    }
    return grid;
  }

  if (settings.detailMode === 'halfblock_hd') {
    for (let y = 0; y < rows; y++) {
      const rowArr: AsciiCell[] = [];
      for (let x = 0; x < cols; x++) {
        const topIdx = y * 2 * sampleW + x;
        const botIdx = (y * 2 + 1) * sampleW + x;

        const tLum = settings.invert ? 255 - finalLum[topIdx] : finalLum[topIdx];
        const bLum = settings.invert ? 255 - finalLum[botIdx] : finalLum[botIdx];

        if (isCutout(finalLum[topIdx]) && isCutout(finalLum[botIdx])) {
          rowArr.push({ ch: ' ', r: 0, g: 0, b: 0 });
          continue;
        }

        let tr = rgbBuf[topIdx * 3];
        let tg = rgbBuf[topIdx * 3 + 1];
        let tb = rgbBuf[topIdx * 3 + 2];
        let br = rgbBuf[botIdx * 3];
        let bg = rgbBuf[botIdx * 3 + 1];
        let bb = rgbBuf[botIdx * 3 + 2];

        if (settings.colorPalette === 'mono' && !settings.color) {
          const tint = hexToRgb(settings.tintHex);
          const tf = tLum / 255;
          const bf = bLum / 255;
          tr = Math.round(tint.r * tf);
          tg = Math.round(tint.g * tf);
          tb = Math.round(tint.b * tf);
          br = Math.round(tint.r * bf);
          bg = Math.round(tint.g * bf);
          bb = Math.round(tint.b * bf);
        } else {
          [tr, tg, tb] = applyColorPalette(
            tr,
            tg,
            tb,
            tLum,
            x,
            y,
            cols,
            rows,
            runtime.now,
            settings.colorPalette,
            settings.color,
            settings.tintHex
          );
          [br, bg, bb] = applyColorPalette(
            br,
            bg,
            bb,
            bLum,
            x,
            y,
            cols,
            rows,
            runtime.now,
            settings.colorPalette,
            settings.color,
            settings.tintHex
          );
        }

        rowArr.push({
          ch: '▀',
          r: Math.round(tr),
          g: Math.round(tg),
          b: Math.round(tb),
          br: Math.round(br),
          bg: Math.round(bg),
          bb: Math.round(bb),
        });
      }
      grid.push(rowArr);
    }
    return grid;
  }

  const ramp =
    settings.detailMode === 'photo_hd'
      ? settings.invert
        ? Array.from(CHARSETS.detailed)
        : Array.from(CHARSETS.detailed).reverse()
      : getActiveCharset(settings);
  const rampLen = ramp.length - 1;
  const useFS = settings.detailMode === 'photo_hd';
  const errBuf = useFS ? new Float32Array(finalLum) : finalLum;

  for (let y = 0; y < rows; y++) {
    const rowArr: AsciiCell[] = [];
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let lum = errBuf[i];

      if (!useFS && settings.dither) {
        const threshold =
          (BAYER_4X4[y & 3][x & 3] - 0.5) * (255 / Math.max(2, rampLen));
        lum = Math.min(255, Math.max(0, lum + threshold));
      }

      const clampedLum = Math.min(255, Math.max(0, lum));
      const charIndex = Math.round((clampedLum / 255) * rampLen);

      if (useFS) {
        const quantLum = (charIndex / Math.max(1, rampLen)) * 255;
        const err = clampedLum - quantLum;
        if (x + 1 < cols) errBuf[i + 1] += err * (7 / 16);
        if (y + 1 < rows) {
          if (x > 0) errBuf[i + cols - 1] += err * (3 / 16);
          errBuf[i + cols] += err * (5 / 16);
          if (x + 1 < cols) errBuf[i + cols + 1] += err * (1 / 16);
        }
      }

      const ch = isCutout(clampedLum) ? ' ' : ramp[charIndex] || ' ';
      const [pr, pg, pb] = applyColorPalette(
        rgbBuf[i * 3],
        rgbBuf[i * 3 + 1],
        rgbBuf[i * 3 + 2],
        clampedLum,
        x,
        y,
        cols,
        rows,
        runtime.now,
        settings.colorPalette,
        settings.color,
        settings.tintHex
      );
      rowArr.push({ ch, r: pr, g: pg, b: pb });
    }
    grid.push(rowArr);
  }

  return grid;
}

export function applyPostFx(
  grid: AsciiGrid,
  settings: StudioSettings,
  runtime: RenderFxRuntime
): AsciiGrid {
  const rows = grid.length;
  if (!rows) return grid;
  const cols = grid[0].length;

  const fxElapsed = ((runtime.now - runtime.fxStartTime) / 1000) * settings.fxSpeed;
  const totalCells = rows * cols;
  const scrambleChars = '01#@$%&*+=?/<>ｦｱｳｴｵｶｷｸｹｺ';
  const processedGrid: AsciiGrid = [];

  const glitchSeed = Math.floor(runtime.now / 90);
  const scanRow = Math.floor((fxElapsed * 18) % Math.max(1, rows));
  const rippleAge = (runtime.now - runtime.mouseClickTime) / 1000;

  for (let y = 0; y < rows; y++) {
    const outRow: AsciiCell[] = [];
    let rowShift = 0;

    if (settings.fxMode === 'wave') {
      rowShift = Math.round(
        Math.sin(y * 0.35 + fxElapsed * 5) * 4 * settings.fxIntensity
      );
    } else if (settings.fxMode === 'glitch') {
      const h = Math.sin(y * 12.9898 + glitchSeed * 78.233) * 43758.5453;
      const frac = h - Math.floor(h);
      if (frac < settings.fxIntensity * 0.25) {
        rowShift = Math.round((frac * 40 - 5) * settings.fxIntensity);
      }
    }

    if (runtime.audioActive) {
      if (runtime.audioFxTarget === 'wave' || runtime.audioFxTarget === 'all') {
        rowShift += Math.round(
          Math.sin(y * 0.4 + runtime.now * 0.01) * runtime.audioBass * 6
        );
      }
      if (
        (runtime.audioFxTarget === 'glitch' || runtime.audioFxTarget === 'all') &&
        runtime.audioBass > 0.55
      ) {
        const ah = Math.sin(y * 17.3 + glitchSeed * 41.7) * 43758.5453;
        if (ah - Math.floor(ah) < 0.28) {
          rowShift += Math.round(
            (ah - Math.floor(ah) - 0.14) * 32 * runtime.audioBass
          );
        }
      }
    }

    for (let x = 0; x < cols; x++) {
      let sx = (x - rowShift + cols * 4) % cols;
      let sy = y;

      if (settings.mouseFx === 'repel' && runtime.mouseCol >= 0) {
        const dx = x - runtime.mouseCol;
        const dy = (y - runtime.mouseRow) * 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 10;
        if (dist < radius && dist > 0.1) {
          const push = Math.round(((radius - dist) / radius) * 4);
          sx = Math.max(0, Math.min(cols - 1, Math.round(sx - (dx / dist) * push)));
          sy = Math.max(
            0,
            Math.min(rows - 1, Math.round(sy - (dy / dist) * push * 0.5))
          );
        }
      }

      const cell = grid[sy][sx];
      let cellCh = cell.ch;
      let r = cell.r;
      let g = cell.g;
      let b = cell.b;
      const hasBg = cell.br !== undefined;
      const cellIdx = y * cols + x;

      if (settings.fxMode === 'typewriter') {
        const revealed = Math.floor(fxElapsed * totalCells * 0.45);
        if (cellIdx > revealed) cellCh = ' ';
        else if (cellIdx === revealed) cellCh = '█';
      } else if (settings.fxMode === 'scramble') {
        const progress = Math.min(1, fxElapsed * 0.45);
        const threshold =
          (y / Math.max(1, rows)) * 0.65 + (x / Math.max(1, cols)) * 0.35;
        if (progress < threshold && cellCh !== ' ') {
          cellCh =
            scrambleChars[
              (cellIdx + Math.floor(runtime.now / 50)) % scrambleChars.length
            ];
          r = 74;
          g = 222;
          b = 128;
        }
      } else if (settings.fxMode === 'scanline') {
        if (Math.abs(y - scanRow) <= 1) {
          r = Math.min(255, r + 110);
          g = Math.min(255, g + 160);
          b = Math.min(255, b + 110);
        }
      }

      if (settings.mouseFx === 'spotlight' && runtime.mouseCol >= 0) {
        const dx = x - runtime.mouseCol;
        const dy = (y - runtime.mouseRow) * 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor =
          dist < 12 ? 1.35 : Math.max(0.22, 1 - (dist - 12) / 28);
        r = Math.min(255, Math.round(r * factor));
        g = Math.min(255, Math.round(g * factor));
        b = Math.min(255, Math.round(b * factor));
      }

      if (
        settings.mouseFx === 'ripple' &&
        rippleAge >= 0 &&
        rippleAge < 1.8 &&
        runtime.mouseClickCol >= 0
      ) {
        const dx = x - runtime.mouseClickCol;
        const dy = (y - runtime.mouseClickRow) * 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveR = rippleAge * 28;
        if (Math.abs(dist - waveR) < 2.5) {
          r = 56;
          g = 189;
          b = 248;
          if (cellCh === ' ') cellCh = '·';
        }
      }

      outRow.push(
        hasBg
          ? { ch: cellCh, r, g, b, br: cell.br, bg: cell.bg, bb: cell.bb }
          : { ch: cellCh, r, g, b }
      );
    }
    processedGrid.push(outRow);
  }

  return processedGrid;
}

export function applyTerminalFrame(
  grid: AsciiGrid,
  frameStyle: FrameStyle,
  watermark: string,
  tintHex: string
): AsciiGrid {
  if (frameStyle === 'none' || !grid.length) return grid;

  const innerCols = grid[0].length;
  const tint = hexToRgb(tintHex);
  const mk = (
    ch: string,
    r = tint.r,
    g = tint.g,
    b = tint.b
  ): AsciiCell => ({ ch, r, g, b });

  let tl = '╔';
  let tr = '╗';
  let bl = '╚';
  let br = '╝';
  let hz = '═';
  let vt = '║';

  if (frameStyle === 'single') {
    tl = '┌';
    tr = '┐';
    bl = '└';
    br = '┘';
    hz = '─';
    vt = '│';
  } else if (frameStyle === 'dos') {
    tl = '+';
    tr = '+';
    bl = '+';
    br = '+';
    hz = '-';
    vt = '|';
  } else if (frameStyle === 'macos') {
    tl = '╭';
    tr = '╮';
    bl = '╰';
    br = '╯';
    hz = '─';
    vt = '│';
  }

  const title = watermark.trim();
  const out: AsciiGrid = [];

  const topRow: AsciiCell[] = [mk(tl)];
  for (let x = 0; x < innerCols; x++) topRow.push(mk(hz));
  topRow.push(mk(tr));
  if (title && innerCols > title.length + 4) {
    const label = ` ${title} `;
    const start = Math.floor((innerCols - label.length) / 2) + 1;
    for (let i = 0; i < label.length; i++) {
      topRow[start + i] = mk(label[i]);
    }
  }
  out.push(topRow);

  if (frameStyle === 'macos') {
    const bar: AsciiCell[] = [mk(vt)];
    for (let x = 0; x < innerCols; x++) bar.push(mk(' '));
    bar.push(mk(vt));
    if (innerCols >= 8) {
      bar[2] = mk('●', 239, 68, 68);
      bar[4] = mk('●', 245, 158, 11);
      bar[6] = mk('●', 34, 197, 94);
    }
    out.push(bar);
  }

  for (let y = 0; y < grid.length; y++) {
    out.push([mk(vt), ...grid[y], mk(vt)]);
  }

  const botRow: AsciiCell[] = [mk(bl)];
  for (let x = 0; x < innerCols; x++) botRow.push(mk(hz));
  botRow.push(mk(br));
  out.push(botRow);

  return out;
}

export function gridToPlainAndHtml(
  finalGrid: AsciiGrid,
  useColor: boolean
): { plainText: string; htmlText: string; cols: number; rows: number } {
  const rows = finalGrid.length;
  const cols = rows ? finalGrid[0].length : 0;
  const plainLines: string[] = [];
  const htmlLines: string[] = [];

  for (let y = 0; y < rows; y++) {
    let plainRow = '';
    let htmlRow = '';
    let runStyle = '';
    let runChars = '';

    for (let x = 0; x < cols; x++) {
      const c = finalGrid[y][x];
      plainRow += c.ch;
      if (useColor) {
        const styleStr =
          c.br !== undefined
            ? `color:rgb(${c.r},${c.g},${c.b});background:rgb(${c.br},${c.bg},${c.bb})`
            : `color:rgb(${c.r},${c.g},${c.b})`;
        if (styleStr === runStyle) {
          runChars += escapeHtmlChar(c.ch);
        } else {
          if (runChars) {
            htmlRow += `<span style="${runStyle}">${runChars}</span>`;
          }
          runStyle = styleStr;
          runChars = escapeHtmlChar(c.ch);
        }
      }
    }

    if (useColor && runChars) {
      htmlRow += `<span style="${runStyle}">${runChars}</span>`;
    }
    plainLines.push(plainRow);
    if (useColor) htmlLines.push(htmlRow);
  }

  return {
    plainText: plainLines.join('\n'),
    htmlText: useColor ? htmlLines.join('\n') : '',
    cols,
    rows,
  };
}
