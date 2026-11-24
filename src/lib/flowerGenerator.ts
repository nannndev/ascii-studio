import { FLOWER_TEMPLATES, type FlowerTemplateMeta } from '../constants/flowers';
import type { FlowerConfig } from '../types/studio';
import { hexToHsl } from './flowerExtras';

interface BotanicalPalette {
  petalHue: number;
  accentHue: number;
  centerHue: number;
  stemHue: number;
  wrapHue: number;
  wrapSat: number;
  ribbonHue: number;
  ribbonSat: number;
  sat: number;
  lightBoost: number;
  centerSat: number;
  stemSat: number;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  z: number;
  r: number;
  color: string;
}

function getTemplateMeta(id: FlowerConfig['template']): FlowerTemplateMeta {
  return FLOWER_TEMPLATES.find((t) => t.id === id) ?? FLOWER_TEMPLATES[0];
}

function resolvePalette(
  meta: FlowerTemplateMeta,
  config: FlowerConfig
): BotanicalPalette {
  let base: BotanicalPalette;

  switch (config.style) {
    case 'pastel':
      base = {
        petalHue: meta.petalHue,
        accentHue: (meta.accentHue + 18) % 360,
        centerHue: 48,
        stemHue: 148,
        wrapHue: 32,
        wrapSat: 36,
        ribbonHue: 336,
        ribbonSat: 78,
        sat: 72,
        lightBoost: 14,
        centerSat: 82,
        stemSat: 54,
      };
      break;
    case 'neon':
      base = {
        petalHue: (meta.petalHue + 185) % 360,
        accentHue: (meta.petalHue + 285) % 360,
        centerHue: 54,
        stemHue: 174,
        wrapHue: 256,
        wrapSat: 76,
        ribbonHue: 312,
        ribbonSat: 100,
        sat: 100,
        lightBoost: 8,
        centerSat: 100,
        stemSat: 95,
      };
      break;
    case 'sunset':
      base = {
        petalHue: 354,
        accentHue: 34,
        centerHue: 50,
        stemHue: 282,
        wrapHue: 28,
        wrapSat: 48,
        ribbonHue: 348,
        ribbonSat: 92,
        sat: 94,
        lightBoost: 4,
        centerSat: 96,
        stemSat: 68,
      };
      break;
    case 'golden':
      base = {
        petalHue: 42,
        accentHue: 32,
        centerHue: 52,
        stemHue: 36,
        wrapHue: 38,
        wrapSat: 52,
        ribbonHue: 48,
        ribbonSat: 95,
        sat: 92,
        lightBoost: 6,
        centerSat: 95,
        stemSat: 72,
      };
      break;
    case 'matrix':
      base = {
        petalHue: 142,
        accentHue: 156,
        centerHue: 120,
        stemHue: 138,
        wrapHue: 145,
        wrapSat: 64,
        ribbonHue: 128,
        ribbonSat: 96,
        sat: 88,
        lightBoost: 2,
        centerSat: 95,
        stemSat: 80,
      };
      break;
    case 'monochrome':
    case 'sumie':
      base = {
        petalHue: 0,
        accentHue: 0,
        centerHue: 0,
        stemHue: 0,
        wrapHue: 0,
        wrapSat: 0,
        ribbonHue: 0,
        ribbonSat: 0,
        sat: 0,
        lightBoost: 4,
        centerSat: 0,
        stemSat: 0,
      };
      break;
    case 'colorful':
    default:
      base = {
        petalHue: meta.petalHue,
        accentHue: meta.accentHue,
        centerHue: meta.centerHue,
        stemHue: meta.stemHue,
        wrapHue: 34,
        wrapSat: 42,
        ribbonHue: 346,
        ribbonSat: 86,
        sat: 90,
        lightBoost: 2,
        centerSat: 94,
        stemSat: 72,
      };
      break;
  }

  if (config.customColorsEnabled) {
    const p = hexToHsl(config.customPetalHex);
    const r = hexToHsl(config.customRibbonHex);
    const w = hexToHsl(config.customWrapHex);
    return {
      ...base,
      petalHue: p.h,
      accentHue: (p.h + 338) % 360,
      sat: Math.max(12, p.s),
      lightBoost: Math.round((p.l - 54) * 0.45),
      ribbonHue: r.h,
      ribbonSat: Math.max(15, r.s),
      wrapHue: w.h,
      wrapSat: Math.max(8, w.s),
    };
  }

  return base;
}

function clampLight(v: number): number {
  return Math.max(14, Math.min(97, Math.round(v)));
}

function hsl(h: number, s: number, l: number, a = 1): string {
  const hue = ((Math.round(h) % 360) + 360) % 360;
  const light = clampLight(l);
  return a < 1
    ? `hsla(${hue}, ${Math.round(s)}%, ${light}%, ${a.toFixed(2)})`
    : `hsl(${hue}, ${Math.round(s)}%, ${light}%)`;
}

function computeEffectiveBloom(
  config: FlowerConfig,
  t: number,
  audioEnergy: number
): number {
  let b = config.bloom;
  if (config.autoBloom) {
    const wave = 0.5 + 0.5 * Math.sin(t * 1.15 - Math.PI / 2);
    b = 0.28 + wave * 0.72;
  }
  if (config.audioBloom && audioEnergy > 0.01) {
    b = Math.min(1.12, b * 0.72 + 0.22 + audioEnergy * 0.55);
  }
  return b;
}

// ============================================================
// 3D PARAMETRIC BOTANICAL, BOUQUET, VASE & DOME ENGINE
// ============================================================
function drawFlower3D(
  canvas: HTMLCanvasElement,
  config: FlowerConfig,
  rotX: number,
  rotY: number,
  now: number,
  audioEnergy: number
): void {
  const resScale =
    config.quality === '4k' ? 2.0 : config.quality === 'hd' ? 1.5 : 1.0;
  const is4k = config.quality === '4k';
  const arrangement =
    config.template === 'bouquet' && config.arrangement === 'single'
      ? 'bouquet'
      : config.arrangement;

  canvas.width = Math.round(360 * resScale);
  canvas.height = Math.round(280 * resScale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#030306';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const meta = getTemplateMeta(config.template);
  const pal = resolvePalette(meta, config);
  const t = now * 0.0014;
  const bloom = computeEffectiveBloom(config, t, audioEnergy);
  const audioPulse = config.audioBloom ? audioEnergy * 16 : 0;
  const sway =
    config.windSway && arrangement !== 'dome' ? Math.sin(t * 1.7) * 0.12 : 0;

  const effRotX = rotX + (config.windSway ? Math.sin(t * 1.1) * 0.04 : 0);
  const effRotY = rotY;
  const cosX = Math.cos(effRotX);
  const sinX = Math.sin(effRotX);
  const cosY = Math.cos(effRotY);
  const sinY = Math.sin(effRotY);

  const points: ProjectedPoint[] = [];
  const cx = canvas.width / 2;
  const cy =
    canvas.height / 2 +
    (arrangement === 'bouquet' || arrangement === 'vase' || arrangement === 'dome'
      ? 6 * resScale
      : config.showStem
      ? -8 * resScale
      : 2 * resScale);
  const projFocal =
    (arrangement === 'bouquet' || arrangement === 'dome' ? 260 : 286) * resScale;

  const pushPoint = (
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    hue: number,
    sat: number,
    baseLight: number,
    radius = 4.2,
    alpha = 1
  ) => {
    const heightWeight = Math.max(0, (1.4 - y) * 0.3);
    const sx0 = x + sway * heightWeight;

    const x1 = sx0 * cosY + z * sinY;
    const z1 = -sx0 * sinY + z * cosY;
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const nx1 = nx * cosY + nz * sinY;
    const nz1 = -nx * sinY + nz * cosY;
    const ny2 = ny * cosX - nz1 * sinX;
    const nz2 = ny * sinX + nz1 * cosX;

    const diff = nx1 * 0.42 - ny2 * 0.56 + nz2 * 0.72;
    const spec = Math.pow(Math.max(0, nz2 * 0.75 - ny2 * 0.45), 4) * 0.24;
    const rim = Math.pow(1 - Math.min(1, Math.abs(nz2)), 2) * 0.24;
    const lum = Math.max(0.18, Math.min(1.26, 0.34 + diff * 0.64 + rim + spec));

    const depth = z2 + 4.45;
    if (depth <= 0.5) return;
    const scale = projFocal / depth;
    const pr = Math.max(1.3 * resScale, (radius * scale) / 68);
    points.push({
      sx: cx + x1 * scale,
      sy: cy + y2 * scale,
      z: z2,
      r: pr,
      color: hsl(hue, sat, baseLight * lum + pal.lightBoost + audioPulse * 0.4, alpha),
    });
  };

  const addStemAndLeaves = (
    originX: number,
    originY: number,
    originZ: number,
    length: number,
    leafScale = 1
  ) => {
    const steps = is4k ? 34 : 22;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const sx = originX + Math.sin(f * 2.1) * 0.14;
      const sy = originY + f * length;
      const sz = originZ + Math.cos(f * 1.8) * 0.08;
      pushPoint(sx, sy, sz, 0.3, -0.2, 0.9, pal.stemHue, pal.stemSat, 52, 3.8);
    }

    [-1, 1].forEach((side, idx) => {
      const attachY = originY + length * (idx === 0 ? 0.42 : 0.62);
      const attachX =
        originX + Math.sin((idx === 0 ? 0.42 : 0.62) * 2.1) * 0.14;
      const uStep = is4k ? 0.08 : 0.12;
      const vStep = is4k ? 0.34 : 0.5;
      for (let u = 0.08; u <= 1; u += uStep) {
        const halfW = Math.sin(u * Math.PI) * 0.28 * leafScale;
        for (let v = -1; v <= 1; v += vStep) {
          const lx = attachX + side * (u * 0.88 * leafScale);
          const ly =
            attachY - Math.sin(u * Math.PI * 0.8) * 0.18 * leafScale + u * 0.12;
          const lz = originZ + v * halfW + side * 0.12 * u;
          pushPoint(
            lx,
            ly,
            lz,
            side * 0.25,
            -0.8,
            0.55,
            pal.stemHue + (1 - u) * 10,
            pal.stemSat,
            56 + (1 - Math.abs(v)) * 12,
            3.4
          );
        }
      }
    });
  };

  interface BlossomOpts {
    layers: number;
    petalsPerLayer: number;
    petalLen: number;
    petalWidth: number;
    cupDepth: number;
    curlBack: number;
    stamenRadius: number;
    notched?: boolean;
    pointed?: boolean;
    hueA: number;
    hueB: number;
    scale?: number;
    tiltX?: number;
    tiltZ?: number;
    densityScale?: number;
  }

  const addBlossomHead = (
    ox: number,
    oy: number,
    oz: number,
    opts: BlossomOpts
  ) => {
    const sc = opts.scale ?? 1;
    const tX = opts.tiltX ?? 0;
    const tZ = opts.tiltZ ?? 0;
    const cTX = Math.cos(tX);
    const sTX = Math.sin(tX);
    const cTZ = Math.cos(tZ);
    const sTZ = Math.sin(tZ);
    const dens =
      (opts.densityScale ?? 1) *
      (is4k ? 1.45 : config.quality === 'hd' ? 1.2 : 1.0);

    const emitLocal = (
      lx: number,
      ly: number,
      lz: number,
      nx: number,
      ny: number,
      nz: number,
      h: number,
      s: number,
      l: number,
      rad: number
    ) => {
      const y1 = ly * cTX - lz * sTX;
      const z1 = ly * sTX + lz * cTX;
      const x2 = lx * cTZ - y1 * sTZ;
      const y2 = lx * sTZ + y1 * cTZ;

      const ny1 = ny * cTX - nz * sTX;
      const nz1 = ny * sTX + nz * cTX;
      const nx2 = nx * cTZ - ny1 * sTZ;
      const ny2 = nx * sTZ + ny1 * cTZ;

      pushPoint(
        ox + x2 * sc,
        oy + y2 * sc,
        oz + z1 * sc,
        nx2,
        ny2,
        nz1,
        h,
        s,
        l,
        rad * Math.max(0.62, sc)
      );
    };

    const centerCount = Math.max(
      14,
      Math.round(opts.stamenRadius * 125 * Math.min(1.5, dens))
    );
    const goldenAngle = 2.3999632;
    for (let i = 0; i < centerCount; i++) {
      const f = (i + 0.5) / centerCount;
      const rad = Math.sqrt(f) * opts.stamenRadius;
      const ang = i * goldenAngle;
      const lx = Math.cos(ang) * rad;
      const lz = Math.sin(ang) * rad;
      const ly = -Math.sqrt(Math.max(0, 1 - f)) * opts.stamenRadius * 0.55;
      emitLocal(
        lx,
        ly,
        lz,
        lx * 0.8,
        -0.9,
        lz * 0.8,
        pal.centerHue + f * 12,
        pal.centerSat,
        68 - f * 14,
        is4k ? 3.3 : 3.9
      );
    }

    const uSteps = Math.max(5, Math.round(7 * dens));
    const vSteps = Math.max(3, Math.round(4 * Math.min(1.35, dens)));
    const ptRad = is4k ? 3.4 : 4.1;

    for (let layer = 0; layer < opts.layers; layer++) {
      const layerFrac = opts.layers === 1 ? 1 : layer / (opts.layers - 1);
      const count = Math.max(
        3,
        Math.round(opts.petalsPerLayer * (0.65 + layerFrac * 0.45))
      );
      const angleOffset = layer * 1.18;
      const layerOpen =
        (0.26 + bloom * 0.74) * (0.42 + layerFrac * 0.68);
      const len = opts.petalLen * (0.58 + layerFrac * 0.52);

      for (let p = 0; p < count; p++) {
        const theta = (p / count) * Math.PI * 2 + angleOffset;
        const cTh = Math.cos(theta);
        const sTh = Math.sin(theta);

        for (let ui = 1; ui <= uSteps; ui++) {
          const u = ui / uSteps;
          const profile = opts.pointed
            ? Math.sin(u * Math.PI) * (1 - u * 0.35)
            : Math.sin(Math.pow(u, 0.78) * Math.PI);
          const halfW = profile * opts.petalWidth * (0.65 + layerFrac * 0.4);

          for (let vi = -vSteps; vi <= vSteps; vi++) {
            const vn = vi / vSteps;
            if (opts.notched && u > 0.82 && Math.abs(vn) < 0.24) continue;

            const rDist =
              opts.stamenRadius * 0.55 + u * len * layerOpen;
            const cupY =
              -Math.pow(u, 1.35) *
                opts.cupDepth *
                (1.15 - bloom * 0.55) +
              Math.pow(u, 2.4) * opts.curlBack * bloom -
              (1 - vn * vn) * 0.08 * u;

            const radialX = rDist;
            const perpZ = vn * halfW;

            const lx = radialX * cTh - perpZ * sTh;
            const lz = radialX * sTh + perpZ * cTh;
            const ly = cupY + layerFrac * 0.1;

            const nx = cTh * 0.45 - sTh * vn * 0.35;
            const nz = sTh * 0.45 + cTh * vn * 0.35;
            const ny = -0.82 + u * 0.35;

            const hue =
              opts.hueA +
              (opts.hueB - opts.hueA) * u +
              layerFrac * 8;
            const light =
              44 + u * 34 + (1 - Math.abs(vn)) * 10 - (1 - layerFrac) * 8;

            emitLocal(lx, ly, lz, nx, ny, nz, hue, pal.sat, light, ptRad);
          }
        }
      }
    }
  };

  const getFlowerDna = (
    tpl: FlowerConfig['template'],
    hueA: number,
    hueB: number
  ): Omit<BlossomOpts, 'scale' | 'tiltX' | 'tiltZ' | 'densityScale'> => {
    const pCount = config.petalCount;
    switch (tpl) {
      case 'tulip':
        return {
          layers: 2,
          petalsPerLayer: Math.max(5, Math.min(7, pCount)),
          petalLen: 0.88,
          petalWidth: 0.46,
          cupDepth: 1.08,
          curlBack: 0.08,
          stamenRadius: 0.16,
          hueA,
          hueB,
        };
      case 'sunflower':
        return {
          layers: 2,
          petalsPerLayer: Math.max(12, Math.min(18, pCount)),
          petalLen: 0.88,
          petalWidth: 0.21,
          cupDepth: 0.18,
          curlBack: 0.2,
          stamenRadius: 0.46,
          pointed: true,
          hueA,
          hueB,
        };
      case 'sakura':
        return {
          layers: 1,
          petalsPerLayer: 5,
          petalLen: 0.9,
          petalWidth: 0.44,
          cupDepth: 0.34,
          curlBack: 0.15,
          stamenRadius: 0.2,
          notched: true,
          hueA,
          hueB,
        };
      case 'lotus':
        return {
          layers: 3,
          petalsPerLayer: Math.max(6, Math.round(pCount * 0.7)),
          petalLen: 0.92,
          petalWidth: 0.33,
          cupDepth: 0.78,
          curlBack: 0.16,
          stamenRadius: 0.25,
          pointed: true,
          hueA,
          hueB,
        };
      case 'daisy':
        return {
          layers: 2,
          petalsPerLayer: Math.max(10, Math.min(16, pCount)),
          petalLen: 0.92,
          petalWidth: 0.19,
          cupDepth: 0.14,
          curlBack: 0.22,
          stamenRadius: 0.34,
          hueA,
          hueB,
        };
      case 'neon_lily':
        return {
          layers: 2,
          petalsPerLayer: 6,
          petalLen: 1.04,
          petalWidth: 0.27,
          cupDepth: 0.52,
          curlBack: 0.52,
          stamenRadius: 0.2,
          pointed: true,
          hueA,
          hueB,
        };
      case 'hibiscus':
        return {
          layers: 1,
          petalsPerLayer: 5,
          petalLen: 0.98,
          petalWidth: 0.54,
          cupDepth: 0.42,
          curlBack: 0.32,
          stamenRadius: 0.22,
          hueA,
          hueB,
        };
      case 'orchid':
        return {
          layers: 1,
          petalsPerLayer: 5,
          petalLen: 0.98,
          petalWidth: 0.48,
          cupDepth: 0.24,
          curlBack: 0.26,
          stamenRadius: 0.24,
          hueA,
          hueB,
        };
      case 'rose':
      default:
        return {
          layers: 3,
          petalsPerLayer: Math.max(5, Math.min(9, Math.round(pCount * 0.7))),
          petalLen: 0.88,
          petalWidth: 0.44,
          cupDepth: 0.85,
          curlBack: 0.38,
          stamenRadius: 0.18,
          hueA,
          hueB,
        };
    }
  };

  // Sculpted 3D Florist Bouquet Wrapper
  const add3DBouquetWrapper = () => {
    const leafCount = 7;
    const leafStep = is4k ? 0.1 : 0.15;
    for (let k = 0; k < leafCount; k++) {
      const ang = (k / leafCount) * Math.PI * 2 + 0.22;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      for (let u = 0.2; u <= 1; u += leafStep) {
        const halfW = Math.sin(u * Math.PI) * 0.24;
        const rDist = 0.55 + u * 0.85;
        const ly = -0.18 - Math.sin(u * Math.PI * 0.7) * 0.24 + u * 0.14;
        for (let v = -1; v <= 1; v += 0.5) {
          const lx = ca * rDist - sa * v * halfW;
          const lz = sa * rDist + ca * v * halfW;
          pushPoint(
            lx,
            ly,
            lz,
            ca * 0.4,
            -0.75,
            sa * 0.4,
            pal.stemHue + u * 10,
            pal.stemSat,
            48 + (1 - Math.abs(v)) * 14,
            is4k ? 3.2 : 3.8
          );
        }
      }
    }

    const rows = is4k ? 22 : 14;
    const cols = is4k ? 34 : 24;
    for (let ri = 0; ri <= rows; ri++) {
      const f = ri / rows;
      const y = -0.22 + f * 1.18;
      const waist = Math.abs(f - 0.72);
      const baseR =
        f < 0.72
          ? 0.24 + Math.pow(1 - f / 0.72, 1.15) * 0.84
          : 0.24 + (f - 0.72) * 0.52;

      for (let ci = 0; ci < cols; ci++) {
        const a = (ci / cols) * Math.PI * 2;
        const pleat = Math.sin(a * 7) * 0.08 * (1 - f * 0.65);
        const collarRuffle =
          f < 0.18 ? Math.sin(a * 5 + 0.5) * 0.07 * (1 - f / 0.18) : 0;
        const r = baseR + pleat;
        const px = Math.cos(a) * r;
        const pz = Math.sin(a) * r;
        const py = y - collarRuffle;
        const shade =
          f < 0.14 ? 84 : 58 + Math.sin(a * 7) * 10 + (1 - waist) * 6;

        pushPoint(
          px,
          py,
          pz,
          Math.cos(a),
          -0.25,
          Math.sin(a),
          pal.wrapHue + (f < 0.14 ? 6 : 0),
          pal.wrapSat,
          shade,
          is4k ? 3.4 : 4.2
        );
      }
    }

    for (let s = 0; s < 5; s++) {
      const sa = (s / 5) * Math.PI * 2;
      for (let i = 0; i <= 8; i++) {
        const f = i / 8;
        const rad = 0.06 + f * 0.08;
        pushPoint(
          Math.cos(sa) * rad,
          0.92 + f * 0.42,
          Math.sin(sa) * rad,
          Math.cos(sa),
          0,
          Math.sin(sa),
          pal.stemHue,
          pal.stemSat,
          44 + f * 8,
          3.4
        );
      }
    }

    const ribbonY = 0.62;
    const bandSteps = is4k ? 32 : 22;
    for (let i = 0; i < bandSteps; i++) {
      const a = (i / bandSteps) * Math.PI * 2;
      for (let dy = -0.05; dy <= 0.05; dy += 0.05) {
        pushPoint(
          Math.cos(a) * 0.29,
          ribbonY + dy,
          Math.sin(a) * 0.29,
          Math.cos(a),
          0,
          Math.sin(a),
          pal.ribbonHue,
          pal.ribbonSat,
          68,
          is4k ? 3.3 : 3.9
        );
      }
    }
    [-1, 1].forEach((side) => {
      for (let u = 0; u <= 1; u += is4k ? 0.06 : 0.1) {
        const loopAng = u * Math.PI * 2;
        const lx = side * (0.12 + Math.sin(loopAng * 0.5) * 0.34);
        const ly = ribbonY + Math.sin(loopAng) * 0.14;
        const lz = 0.34 + Math.sin(loopAng * 0.5) * 0.14;
        pushPoint(
          lx,
          ly,
          lz,
          side * 0.3,
          -0.2,
          0.95,
          pal.ribbonHue,
          pal.ribbonSat,
          76,
          is4k ? 3.2 : 3.8
        );
      }
      for (let u = 0; u <= 1; u += is4k ? 0.08 : 0.12) {
        const tx = side * (0.08 + u * 0.26 + Math.sin(u * 4) * 0.04);
        const ty = ribbonY + 0.06 + u * 0.54;
        const tz = 0.35 + Math.cos(u * 3) * 0.08;
        pushPoint(
          tx,
          ty,
          tz,
          side * 0.2,
          0,
          0.95,
          pal.ribbonHue + 6,
          pal.ribbonSat,
          70 - u * 10,
          is4k ? 3.1 : 3.7
        );
      }
    });
  };

  // Sculpted 3D Lathe-Turned Glass/Ceramic Vase
  const add3DVase = () => {
    const rows = is4k ? 24 : 16;
    const cols = is4k ? 34 : 24;
    for (let ri = 0; ri <= rows; ri++) {
      const f = ri / rows; // 0 = flared top lip, 1 = flat base
      const y = 0.14 + f * 1.06;
      // Classic amphora / tulip vase profile
      let r = 0.34;
      if (f < 0.14) {
        r = 0.42 - (f / 0.14) * 0.12; // flared lip -> neck
      } else if (f < 0.72) {
        const b = (f - 0.14) / 0.58;
        r = 0.3 + Math.sin(b * Math.PI) * 0.38; // rounded belly
      } else {
        const b = (f - 0.72) / 0.28;
        r = 0.3 + (1 - b) * 0.12; // graceful foot
      }

      for (let ci = 0; ci < cols; ci++) {
        const a = (ci / cols) * Math.PI * 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        // Bright vertical glass reflection streak + rim highlight
        const isHighlight = Math.abs(a - 0.85) < 0.22 || Math.abs(a - 3.9) < 0.18;
        const isRim = f < 0.06 || f > 0.94;
        const isWaterLine = Math.abs(f - 0.36) < 0.04;
        const hue = isWaterLine ? 196 : pal.wrapHue;
        const sat =
          pal.sat === 0 ? 0 : isWaterLine ? 72 : Math.max(24, pal.wrapSat);
        const light = isRim
          ? 86
          : isHighlight
          ? 84
          : isWaterLine
          ? 70
          : 44 + Math.sin(f * Math.PI) * 16;

        pushPoint(
          ca * r,
          y,
          sa * r,
          ca,
          0,
          sa,
          hue,
          sat,
          light,
          is4k ? 3.2 : 3.9
        );
      }
    }
  };

  // Sculpted 3D Enchanted Glass Dome / Terrarium Bell Jar
  const add3DGlassDome = () => {
    // 1. Ornate circular wooden/brass pedestal base
    const baseCols = is4k ? 36 : 26;
    for (let ring = 0; ring <= 4; ring++) {
      const f = ring / 4;
      const y = 0.94 + f * 0.24;
      const r = 1.06 + (f > 0.5 ? 0.1 : 0);
      for (let ci = 0; ci < baseCols; ci++) {
        const a = (ci / baseCols) * Math.PI * 2;
        pushPoint(
          Math.cos(a) * r,
          y,
          Math.sin(a) * r,
          Math.cos(a),
          ring === 0 ? -0.8 : 0.1,
          Math.sin(a),
          ring === 0 ? pal.ribbonHue : 28,
          pal.sat > 0 ? (ring === 0 ? 74 : 42) : 0,
          ring === 0 ? 74 : 44,
          is4k ? 3.5 : 4.2
        );
      }
    }

    // Fill pedestal top surface subtly
    for (let rad = 0.2; rad <= 0.98; rad += 0.22) {
      for (let a = 0; a < Math.PI * 2; a += 0.45) {
        pushPoint(
          Math.cos(a) * rad,
          0.94,
          Math.sin(a) * rad,
          0,
          -1,
          0,
          28,
          pal.sat > 0 ? 35 : 0,
          36,
          3.4
        );
      }
    }

    // 2. Translucent 3D Crystal Bell-Jar Glass Shell (curved arcs & specular ridges)
    const domeR = 1.02;
    const domeTopY = -0.32;
    // Vertical meridian crystal ribs & bright specular streaks
    const meridians = is4k ? 14 : 10;
    for (let m = 0; m < meridians; m++) {
      const a = (m / meridians) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const isSpecular = m === 1 || m === 2 || m === Math.floor(meridians / 2) + 1;

      // Cylindrical glass wall (y = 0.92 up to domeTopY)
      for (let y = 0.9; y >= domeTopY; y -= is4k ? 0.08 : 0.12) {
        pushPoint(
          ca * domeR,
          y,
          sa * domeR,
          ca,
          0,
          sa,
          198,
          pal.sat > 0 ? 52 : 0,
          isSpecular ? 88 : 56,
          isSpecular ? (is4k ? 2.8 : 3.3) : (is4k ? 1.8 : 2.2),
          isSpecular ? 0.9 : 0.45
        );
      }

      // Hemisphere glass crown
      for (let phi = 0.1; phi <= Math.PI / 2; phi += is4k ? 0.1 : 0.15) {
        const cr = Math.cos(phi) * domeR;
        const cy2 = domeTopY - Math.sin(phi) * domeR * 0.95;
        pushPoint(
          ca * cr,
          cy2,
          sa * cr,
          ca * Math.cos(phi),
          -Math.sin(phi),
          sa * Math.cos(phi),
          198,
          pal.sat > 0 ? 58 : 0,
          isSpecular ? 92 : 60,
          isSpecular ? (is4k ? 2.8 : 3.3) : (is4k ? 1.8 : 2.2),
          isSpecular ? 0.92 : 0.48
        );
      }
    }

    // Horizontal rim & crown glass rings for unmistakable bell-jar silhouette
    [0.86, 0.25, -0.32].forEach((ry, idx) => {
      const step = is4k ? 0.14 : 0.22;
      for (let a = 0; a < Math.PI * 2; a += step) {
        pushPoint(
          Math.cos(a) * domeR,
          ry,
          Math.sin(a) * domeR,
          Math.cos(a),
          0,
          Math.sin(a),
          196,
          pal.sat > 0 ? 55 : 0,
          idx === 0 ? 78 : 64,
          is4k ? 2.1 : 2.5,
          0.55
        );
      }
    });

    // Little glass knob finial on top of dome
    pushPoint(0, domeTopY - domeR * 0.98 - 0.08, 0, 0, -1, 0.5, 198, pal.sat > 0 ? 45 : 0, 92, 4.4);
  };

  // ============================================================
  // DISPATCH BY ARRANGEMENT: BOUQUET / VASE / DOME / SINGLE
  // ============================================================
  if (arrangement === 'bouquet') {
    const isMixedGrand = config.template === 'bouquet';
    const slots: {
      x: number;
      y: number;
      z: number;
      sc: number;
      tx: number;
      tz: number;
      tpl: FlowerConfig['template'];
      hueShift: number;
    }[] = [
      { x: 0, y: -0.78, z: 0.04, sc: 0.72, tx: 0.08, tz: 0, tpl: isMixedGrand ? 'rose' : config.template, hueShift: 0 },
      { x: -0.58, y: -0.52, z: 0.26, sc: 0.62, tx: 0.32, tz: -0.42, tpl: isMixedGrand ? 'sunflower' : config.template, hueShift: isMixedGrand ? 58 : -10 },
      { x: 0.58, y: -0.54, z: 0.22, sc: 0.62, tx: 0.3, tz: 0.42, tpl: isMixedGrand ? 'tulip' : config.template, hueShift: isMixedGrand ? 238 : 12 },
      { x: -0.44, y: -0.58, z: -0.46, sc: 0.58, tx: -0.38, tz: -0.3, tpl: isMixedGrand ? 'sakura' : config.template, hueShift: isMixedGrand ? 344 : 6 },
      { x: 0.46, y: -0.56, z: -0.44, sc: 0.58, tx: -0.36, tz: 0.32, tpl: isMixedGrand ? 'daisy' : config.template, hueShift: isMixedGrand ? 196 : -14 },
      { x: -0.18, y: -0.32, z: 0.56, sc: 0.54, tx: 0.55, tz: -0.14, tpl: isMixedGrand ? 'rose' : config.template, hueShift: isMixedGrand ? 316 : 8 },
      { x: 0.28, y: -0.34, z: 0.52, sc: 0.52, tx: 0.52, tz: 0.22, tpl: isMixedGrand ? 'lotus' : config.template, hueShift: isMixedGrand ? 276 : -6 },
    ];

    slots.forEach((slot) => {
      const dna = getFlowerDna(
        slot.tpl,
        (pal.accentHue + slot.hueShift) % 360,
        (pal.petalHue + slot.hueShift) % 360
      );
      addBlossomHead(slot.x, slot.y, slot.z, {
        ...dna,
        scale: slot.sc,
        tiltX: slot.tx,
        tiltZ: slot.tz,
        densityScale: 0.74,
      });
    });

    const fillerCount = is4k ? 44 : 28;
    for (let i = 0; i < fillerCount; i++) {
      const ang = i * 2.39996;
      const rad = 0.28 + ((i % 7) / 7) * 0.72;
      const fx = Math.cos(ang) * rad;
      const fz = Math.sin(ang) * rad;
      const fy = -0.38 - Math.cos(rad * 1.4) * 0.44;
      pushPoint(
        fx,
        fy,
        fz,
        0,
        -0.8,
        0.6,
        pal.centerHue,
        pal.sat > 0 ? 22 : 0,
        92,
        is4k ? 2.6 : 3.2
      );
    }

    if (config.showStem) add3DBouquetWrapper();
  } else if (arrangement === 'vase') {
    // 3 graceful stems rising from sculpted 3D vase
    const vaseSlots = [
      { x: 0, y: -0.78, z: 0, sc: 0.78, tx: 0.14, tz: 0, shift: 0 },
      { x: -0.58, y: -0.46, z: 0.16, sc: 0.62, tx: 0.22, tz: -0.38, shift: -12 },
      { x: 0.56, y: -0.5, z: -0.12, sc: 0.62, tx: -0.12, tz: 0.36, shift: 14 },
    ];
    vaseSlots.forEach((s) => {
      const dna = getFlowerDna(
        config.template === 'bouquet' ? 'rose' : config.template,
        (pal.accentHue + s.shift) % 360,
        (pal.petalHue + s.shift) % 360
      );
      addBlossomHead(s.x, s.y, s.z, {
        ...dna,
        scale: s.sc,
        tiltX: s.tx,
        tiltZ: s.tz,
        densityScale: 0.85,
      });
      // Connecting stem down into vase neck
      for (let i = 0; i <= 14; i++) {
        const f = i / 14;
        pushPoint(
          s.x * (1 - f * 0.88),
          s.y + 0.16 + f * (0.28 - s.y),
          s.z * (1 - f * 0.88),
          0.2,
          -0.2,
          0.9,
          pal.stemHue,
          pal.stemSat,
          52,
          3.4
        );
      }
    });
    if (config.showStem) add3DVase();
  } else if (arrangement === 'dome') {
    // Hero enchanted flower suspended inside 3D Glass Dome Terrarium
    const dna = getFlowerDna(
      config.template === 'bouquet' ? 'rose' : config.template,
      pal.accentHue,
      pal.petalHue
    );
    addBlossomHead(0, -0.34, 0, {
      ...dna,
      scale: 0.76,
      tiltX: 0.16,
      densityScale: 0.95,
    });
    addStemAndLeaves(0, -0.18, 0, 1.08, 0.72);
    // Enchanted fallen petals resting on wooden base inside dome
    for (let k = 0; k < 5; k++) {
      const a = k * 1.25 + 0.4;
      pushPoint(
        Math.cos(a) * (0.36 + (k % 2) * 0.24),
        0.9,
        Math.sin(a) * (0.36 + (k % 2) * 0.24),
        0,
        -1,
        0,
        pal.petalHue,
        pal.sat,
        74,
        3.6
      );
    }
    if (config.showStem) add3DGlassDome();
  } else {
    // SINGLE SCULPTED 3D FLOWER TEMPLATE
    const pCount = config.petalCount;
    const stemTopY = config.showStem ? -0.35 : 0.08;

    if (config.template === 'rose') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 4,
        petalsPerLayer: Math.max(5, Math.round(pCount * 0.65)),
        petalLen: 1.15,
        petalWidth: 0.52,
        cupDepth: 1.05,
        curlBack: 0.46,
        stamenRadius: 0.22,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
      });
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.18, 0, 1.45, 1.0);
    } else if (config.template === 'lotus') {
      addBlossomHead(0, stemTopY + 0.1, 0, {
        layers: 3,
        petalsPerLayer: Math.max(6, Math.round(pCount * 0.8)),
        petalLen: 1.25,
        petalWidth: 0.38,
        cupDepth: 0.95,
        curlBack: 0.18,
        stamenRadius: 0.34,
        pointed: true,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
      });
      if (config.showStem) {
        for (let ring = 1; ring <= 2; ring++) {
          const rad = 0.95 + ring * 0.42;
          const aStep = is4k ? 0.11 : 0.18;
          for (let a = 0; a < Math.PI * 2; a += aStep) {
            pushPoint(
              Math.cos(a) * rad,
              stemTopY + 0.42,
              Math.sin(a) * rad,
              0,
              -1,
              0,
              pal.stemHue + ring * 18,
              pal.stemSat,
              ring === 1 ? 52 : 38,
              3.4
            );
          }
        }
      }
    } else if (config.template === 'sakura') {
      if (config.showStem) {
        const bSteps = is4k ? 44 : 28;
        for (let i = 0; i <= bSteps; i++) {
          const f = i / bSteps;
          const bx = -1.4 + f * 2.8;
          const by = 0.85 - f * 1.45 + Math.sin(f * 3.5) * 0.16;
          const bz = Math.cos(f * 2.5) * 0.2;
          pushPoint(bx, by, bz, 0.2, -0.5, 0.8, 26, pal.sat > 0 ? 48 : 0, 44, 4.0);
        }
      }
      const blooms = [
        { x: -0.52, y: 0.2, z: 0.18, sc: 0.68, tx: 0.35, tz: -0.3 },
        { x: 0.18, y: -0.25, z: -0.1, sc: 0.86, tx: 0.15, tz: 0.18 },
        { x: 0.82, y: -0.58, z: 0.22, sc: 0.62, tx: -0.2, tz: 0.42 },
      ];
      blooms.forEach((b) => {
        addBlossomHead(b.x, b.y, b.z, {
          layers: 1,
          petalsPerLayer: Math.max(5, Math.min(8, pCount)),
          petalLen: 0.95,
          petalWidth: 0.44,
          cupDepth: 0.38,
          curlBack: 0.16,
          stamenRadius: 0.22,
          notched: true,
          hueA: pal.accentHue,
          hueB: pal.petalHue,
          scale: b.sc,
          tiltX: b.tx,
          tiltZ: b.tz,
        });
      });
    } else if (config.template === 'sunflower') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 2,
        petalsPerLayer: Math.max(12, pCount),
        petalLen: 1.15,
        petalWidth: 0.25,
        cupDepth: 0.22,
        curlBack: 0.24,
        stamenRadius: 0.62,
        pointed: true,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
        tiltX: 0.38,
      });
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.32, -0.1, 1.38, 1.15);
    } else if (config.template === 'tulip') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 2,
        petalsPerLayer: Math.max(4, Math.min(8, pCount)),
        petalLen: 1.12,
        petalWidth: 0.56,
        cupDepth: 1.35,
        curlBack: 0.08,
        stamenRadius: 0.2,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
      });
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.2, 0, 1.48, 1.25);
    } else if (config.template === 'daisy') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 2,
        petalsPerLayer: Math.max(10, pCount),
        petalLen: 1.28,
        petalWidth: 0.22,
        cupDepth: 0.15,
        curlBack: 0.28,
        stamenRadius: 0.42,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
        tiltX: 0.25,
      });
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.22, 0, 1.42, 0.9);
    } else if (config.template === 'orchid') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 1,
        petalsPerLayer: 5,
        petalLen: 1.35,
        petalWidth: 0.62,
        cupDepth: 0.24,
        curlBack: 0.3,
        stamenRadius: 0.32,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
        tiltX: 0.48,
      });
      addBlossomHead(0, stemTopY + 0.12, 0.28, {
        layers: 1,
        petalsPerLayer: 3,
        petalLen: 0.52,
        petalWidth: 0.32,
        cupDepth: 0.55,
        curlBack: 0.25,
        stamenRadius: 0.14,
        hueA: pal.centerHue,
        hueB: pal.accentHue,
        tiltX: 0.85,
      });
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.28, -0.12, 1.4, 0.95);
    } else if (config.template === 'hibiscus') {
      addBlossomHead(0, stemTopY, 0, {
        layers: 1,
        petalsPerLayer: Math.max(5, Math.min(7, pCount)),
        petalLen: 1.32,
        petalWidth: 0.72,
        cupDepth: 0.48,
        curlBack: 0.38,
        stamenRadius: 0.26,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
        tiltX: 0.25,
      });
      for (let i = 0; i <= 16; i++) {
        const f = i / 16;
        pushPoint(
          Math.sin(f * 1.4) * 0.08,
          stemTopY - f * 1.05,
          f * 0.18,
          0.3,
          -0.5,
          0.8,
          pal.centerHue,
          pal.centerSat,
          74 + f * 16,
          f > 0.75 ? 4.8 : 3.2
        );
      }
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.22, 0, 1.38, 1.0);
    } else if (config.template === 'dandelion') {
      const seeds = Math.max(52, Math.round(pCount * (is4k ? 7 : 5)));
      const radius = 0.65 + bloom * 0.55;
      for (let i = 0; i < seeds; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / seeds);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const dx = Math.sin(phi) * Math.cos(theta);
        const dy = Math.cos(phi);
        const dz = Math.sin(phi) * Math.sin(theta);

        for (let s = 0.28; s <= 1; s += is4k ? 0.18 : 0.24) {
          pushPoint(
            dx * radius * s,
            stemTopY + dy * radius * s,
            dz * radius * s,
            dx,
            dy,
            dz,
            s > 0.85 ? pal.petalHue : pal.centerHue,
            s > 0.85 ? pal.sat * 0.45 : pal.centerSat,
            s > 0.85 ? 88 : 54,
            s > 0.85 ? 3.6 : 2.1
          );
        }
      }
      if (config.showStem) addStemAndLeaves(0, stemTopY + radius * 0.72, 0, 1.25, 0.85);
    } else if (config.template === 'bonsai') {
      const potStep = is4k ? 0.16 : 0.24;
      for (let y = 0.72; y <= 1.15; y += is4k ? 0.08 : 0.12) {
        const w = 0.88 - (y - 0.72) * 0.36;
        for (let a = 0; a < Math.PI * 2; a += potStep) {
          pushPoint(
            Math.cos(a) * w,
            y,
            Math.sin(a) * w * 0.68,
            Math.cos(a),
            0.1,
            Math.sin(a),
            215,
            pal.sat > 0 ? 32 : 0,
            46,
            3.8
          );
        }
      }
      for (let i = 0; i <= 28; i++) {
        const f = i / 28;
        const tx = Math.sin(f * Math.PI * 1.45) * 0.45;
        const ty = 0.72 - f * 1.38;
        const tz = Math.cos(f * Math.PI) * 0.16;
        pushPoint(tx, ty, tz, 0.3, -0.3, 0.8, 28, pal.sat > 0 ? 48 : 0, 42, 5.0 - f * 1.6);
      }
      const clouds = [
        { x: -0.58, y: -0.36, z: 0.12, rx: 0.62, ry: 0.34 },
        { x: 0.15, y: -0.82, z: -0.06, rx: 0.78, ry: 0.38 },
        { x: 0.72, y: -0.28, z: 0.18, rx: 0.54, ry: 0.3 },
      ];
      const cloudPts = is4k ? 96 : 64;
      clouds.forEach((c) => {
        for (let i = 0; i < cloudPts; i++) {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / cloudPts);
          const th = Math.PI * (1 + Math.sqrt(5)) * i;
          const ux = Math.sin(phi) * Math.cos(th);
          const uy = Math.cos(phi);
          const uz = Math.sin(phi) * Math.sin(th);
          const rad = 0.72 + bloom * 0.34;
          pushPoint(
            c.x + ux * c.rx * rad,
            c.y + uy * c.ry * rad,
            c.z + uz * c.rx * 0.72 * rad,
            ux,
            uy,
            uz,
            i % 3 === 0 ? pal.accentHue : pal.petalHue,
            pal.sat,
            64 + (1 - uy) * 16,
            4.1
          );
        }
      });
    } else {
      addBlossomHead(0, stemTopY, 0, {
        layers: 2,
        petalsPerLayer: Math.max(5, Math.min(10, pCount)),
        petalLen: 1.45,
        petalWidth: 0.34,
        cupDepth: 0.62,
        curlBack: 0.68,
        stamenRadius: 0.24,
        pointed: true,
        hueA: pal.accentHue,
        hueB: pal.petalHue,
      });
      for (let k = 0; k < 6; k++) {
        const ang = (k / 6) * Math.PI * 2 + 0.3;
        for (let f = 0.15; f <= 1; f += 0.14) {
          const r = f * 0.58;
          const y = stemTopY - Math.sin(f * Math.PI * 0.72) * 0.95;
          pushPoint(
            Math.cos(ang) * r,
            y,
            Math.sin(ang) * r,
            0,
            -1,
            0.5,
            pal.centerHue,
            pal.centerSat,
            f > 0.85 ? 92 : 68,
            f > 0.85 ? 4.4 : 2.5
          );
        }
      }
      if (config.showStem) addStemAndLeaves(0, stemTopY + 0.22, 0, 1.38, 0.9);
    }
  }

  // 3D Atmospheric Particles (Petals, Fireflies, Snow, Starlight)
  if (config.atmosphere === 'petals') {
    const pTotal = is4k ? 24 : 18;
    for (let i = 0; i < pTotal; i++) {
      const seed = i * 1.731;
      const py = ((t * 0.55 + seed * 0.37) % 3.2) - 1.6;
      const px = Math.sin(seed * 2.1 + t * 0.9) * 1.72;
      const pz = Math.cos(seed * 1.7 + t * 0.7) * 1.35;
      pushPoint(
        px,
        py,
        pz,
        0.2,
        -0.7,
        0.7,
        i % 2 === 0 ? pal.petalHue : pal.accentHue,
        pal.sat,
        78,
        2.9
      );
    }
  } else if (config.atmosphere === 'fireflies') {
    const fTotal = is4k ? 26 : 18;
    for (let i = 0; i < fTotal; i++) {
      const seed = i * 2.17;
      const pulse = 0.45 + 0.55 * Math.sin(t * 3.2 + seed * 2.4);
      const px = Math.sin(t * 0.6 + seed) * 1.55;
      const py = Math.cos(t * 0.75 + seed * 1.3) * 1.25;
      const pz = Math.sin(t * 0.5 + seed * 1.9) * 1.25;
      pushPoint(
        px,
        py,
        pz,
        0,
        -1,
        0.8,
        48 + (i % 3) * 10,
        pal.sat > 0 ? 100 : 0,
        55 + pulse * 40,
        2.6 + pulse * 2.6
      );
    }
  } else if (config.atmosphere === 'snow') {
    const sTotal = is4k ? 38 : 26;
    for (let i = 0; i < sTotal; i++) {
      const seed = i * 1.91;
      const py = ((t * 0.42 + seed * 0.51) % 3.4) - 1.7;
      const px = Math.sin(seed * 3.1 + t * 0.65) * 1.85;
      const pz = Math.cos(seed * 2.3) * 1.4;
      pushPoint(px, py, pz, 0, -1, 1, 204, pal.sat > 0 ? 35 : 0, 92, 2.5 + (i % 2));
    }
  } else if (config.atmosphere === 'starlight') {
    const stTotal = is4k ? 32 : 22;
    for (let i = 0; i < stTotal; i++) {
      const seed = i * 2.61;
      const twinkle = Math.pow(0.5 + 0.5 * Math.sin(t * 4.5 + seed * 3.2), 2);
      const rad = 1.25 + (i % 4) * 0.22;
      const ang = seed + t * 0.25;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(seed * 1.7) * 1.35;
      const pz = Math.sin(ang) * rad;
      pushPoint(
        px,
        py,
        pz,
        0,
        -1,
        1,
        i % 2 === 0 ? 52 : 196,
        pal.sat > 0 ? 90 : 0,
        55 + twinkle * 42,
        1.8 + twinkle * 3.2
      );
    }
  }

  points.sort((a, b) => a.z - b.z);
  for (const p of points) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp diagonal Rain streaks overlay (2D screen-space for sharp streaks)
  if (config.atmosphere === 'rain') {
    ctx.save();
    ctx.strokeStyle = hsl(198, pal.sat > 0 ? 85 : 0, 78, 0.78);
    ctx.lineWidth = 1.8 * resScale;
    ctx.lineCap = 'round';
    const drops = is4k ? 44 : 30;
    for (let i = 0; i < drops; i++) {
      const rx = ((i * 37.3 + t * 75) % (canvas.width + 60 * resScale)) - 30 * resScale;
      const ry = ((i * 53.7 + t * 290) % (canvas.height + 50 * resScale)) - 25 * resScale;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6 * resScale, ry + 18 * resScale);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ============================================================
// 2D BOTANICAL, BOUQUET, VASE & DOME ENGINE
// ============================================================
function drawFlower2D(
  canvas: HTMLCanvasElement,
  config: FlowerConfig,
  now: number,
  audioEnergy: number
): void {
  const resScale =
    config.quality === '4k' ? 2.0 : config.quality === 'hd' ? 1.5 : 1.0;
  const arrangement =
    config.template === 'bouquet' && config.arrangement === 'single'
      ? 'bouquet'
      : config.arrangement;

  const baseW = 420;
  const baseH = 340;
  canvas.width = Math.round(baseW * resScale);
  canvas.height = Math.round(baseH * resScale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(resScale, resScale);

  const meta = getTemplateMeta(config.template);
  const pal = resolvePalette(meta, config);
  const t = now * 0.0014;
  const bloom = computeEffectiveBloom(config, t, audioEnergy);
  const sway =
    config.windSway && arrangement !== 'dome' ? Math.sin(t * 1.7) * 14 : 0;

  ctx.fillStyle = '#030306';
  ctx.fillRect(0, 0, baseW, baseH);

  const cx = baseW / 2 + sway * 0.45;
  const cy = config.showStem ? 138 : 170;

  const halo = ctx.createRadialGradient(
    cx,
    cy,
    12,
    cx,
    cy,
    160 + (config.audioBloom ? audioEnergy * 45 : 0)
  );
  halo.addColorStop(0, hsl(pal.petalHue, pal.sat, 42, 0.28));
  halo.addColorStop(1, 'rgba(3,3,6,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, baseW, baseH);

  const draw2DStem = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    ctx.strokeStyle = hsl(pal.stemHue, pal.stemSat, 48 + pal.lightBoost);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      (startX + endX) / 2 + sway * 0.5,
      (startY + endY) / 2,
      endX,
      endY
    );
    ctx.stroke();

    [-1, 1].forEach((side, idx) => {
      const ly = startY + (endY - startY) * (idx === 0 ? 0.42 : 0.65);
      const lx =
        startX + (endX - startX) * (idx === 0 ? 0.42 : 0.65) + sway * 0.22;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(side * (0.52 + Math.sin(t * 1.5 + idx) * 0.05));
      const lg = ctx.createLinearGradient(0, 0, side * 72, 0);
      lg.addColorStop(0, hsl(pal.stemHue, pal.stemSat, 36 + pal.lightBoost));
      lg.addColorStop(1, hsl(pal.stemHue + 12, pal.stemSat, 62 + pal.lightBoost));
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * 38, -28, side * 74, -4);
      ctx.quadraticCurveTo(side * 38, 22, 0, 0);
      ctx.fill();
      ctx.restore();
    });
  };

  const draw2DPetalRing = (
    bx: number,
    by: number,
    count: number,
    len: number,
    width: number,
    rotOffset: number,
    hueInner: number,
    hueOuter: number,
    notched = false
  ) => {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + rotOffset;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(ang);
      const grad = ctx.createLinearGradient(0, 0, len, 0);
      grad.addColorStop(0, hsl(hueInner, pal.sat, 34 + pal.lightBoost));
      grad.addColorStop(0.55, hsl(hueOuter, pal.sat, 62 + pal.lightBoost));
      grad.addColorStop(1, hsl(hueOuter + 8, pal.sat, 84 + pal.lightBoost));
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      if (notched) {
        ctx.bezierCurveTo(len * 0.35, -width, len * 0.92, -width * 0.85, len, -width * 0.18);
        ctx.lineTo(len * 0.84, 0);
        ctx.lineTo(len, width * 0.18);
        ctx.bezierCurveTo(len * 0.92, width * 0.85, len * 0.35, width, 0, 0);
      } else {
        ctx.bezierCurveTo(len * 0.35, -width, len * 0.85, -width * 0.7, len, 0);
        ctx.bezierCurveTo(len * 0.85, width * 0.7, len * 0.35, width, 0, 0);
      }
      ctx.fill();
      ctx.restore();
    }
  };

  const draw2DCenter = (bx: number, by: number, radius: number) => {
    const cg = ctx.createRadialGradient(
      bx - radius * 0.25,
      by - radius * 0.25,
      2,
      bx,
      by,
      radius
    );
    cg.addColorStop(0, hsl(pal.centerHue + 10, pal.centerSat, 90));
    cg.addColorStop(0.6, hsl(pal.centerHue, pal.centerSat, 60));
    cg.addColorStop(1, hsl(pal.centerHue - 12, pal.centerSat, 32));
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const pCount = config.petalCount;
  const openScale = 0.42 + bloom * 0.68;

  if (arrangement === 'bouquet') {
    const isMixedGrand = config.template === 'bouquet';
    if (config.showStem) {
      const backPaper = ctx.createLinearGradient(cx, 62, cx, 310);
      backPaper.addColorStop(0, hsl(pal.wrapHue, pal.wrapSat, 72));
      backPaper.addColorStop(1, hsl(pal.wrapHue - 6, pal.wrapSat, 38));
      ctx.fillStyle = backPaper;
      ctx.beginPath();
      ctx.moveTo(cx - 118, 128);
      ctx.quadraticCurveTo(cx, 54, cx + 118, 128);
      ctx.lineTo(baseW / 2 + 24, 306);
      ctx.lineTo(baseW / 2 - 24, 306);
      ctx.closePath();
      ctx.fill();

      [-1.0, -0.55, 0.55, 1.0].forEach((ang) => {
        ctx.save();
        ctx.translate(cx, 152);
        ctx.rotate(ang);
        ctx.fillStyle = hsl(pal.stemHue, pal.stemSat, 50 + pal.lightBoost);
        ctx.beginPath();
        ctx.ellipse(0, -82, 18, 52, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    const spots = [
      { x: cx - 76, y: 140, sc: 0.72, shift: isMixedGrand ? 58 : -10 },
      { x: cx + 76, y: 138, sc: 0.72, shift: isMixedGrand ? 238 : 12 },
      { x: cx - 44, y: 92, sc: 0.74, shift: isMixedGrand ? 344 : 6 },
      { x: cx + 46, y: 94, sc: 0.74, shift: isMixedGrand ? 196 : -14 },
      { x: cx - 34, y: 162, sc: 0.66, shift: isMixedGrand ? 316 : 8 },
      { x: cx + 38, y: 160, sc: 0.66, shift: isMixedGrand ? 276 : -6 },
      { x: cx, y: 122, sc: 0.88, shift: 0 },
    ];
    spots.forEach((sp, i) => {
      const hIn = (pal.accentHue + sp.shift) % 360;
      const hOut = (pal.petalHue + sp.shift) % 360;
      const notched = config.template === 'sakura';
      draw2DPetalRing(sp.x, sp.y, Math.max(5, Math.min(12, pCount)), 66 * sp.sc * openScale, 24 * sp.sc * openScale, i * 0.45, hIn, hOut, notched);
      draw2DPetalRing(sp.x, sp.y, Math.max(5, Math.min(8, Math.round(pCount * 0.7))), 44 * sp.sc * openScale, 18 * sp.sc * openScale, i * 0.45 + 0.35, hOut, hIn, notched);
      draw2DCenter(sp.x, sp.y, 14 * sp.sc);
    });

    for (let i = 0; i < 18; i++) {
      const a = i * 2.3999;
      const r = 34 + (i % 5) * 18;
      ctx.fillStyle = hsl(pal.centerHue, pal.sat > 0 ? 22 : 0, 92);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, 128 + Math.sin(a) * r * 0.65, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (config.showStem) {
      const frontPaper = ctx.createLinearGradient(cx - 80, 170, cx + 80, 305);
      frontPaper.addColorStop(0, hsl(pal.wrapHue + 4, pal.wrapSat, 82));
      frontPaper.addColorStop(0.5, hsl(pal.wrapHue, pal.wrapSat, 62));
      frontPaper.addColorStop(1, hsl(pal.wrapHue - 8, pal.wrapSat, 42));
      ctx.fillStyle = frontPaper;
      ctx.beginPath();
      ctx.moveTo(cx - 94, 178);
      ctx.quadraticCurveTo(cx, 206, cx + 94, 178);
      ctx.lineTo(baseW / 2 + 22, 314);
      ctx.lineTo(baseW / 2 - 22, 314);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = hsl(pal.ribbonHue, pal.ribbonSat, 68);
      ctx.beginPath();
      ctx.roundRect(baseW / 2 - 36, 248, 72, 16, 6);
      ctx.fill();
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.ellipse(baseW / 2 + side * 26, 256, 22, 11, side * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = hsl(pal.ribbonHue, pal.ribbonSat, 74);
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(baseW / 2 + side * 8, 260);
        ctx.quadraticCurveTo(baseW / 2 + side * 24, 286, baseW / 2 + side * 34, 318);
        ctx.stroke();
      });
    }
  } else if (arrangement === 'vase') {
    // 3 stemmed blossoms inside a 2D sculpted vase
    draw2DStem(cx - 60, 128, baseW / 2 - 12, 224);
    draw2DStem(cx + 60, 128, baseW / 2 + 12, 224);
    draw2DStem(cx, 92, baseW / 2, 228);

    [
      { x: cx - 62, y: 122, sc: 0.72, sh: -12 },
      { x: cx + 62, y: 122, sc: 0.72, sh: 12 },
      { x: cx, y: 88, sc: 0.88, sh: 0 },
    ].forEach((sp, i) => {
      draw2DPetalRing(sp.x, sp.y, Math.max(5, Math.min(12, pCount)), 68 * sp.sc * openScale, 25 * sp.sc * openScale, i * 0.4, (pal.accentHue + sp.sh) % 360, (pal.petalHue + sp.sh) % 360, config.template === 'sakura');
      draw2DCenter(sp.x, sp.y, 14 * sp.sc);
    });

    if (config.showStem) {
      const vg = ctx.createLinearGradient(baseW / 2 - 65, 195, baseW / 2 + 65, 318);
      vg.addColorStop(0, hsl(pal.wrapHue, pal.wrapSat, 76));
      vg.addColorStop(0.5, hsl(pal.wrapHue, pal.wrapSat, 52));
      vg.addColorStop(1, hsl(pal.wrapHue, pal.wrapSat, 32));
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.moveTo(baseW / 2 - 42, 194);
      ctx.lineTo(baseW / 2 + 42, 194);
      ctx.bezierCurveTo(baseW / 2 + 28, 220, baseW / 2 + 72, 254, baseW / 2 + 42, 318);
      ctx.lineTo(baseW / 2 - 42, 318);
      ctx.bezierCurveTo(baseW / 2 - 72, 254, baseW / 2 - 28, 220, baseW / 2 - 42, 194);
      ctx.fill();

      // Glass highlight reflection
      ctx.strokeStyle = hsl(198, pal.sat > 0 ? 40 : 0, 92, 0.7);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(baseW / 2 - 24, 212);
      ctx.quadraticCurveTo(baseW / 2 - 42, 260, baseW / 2 - 24, 304);
      ctx.stroke();
    }
  } else if (arrangement === 'dome') {
    // 2D Enchanted Glass Dome Terrarium
    draw2DStem(baseW / 2, 152, baseW / 2, 272);
    draw2DPetalRing(baseW / 2, 138, Math.max(6, Math.min(12, pCount)), 74 * openScale, 34 * openScale, 0.2, pal.accentHue, pal.petalHue, config.template === 'sakura');
    draw2DPetalRing(baseW / 2, 138, 6, 46 * openScale, 24 * openScale, 0.7, pal.petalHue, pal.accentHue, config.template === 'sakura');
    draw2DCenter(baseW / 2, 138, 14);

    if (config.showStem) {
      // Wooden/brass pedestal
      ctx.fillStyle = hsl(28, pal.sat > 0 ? 45 : 0, 44);
      ctx.beginPath();
      ctx.roundRect(baseW / 2 - 104, 276, 208, 32, 10);
      ctx.fill();
      ctx.fillStyle = hsl(pal.ribbonHue, pal.ribbonSat, 72);
      ctx.fillRect(baseW / 2 - 96, 274, 192, 5);

      // Crystal glass dome outline + curved reflection
      ctx.strokeStyle = hsl(198, pal.sat > 0 ? 60 : 0, 82, 0.85);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(baseW / 2, 132, 96, Math.PI, 0);
      ctx.lineTo(baseW / 2 + 96, 274);
      ctx.moveTo(baseW / 2 - 96, 132);
      ctx.lineTo(baseW / 2 - 96, 274);
      ctx.stroke();

      ctx.strokeStyle = hsl(198, pal.sat > 0 ? 40 : 0, 95, 0.72);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(baseW / 2, 132, 82, Math.PI * 1.12, Math.PI * 1.44);
      ctx.stroke();
    }
  } else {
    if (
      config.showStem &&
      config.template !== 'sakura' &&
      config.template !== 'bonsai' &&
      config.template !== 'lotus'
    ) {
      draw2DStem(cx, cy + 16, baseW / 2, 328);
    }

    if (config.template === 'rose') {
      draw2DPetalRing(cx, cy, Math.max(6, Math.round(pCount * 0.8)), 108 * openScale, 52 * openScale, 0.2, pal.accentHue, pal.petalHue);
      draw2DPetalRing(cx, cy, Math.max(5, Math.round(pCount * 0.65)), 78 * openScale, 42 * openScale, 0.75, pal.petalHue, pal.accentHue);
      draw2DPetalRing(cx, cy, 5, 48 * openScale, 28 * openScale, 1.3, pal.accentHue, pal.petalHue);
      draw2DCenter(cx, cy, 16);
    } else if (config.template === 'lotus') {
      if (config.showStem) {
        ctx.strokeStyle = hsl(pal.stemHue, pal.stemSat, 52, 0.65);
        ctx.lineWidth = 4;
        for (let r = 1; r <= 2; r++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy + 68, 92 + r * 42, 20 + r * 8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      draw2DPetalRing(cx, cy + 12, Math.max(8, pCount), 116 * openScale, 34 * openScale, -Math.PI / 2, pal.accentHue, pal.petalHue);
      draw2DPetalRing(cx, cy + 12, Math.max(6, Math.round(pCount * 0.7)), 82 * openScale, 26 * openScale, -Math.PI / 2 + 0.32, pal.petalHue, pal.petalHue + 10);
      draw2DCenter(cx, cy + 12, 24);
    } else if (config.template === 'sakura') {
      if (config.showStem) {
        ctx.strokeStyle = hsl(26, pal.sat > 0 ? 48 : 0, 44);
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(32, 290);
        ctx.quadraticCurveTo(185, 200, 388, 66);
        ctx.stroke();
      }
      const spots = [
        { x: 138 + sway * 0.3, y: 215, s: 0.65 },
        { x: 224 + sway * 0.45, y: 150, s: 0.9 },
        { x: 312 + sway * 0.5, y: 102, s: 0.62 },
      ];
      spots.forEach((sp, i) => {
        draw2DPetalRing(sp.x, sp.y, 5, 76 * sp.s * openScale, 32 * sp.s * openScale, i * 0.6, pal.accentHue, pal.petalHue, true);
        draw2DCenter(sp.x, sp.y, 13 * sp.s);
      });
    } else if (config.template === 'sunflower') {
      draw2DPetalRing(cx, cy, Math.max(12, pCount), 122 * openScale, 24 * openScale, 0, pal.accentHue, pal.petalHue);
      draw2DPetalRing(cx, cy, Math.max(12, pCount), 104 * openScale, 20 * openScale, Math.PI / Math.max(12, pCount), pal.petalHue, pal.petalHue + 8);
      draw2DCenter(cx, cy, 48);
      for (let i = 0; i < 65; i++) {
        const r = Math.sqrt(i / 65) * 42;
        const a = i * 2.39996;
        ctx.fillStyle = hsl(pal.centerHue + 18, pal.centerSat, 78);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (config.template === 'tulip') {
      [-0.42, 0.42, 0].forEach((ang, idx) => {
        ctx.save();
        ctx.translate(cx, cy + 36);
        ctx.rotate(ang * openScale);
        const grad = ctx.createLinearGradient(0, 10, 0, -125);
        grad.addColorStop(0, hsl(pal.accentHue, pal.sat, 36 + pal.lightBoost));
        grad.addColorStop(0.6, hsl(pal.petalHue, pal.sat, 62 + pal.lightBoost));
        grad.addColorStop(1, hsl(pal.petalHue + 12, pal.sat, 85 + pal.lightBoost));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-48, -32, -46, -104, 0, -124 * openScale);
        ctx.bezierCurveTo(46, -104, 48, -32, 0, 0);
        ctx.fill();
        if (idx === 2) {
          ctx.strokeStyle = hsl(pal.centerHue, pal.centerSat, 85, 0.35);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      });
    } else if (config.template === 'daisy') {
      draw2DPetalRing(cx, cy, Math.max(10, pCount), 124 * openScale, 20 * openScale, 0.15, pal.accentHue, pal.petalHue);
      draw2DCenter(cx, cy, 34);
    } else if (config.template === 'orchid') {
      draw2DPetalRing(cx, cy, 5, 118 * openScale, 54 * openScale, -Math.PI / 2, pal.accentHue, pal.petalHue);
      draw2DPetalRing(cx, cy + 12, 3, 52 * openScale, 28 * openScale, Math.PI / 2, pal.centerHue, pal.accentHue);
      draw2DCenter(cx, cy, 18);
    } else if (config.template === 'hibiscus') {
      draw2DPetalRing(cx, cy, 5, 122 * openScale, 68 * openScale, -Math.PI / 2, pal.accentHue, pal.petalHue);
      draw2DCenter(cx, cy, 22);
      ctx.strokeStyle = hsl(pal.centerHue, pal.centerSat, 84);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + 18, cy - 35, cx + 26, cy - 72);
      ctx.stroke();
      draw2DCenter(cx + 26, cy - 74, 11);
    } else if (config.template === 'dandelion') {
      const rays = Math.max(24, pCount * 2);
      const rad = 52 + bloom * 56;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2;
        const ex = cx + Math.cos(a) * rad;
        const ey = cy + Math.sin(a) * rad;
        ctx.strokeStyle = hsl(pal.petalHue, pal.sat * 0.4, 72, 0.85);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = hsl(pal.petalHue, pal.sat * 0.45, 92);
        ctx.beginPath();
        ctx.arc(ex, ey, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      draw2DCenter(cx, cy, 18);
    } else if (config.template === 'bonsai') {
      ctx.fillStyle = hsl(215, pal.sat > 0 ? 32 : 0, 48);
      ctx.beginPath();
      ctx.moveTo(132, 268);
      ctx.lineTo(288, 268);
      ctx.lineTo(268, 316);
      ctx.lineTo(152, 316);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = hsl(28, pal.sat > 0 ? 48 : 0, 44);
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(210, 268);
      ctx.bezierCurveTo(165, 222, 268, 175, 206, 112);
      ctx.stroke();

      const puffs = [
        { x: 132 + sway * 0.3, y: 158, rx: 68, ry: 38 },
        { x: 215 + sway * 0.45, y: 102, rx: 86, ry: 44 },
        { x: 288 + sway * 0.4, y: 162, rx: 62, ry: 34 },
      ];
      puffs.forEach((p) => {
        const g = ctx.createRadialGradient(p.x - 16, p.y - 12, 8, p.x, p.y, p.rx);
        g.addColorStop(0, hsl(pal.petalHue, pal.sat, 86 + pal.lightBoost));
        g.addColorStop(0.65, hsl(pal.accentHue, pal.sat, 60 + pal.lightBoost));
        g.addColorStop(1, hsl(pal.accentHue, pal.sat, 34));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.rx * (0.75 + bloom * 0.25), p.ry * (0.75 + bloom * 0.25), 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      draw2DPetalRing(cx, cy, Math.max(6, Math.min(10, pCount)), 134 * openScale, 26 * openScale, -Math.PI / 2, pal.accentHue, pal.petalHue);
      draw2DPetalRing(cx, cy, Math.max(6, Math.min(10, pCount)), 92 * openScale, 18 * openScale, -Math.PI / 2 + 0.52, pal.petalHue, pal.centerHue);
      draw2DCenter(cx, cy, 20);
    }
  }

  // 2D Atmosphere Effects
  if (config.atmosphere === 'petals') {
    for (let i = 0; i < 16; i++) {
      const px = ((i * 53 + t * 28 + Math.sin(t * 1.4 + i) * 24) % (baseW + 40)) - 20;
      const py = ((i * 39 + t * 44) % (baseH + 30)) - 15;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * 1.2 + i);
      ctx.fillStyle = hsl(i % 2 === 0 ? pal.petalHue : pal.accentHue, pal.sat, 78, 0.9);
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (config.atmosphere === 'fireflies') {
    for (let i = 0; i < 18; i++) {
      const pulse = 0.4 + 0.6 * Math.sin(t * 3.4 + i * 2.1);
      const px = baseW / 2 + Math.sin(t * 0.7 + i * 1.9) * 168;
      const py = baseH / 2 + Math.cos(t * 0.9 + i * 2.3) * 132;
      ctx.fillStyle = hsl(48, pal.sat > 0 ? 100 : 0, 62 + pulse * 34, 0.88);
      ctx.beginPath();
      ctx.arc(px, py, 3 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (config.atmosphere === 'rain') {
    ctx.strokeStyle = hsl(198, pal.sat > 0 ? 85 : 0, 78, 0.78);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 32; i++) {
      const rx = ((i * 41 + t * 75) % (baseW + 40)) - 20;
      const ry = ((i * 57 + t * 270) % (baseH + 40)) - 20;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6, ry + 18);
      ctx.stroke();
    }
  } else if (config.atmosphere === 'snow') {
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 47 + Math.sin(t * 1.1 + i) * 28) % (baseW + 20)) - 10;
      const sy = ((i * 33 + t * 38) % (baseH + 20)) - 10;
      ctx.fillStyle = hsl(204, pal.sat > 0 ? 35 : 0, 92, 0.9);
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5 + (i % 2) * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (config.atmosphere === 'starlight') {
    for (let i = 0; i < 22; i++) {
      const tw = Math.pow(0.5 + 0.5 * Math.sin(t * 4.2 + i * 2.7), 2);
      const sx = ((i * 73) % (baseW - 40)) + 20;
      const sy = ((i * 59) % (baseH - 40)) + 20;
      const len = 3 + tw * 7;
      ctx.strokeStyle = hsl(i % 2 === 0 ? 52 : 196, pal.sat > 0 ? 90 : 0, 70 + tw * 25);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sx - len, sy);
      ctx.lineTo(sx + len, sy);
      ctx.moveTo(sx, sy - len);
      ctx.lineTo(sx, sy + len);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawFlowerArtwork(
  canvas: HTMLCanvasElement,
  config: FlowerConfig,
  rotX: number,
  rotY: number,
  now: number,
  audioEnergy = 0
): void {
  if (config.dimension === '3d') {
    drawFlower3D(canvas, config, rotX, rotY, now, audioEnergy);
  } else {
    drawFlower2D(canvas, config, now, audioEnergy);
  }
}
