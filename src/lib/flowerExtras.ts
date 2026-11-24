import {
  DEFAULT_FLOWER_CONFIG,
  FLOWER_ATMOSPHERES,
  FLOWER_STYLES,
  FLOWER_TEMPLATES,
} from '../constants/flowers';
import type {
  FlowerArrangement,
  FlowerAtmosphere,
  FlowerConfig,
  FlowerDimension,
  FlowerQuality,
  FlowerStyleId,
  FlowerTemplateId,
  StudioSettings,
} from '../types/studio';

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  const hh = ((h % 360) + 360) % 360;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Deterministic FNV-1a 32-bit hash for reproducible Name-to-Flower DNA
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface NameFlowerDnaResult {
  patch: Partial<FlowerConfig>;
  summary: string;
}

export function generateFlowerFromName(rawName: string): NameFlowerDnaResult {
  const clean = rawName.trim();
  const normalized = clean.toLowerCase();
  const h1 = hashString(normalized);
  const h2 = hashString(`${normalized}::botanical`);
  const h3 = hashString(`${normalized}::atmosphere`);

  const tpl = FLOWER_TEMPLATES[h1 % FLOWER_TEMPLATES.length];
  const arrangements: FlowerArrangement[] = ['single', 'bouquet', 'vase', 'dome'];
  const arrangement =
    tpl.id === 'bouquet' ? 'bouquet' : arrangements[(h1 >>> 8) % arrangements.length];

  const atmospheres: FlowerAtmosphere[] = [
    'petals',
    'fireflies',
    'starlight',
    'snow',
    'rain',
  ];
  const atmosphere = atmospheres[h3 % atmospheres.length];

  const petalHue = h2 % 360;
  const ribbonHue = (petalHue + 140 + ((h2 >>> 9) % 80)) % 360;
  const wrapHue = (petalHue + 30) % 360;

  const customPetalHex = hslToHex(petalHue, 86, 60);
  const customRibbonHex = hslToHex(ribbonHue, 84, 62);
  const customWrapHex = hslToHex(wrapHue, 34, 72);

  const petalCount = 6 + ((h1 >>> 16) % 13); // 6..18
  const bloom = Math.round((0.65 + (((h2 >>> 18) % 36) / 100)) * 20) / 20;

  const arrangementLabel =
    arrangement === 'bouquet'
      ? '3D Bouquet'
      : arrangement === 'dome'
      ? 'Glass Dome'
      : arrangement === 'vase'
      ? 'Glass Vase'
      : 'Solo Bloom';

  return {
    patch: {
      dnaName: clean,
      template: tpl.id,
      dimension: '3d',
      arrangement,
      style: 'colorful',
      bloom,
      petalCount,
      atmosphere,
      showStem: true,
      customColorsEnabled: true,
      customPetalHex,
      customRibbonHex,
      customWrapHex,
    },
    summary: `${tpl.label} · ${arrangementLabel} · ${petalCount} Petals`,
  };
}

// ============================================================
// SHAREABLE URL ENCODER / DECODER FOR GIFT CARD & 3D FLOWERS
// ============================================================
interface SharedFlowerPayload {
  t: FlowerTemplateId;
  d: FlowerDimension;
  a: FlowerArrangement;
  q: FlowerQuality;
  s: FlowerStyleId;
  b: number;
  p: number;
  st: number;
  at: FlowerAtmosphere;
  w: number;
  ab: number;
  sp: number;
  cc?: number;
  cp?: string;
  cr?: string;
  cw?: string;
  gc?: number;
  gt?: string;
  gm?: string;
  gs?: string;
  dn?: string;
  ch?: StudioSettings['charsetKey'];
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const padded =
    b64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeFlowerShareUrl(
  flower: FlowerConfig,
  settings: StudioSettings
): string {
  const payload: SharedFlowerPayload = {
    t: flower.template,
    d: flower.dimension,
    a: flower.arrangement,
    q: flower.quality,
    s: flower.style,
    b: flower.bloom,
    p: flower.petalCount,
    st: flower.showStem ? 1 : 0,
    at: flower.atmosphere,
    w: flower.windSway ? 1 : 0,
    ab: flower.autoBloom ? 1 : 0,
    sp: flower.autoSpin ? 1 : 0,
    ...(flower.customColorsEnabled
      ? {
          cc: 1,
          cp: flower.customPetalHex,
          cr: flower.customRibbonHex,
          cw: flower.customWrapHex,
        }
      : {}),
    ...(flower.giftCardEnabled
      ? {
          gc: 1,
          gt: flower.giftTitle.slice(0, 40),
          gm: flower.giftMessage.slice(0, 80),
          gs: flower.giftSender.slice(0, 32),
        }
      : {}),
    ...(flower.dnaName ? { dn: flower.dnaName.slice(0, 32) } : {}),
    ch: settings.charsetKey,
  };

  const encoded = toBase64Url(JSON.stringify(payload));
  const origin = window.location.origin;
  return `${origin}/flowers?gift=${encoded}`;
}

export function decodeFlowerShareParam(search: string): {
  flower: FlowerConfig;
  charsetKey?: StudioSettings['charsetKey'];
} | null {
  try {
    const params = new URLSearchParams(search);
    const raw = params.get('gift');
    if (!raw) return null;

    const data = JSON.parse(fromBase64Url(raw)) as Partial<SharedFlowerPayload>;
    const validTemplate = FLOWER_TEMPLATES.some((t) => t.id === data.t)
      ? (data.t as FlowerTemplateId)
      : DEFAULT_FLOWER_CONFIG.template;
    const validStyle = FLOWER_STYLES.some((s) => s.id === data.s)
      ? (data.s as FlowerStyleId)
      : DEFAULT_FLOWER_CONFIG.style;
    const validAtmo = FLOWER_ATMOSPHERES.some((a) => a.id === data.at)
      ? (data.at as FlowerAtmosphere)
      : DEFAULT_FLOWER_CONFIG.atmosphere;
    const validArr: FlowerArrangement =
      data.a === 'single' ||
      data.a === 'bouquet' ||
      data.a === 'vase' ||
      data.a === 'dome'
        ? data.a
        : DEFAULT_FLOWER_CONFIG.arrangement;
    const validQual: FlowerQuality =
      data.q === 'std' || data.q === 'hd' || data.q === '4k'
        ? data.q
        : DEFAULT_FLOWER_CONFIG.quality;

    return {
      flower: {
        ...DEFAULT_FLOWER_CONFIG,
        template: validTemplate,
        dimension: data.d === '2d' ? '2d' : '3d',
        arrangement: validArr,
        quality: validQual,
        style: validStyle,
        bloom:
          typeof data.b === 'number'
            ? Math.max(0.15, Math.min(1, data.b))
            : DEFAULT_FLOWER_CONFIG.bloom,
        petalCount:
          typeof data.p === 'number'
            ? Math.max(5, Math.min(20, Math.round(data.p)))
            : DEFAULT_FLOWER_CONFIG.petalCount,
        showStem: data.st !== 0,
        atmosphere: validAtmo,
        windSway: data.w !== 0,
        autoBloom: data.ab === 1,
        autoSpin: data.sp !== 0,
        customColorsEnabled: data.cc === 1,
        customPetalHex:
          typeof data.cp === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.cp)
            ? data.cp
            : DEFAULT_FLOWER_CONFIG.customPetalHex,
        customRibbonHex:
          typeof data.cr === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.cr)
            ? data.cr
            : DEFAULT_FLOWER_CONFIG.customRibbonHex,
        customWrapHex:
          typeof data.cw === 'string' && /^#[0-9a-fA-F]{6}$/.test(data.cw)
            ? data.cw
            : DEFAULT_FLOWER_CONFIG.customWrapHex,
        giftCardEnabled: data.gc === 1,
        giftTitle:
          typeof data.gt === 'string'
            ? data.gt
            : DEFAULT_FLOWER_CONFIG.giftTitle,
        giftMessage:
          typeof data.gm === 'string'
            ? data.gm
            : DEFAULT_FLOWER_CONFIG.giftMessage,
        giftSender:
          typeof data.gs === 'string'
            ? data.gs
            : DEFAULT_FLOWER_CONFIG.giftSender,
        dnaName: typeof data.dn === 'string' ? data.dn : '',
      },
      charsetKey: data.ch,
    };
  } catch {
    return null;
  }
}
