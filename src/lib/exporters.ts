import type {
  AsciiGrid,
  EmbedFormat,
  StudioMode,
  StudioSettings,
} from '../types/studio';
import { escapeXml, hexToRgb } from './color';
import { isColorRenderingEnabled } from './asciiRenderer';

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  } catch {
    return false;
  }
}

export function drawAsciiToCanvas(
  canvas: HTMLCanvasElement,
  grid: AsciiGrid,
  settings: StudioSettings,
  mode: StudioMode,
  fontSize = 12
): void {
  if (!grid.length) return;
  const numRows = grid.length;
  const numCols = grid[0].length;
  const pad = 16;
  const charWidth = fontSize * 0.62;
  const lineHeight = fontSize * 1.12;

  canvas.width = Math.ceil(numCols * charWidth + pad * 2);
  canvas.height = Math.ceil(numRows * lineHeight + pad * 2);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = settings.canvasBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  ctx.textBaseline = 'top';
  ctx.shadowBlur = settings.neonGlow > 0 ? settings.neonGlow * 1.1 : 0;

  const useColor = isColorRenderingEnabled(settings, mode);

  for (let y = 0; y < numRows; y++) {
    const py = pad + y * lineHeight;
    if (useColor) {
      for (let x = 0; x < numCols; x++) {
        const cell = grid[y][x];
        const px = pad + x * charWidth;
        if (cell.br !== undefined) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgb(${cell.br},${cell.bg},${cell.bb})`;
          ctx.fillRect(
            px,
            py,
            Math.ceil(charWidth + 0.5),
            Math.ceil(lineHeight + 0.5)
          );
          ctx.shadowBlur = settings.neonGlow > 0 ? settings.neonGlow * 1.1 : 0;
        }
        const fg = `rgb(${cell.r},${cell.g},${cell.b})`;
        ctx.fillStyle = fg;
        ctx.shadowColor = fg;
        ctx.fillText(cell.ch, px, py);
      }
    } else {
      ctx.fillStyle = settings.tintHex;
      ctx.shadowColor = settings.tintHex;
      ctx.fillText(grid[y].map((c) => c.ch).join(''), pad, py);
    }
  }
  ctx.shadowBlur = 0;
}

export function buildSvgDocument(
  grid: AsciiGrid,
  settings: StudioSettings,
  mode: StudioMode
): string {
  const numRows = grid.length;
  const numCols = numRows ? grid[0].length : 0;
  const fontSize = 12;
  const charW = fontSize * 0.62;
  const lineH = fontSize * 1.15;
  const pad = 16;
  const svgW = Math.ceil(numCols * charW + pad * 2);
  const svgH = Math.ceil(numRows * lineH + pad * 2);
  const useColor = isColorRenderingEnabled(settings, mode);

  let bgRects = '';
  let textNodes = '';

  for (let y = 0; y < numRows; y++) {
    const py = (pad + (y + 1) * lineH - 3).toFixed(1);
    const ry = (pad + y * lineH).toFixed(1);

    if (!useColor) {
      const line = grid[y].map((c) => c.ch).join('');
      textNodes += `  <text x="${pad}" y="${py}" fill="${settings.tintHex}">${escapeXml(
        line
      )}</text>\n`;
    } else {
      let spans = '';
      let runColor = '';
      let runText = '';
      for (let x = 0; x < numCols; x++) {
        const c = grid[y][x];
        if (c.br !== undefined) {
          const rx = (pad + x * charW).toFixed(1);
          bgRects += `  <rect x="${rx}" y="${ry}" width="${(charW + 0.3).toFixed(
            1
          )}" height="${(lineH + 0.3).toFixed(1)}" fill="rgb(${c.br},${c.bg},${
            c.bb
          })"/>\n`;
        }
        const colStr = `rgb(${c.r},${c.g},${c.b})`;
        if (colStr === runColor) {
          runText += c.ch;
        } else {
          if (runText) {
            spans += `<tspan fill="${runColor}">${escapeXml(runText)}</tspan>`;
          }
          runColor = colStr;
          runText = c.ch;
        }
      }
      if (runText) {
        spans += `<tspan fill="${runColor}">${escapeXml(runText)}</tspan>`;
      }
      textNodes += `  <text x="${pad}" y="${py}">${spans}</text>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="100%" height="100%" fill="${settings.canvasBg}" rx="12"/>
${bgRects}  <g font-family="JetBrains Mono, ui-monospace, SFMono-Regular, monospace" font-size="${fontSize}" xml:space="preserve">
${textNodes}  </g>
</svg>`;
}

export function buildStandaloneHtml(
  plainText: string,
  renderedHtml: string,
  settings: StudioSettings,
  mode: StudioMode,
  fontSize: number
): string {
  const useColor = isColorRenderingEnabled(settings, mode);
  const bodyContent = useColor ? renderedHtml : escapeXml(plainText);
  const glowCss =
    settings.neonGlow > 0
      ? `text-shadow:0 0 ${settings.neonGlow}px currentColor,0 0 ${
          settings.neonGlow * 2
        }px currentColor;`
      : '';

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>ASCII Studio Art</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:${settings.canvasBg};color:${settings.tintHex};}
pre{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:${fontSize}px;line-height:${settings.lineHeight};letter-spacing:${settings.letterSpacing}px;${glowCss}margin:24px;}</style>
</head><body><pre>${bodyContent}</pre></body></html>`;
}

export function buildAnsiScript(
  grid: AsciiGrid,
  settings: StudioSettings,
  mode: StudioMode
): string {
  const useColor = isColorRenderingEnabled(settings, mode);
  const esc = '\\x1b';
  const lines: string[] = [];
  const tintRgb = hexToRgb(settings.tintHex);

  for (let y = 0; y < grid.length; y++) {
    let line = '';
    for (let x = 0; x < grid[y].length; x++) {
      const c = grid[y][x];
      const safeCh = c.ch
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "'\\''")
        .replace(/%/g, '%%');
      if (useColor) {
        const bgCode =
          c.br !== undefined ? `${esc}[48;2;${c.br};${c.bg};${c.bb}m` : '';
        line += `${bgCode}${esc}[38;2;${c.r};${c.g};${c.b}m${safeCh}`;
      } else {
        line += `${esc}[38;2;${tintRgb.r};${tintRgb.g};${tintRgb.b}m${safeCh}`;
      }
    }
    lines.push(`printf '${line}${esc}[0m\\n'`);
  }

  return `#!/usr/bin/env bash\n# Generated by ASCII Studio Pro\n${lines.join('\n')}\n`;
}

export function generateEmbedCode(
  plainText: string,
  settings: StudioSettings,
  fontSize: number,
  format: EmbedFormat,
  withAnim: boolean
): string {
  const rawArt = (plainText || 'ASCII STUDIO PRO')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
  const bg = settings.canvasBg;
  const fg = settings.tintHex;
  const fs = Math.max(6, Math.min(16, Math.round(fontSize)));
  const lh = settings.lineHeight;
  const glow = settings.neonGlow > 0 ? `0 0 ${settings.neonGlow}px ${fg}` : 'none';

  if (format === 'react') {
    return `import React${
      withAnim ? ', { useEffect, useState }' : ''
    } from 'react';

const BASE_ART = \`${rawArt}\`;

export default function AsciiArtWidget() {
${
  withAnim
    ? `  const [frame, setFrame] = useState(BASE_ART);

  useEffect(() => {
    const lines = BASE_ART.split('\\n');
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      const animated = lines.map((line, y) => {
        const shift = Math.round(Math.sin(y * 0.35 + tick * 0.25) * 2);
        if (shift === 0) return line;
        const pad = ' '.repeat(Math.abs(shift));
        return shift > 0 ? pad + line.slice(0, -shift) : line.slice(-shift) + pad;
      });
      setFrame(animated.join('\\n'));
    }, 90);
    return () => clearInterval(id);
  }, []);

`
    : ''
}  return (
    <div style={{
      background: '${bg}',
      color: '${fg}',
      padding: '16px',
      borderRadius: '12px',
      overflow: 'auto',
      display: 'inline-block'
    }}>
      <pre style={{
        margin: 0,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '${fs}px',
        lineHeight: ${lh},
        textShadow: '${glow}'
      }}>{${withAnim ? 'frame' : 'BASE_ART'}}</pre>
    </div>
  );
}`;
  }

  const escapedHtml = escapeXml(plainText || 'ASCII STUDIO PRO');
  const animScript = withAnim
    ? `
<script>
(() => {
  const el = document.getElementById('ascii-widget-pre');
  const lines = el.textContent.split('\\n');
  let t = 0;
  setInterval(() => {
    t++;
    el.textContent = lines.map((l, y) => {
      const s = Math.round(Math.sin(y * 0.35 + t * 0.25) * 2);
      return s > 0 ? ' '.repeat(s) + l.slice(0, -s) : s < 0 ? l.slice(-s) + ' '.repeat(-s) : l;
    }).join('\\n');
  }, 90);
})();
<\\/script>`
    : '';

  return `<div style="background:${bg};color:${fg};padding:16px;border-radius:12px;overflow:auto;display:inline-block;">
  <pre id="ascii-widget-pre" style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:${fs}px;line-height:${lh};text-shadow:${glow};">${escapedHtml}</pre>
</div>${animScript}`;
}

/**
 * Pure-JS Minimal GIF89a Encoder (216 Web-Safe Palette + LZW)
 */
export function encodeGif89a(
  frames: Uint8ClampedArray[],
  width: number,
  height: number,
  delayCs = 8
): Blob {
  const bytes: number[] = [];
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };
  const writeU16 = (v: number) => {
    bytes.push(v & 0xff, (v >> 8) & 0xff);
  };

  writeStr('GIF89a');
  writeU16(width);
  writeU16(height);
  bytes.push(0xf7, 0x00, 0x00);

  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        bytes.push(Math.round(r * 51), Math.round(g * 51), Math.round(b * 51));
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const v = Math.round((i / 39) * 255);
    bytes.push(v, v, v);
  }

  bytes.push(0x21, 0xff, 0x0b);
  writeStr('NETSCAPE2.0');
  bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const rgba of frames) {
    bytes.push(0x21, 0xf9, 0x04, 0x04);
    writeU16(delayCs);
    bytes.push(0x00, 0x00);

    bytes.push(0x2c);
    writeU16(0);
    writeU16(0);
    writeU16(width);
    writeU16(height);
    bytes.push(0x00);

    const indexed = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = Math.round(rgba[i * 4] / 51);
      const g = Math.round(rgba[i * 4 + 1] / 51);
      const b = Math.round(rgba[i * 4 + 2] / 51);
      indexed[i] = r * 36 + g * 6 + b;
    }

    bytes.push(8);
    const clearCode = 256;
    const eoiCode = 257;
    let codeSize = 9;
    let nextCode = 258;
    const dict = new Map<number, number>();
    const subBlock: number[] = [];
    let bitBuf = 0;
    let bitCount = 0;

    const emit = (code: number) => {
      bitBuf |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        subBlock.push(bitBuf & 0xff);
        bitBuf >>= 8;
        bitCount -= 8;
        if (subBlock.length === 255) {
          bytes.push(255, ...subBlock);
          subBlock.length = 0;
        }
      }
    };

    emit(clearCode);
    let prefix = indexed[0];
    for (let i = 1; i < indexed.length; i++) {
      const k = indexed[i];
      const key = (prefix << 8) | k;
      const existing = dict.get(key);
      if (existing !== undefined) {
        prefix = existing;
      } else {
        emit(prefix);
        if (nextCode < 4096) {
          dict.set(key, nextCode++);
          if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
        } else {
          emit(clearCode);
          dict.clear();
          codeSize = 9;
          nextCode = 258;
        }
        prefix = k;
      }
    }
    emit(prefix);
    emit(eoiCode);
    if (bitCount > 0) subBlock.push(bitBuf & 0xff);
    if (subBlock.length > 0) bytes.push(subBlock.length, ...subBlock);
    bytes.push(0x00);
  }

  bytes.push(0x3b);
  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}
