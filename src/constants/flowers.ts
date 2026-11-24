import type {
  FlowerConfig,
  FlowerStyleId,
  FlowerTemplateId,
} from '../types/studio';

export interface FlowerTemplateMeta {
  id: FlowerTemplateId;
  label: string;
  category: 'classic' | 'exotic' | 'scene';
  glyph: string;
  defaultPetals: number;
  petalHue: number;
  accentHue: number;
  centerHue: number;
  stemHue: number;
}

export const FLOWER_TEMPLATES: readonly FlowerTemplateMeta[] = [
  {
    id: 'rose',
    label: 'Rose',
    category: 'classic',
    glyph: '✿',
    defaultPetals: 10,
    petalHue: 348,
    accentHue: 332,
    centerHue: 42,
    stemHue: 138,
  },
  {
    id: 'lotus',
    label: 'Lotus',
    category: 'exotic',
    glyph: '❀',
    defaultPetals: 12,
    petalHue: 326,
    accentHue: 300,
    centerHue: 48,
    stemHue: 152,
  },
  {
    id: 'sakura',
    label: 'Sakura',
    category: 'classic',
    glyph: '❁',
    defaultPetals: 5,
    petalHue: 342,
    accentHue: 350,
    centerHue: 44,
    stemHue: 24,
  },
  {
    id: 'sunflower',
    label: 'Sunflower',
    category: 'classic',
    glyph: '☀',
    defaultPetals: 18,
    petalHue: 44,
    accentHue: 32,
    centerHue: 26,
    stemHue: 128,
  },
  {
    id: 'tulip',
    label: 'Tulip',
    category: 'classic',
    glyph: '⚘',
    defaultPetals: 6,
    petalHue: 356,
    accentHue: 18,
    centerHue: 52,
    stemHue: 134,
  },
  {
    id: 'daisy',
    label: 'Daisy',
    category: 'classic',
    glyph: '✽',
    defaultPetals: 14,
    petalHue: 210,
    accentHue: 196,
    centerHue: 46,
    stemHue: 130,
  },
  {
    id: 'orchid',
    label: 'Orchid',
    category: 'exotic',
    glyph: '✾',
    defaultPetals: 6,
    petalHue: 286,
    accentHue: 318,
    centerHue: 50,
    stemHue: 140,
  },
  {
    id: 'hibiscus',
    label: 'Hibiscus',
    category: 'exotic',
    glyph: '❃',
    defaultPetals: 5,
    petalHue: 6,
    accentHue: 340,
    centerHue: 48,
    stemHue: 132,
  },
  {
    id: 'dandelion',
    label: 'Dandelion',
    category: 'scene',
    glyph: '✳',
    defaultPetals: 20,
    petalHue: 198,
    accentHue: 48,
    centerHue: 45,
    stemHue: 118,
  },
  {
    id: 'bonsai',
    label: 'Bonsai',
    category: 'scene',
    glyph: '❃',
    defaultPetals: 8,
    petalHue: 340,
    accentHue: 322,
    centerHue: 36,
    stemHue: 26,
  },
  {
    id: 'bouquet',
    label: 'Bouquet',
    category: 'scene',
    glyph: '❀',
    defaultPetals: 10,
    petalHue: 344,
    accentHue: 268,
    centerHue: 46,
    stemHue: 136,
  },
  {
    id: 'neon_lily',
    label: 'Neon Lily',
    category: 'exotic',
    glyph: '✦',
    defaultPetals: 6,
    petalHue: 190,
    accentHue: 295,
    centerHue: 54,
    stemHue: 170,
  },
] as const;

export interface FlowerStylePreset {
  id: FlowerStyleId;
  label: string;
  swatch: string;
  color: boolean;
  colorPalette: 'mono' | 'original' | 'vaporwave' | 'cyberpunk' | 'rainbow';
  canvasBg?: string;
  tintHex?: string;
  neonGlow: number;
}

export const FLOWER_STYLES: readonly FlowerStylePreset[] = [
  {
    id: 'colorful',
    label: 'Full Color',
    swatch: 'linear-gradient(135deg, #f43f5e, #f59e0b, #10b981)',
    color: true,
    colorPalette: 'original',
    canvasBg: '#09090b',
    tintHex: '#e4e4e7',
    neonGlow: 0,
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    swatch: 'linear-gradient(135deg, #fafafa, #71717a, #18181b)',
    color: false,
    colorPalette: 'mono',
    canvasBg: '#09090b',
    tintHex: '#e4e4e7',
    neonGlow: 0,
  },
  {
    id: 'pastel',
    label: 'Pastel',
    swatch: 'linear-gradient(135deg, #fbcfe8, #ddd6fe, #a7f3d0)',
    color: true,
    colorPalette: 'original',
    canvasBg: '#09090b',
    tintHex: '#f5d0fe',
    neonGlow: 0,
  },
  {
    id: 'neon',
    label: 'Neon Glow',
    swatch: 'linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)',
    color: true,
    colorPalette: 'original',
    canvasBg: '#09090b',
    tintHex: '#22d3ee',
    neonGlow: 6,
  },
  {
    id: 'golden',
    label: 'Gold Ink',
    swatch: 'linear-gradient(135deg, #fef08a, #f59e0b, #78350f)',
    color: false,
    colorPalette: 'mono',
    canvasBg: '#09090b',
    tintHex: '#fbbf24',
    neonGlow: 2,
  },
  {
    id: 'sumie',
    label: 'Sumi-e',
    swatch: 'linear-gradient(135deg, #fafaf9, #a1a1aa, #18181b)',
    color: false,
    colorPalette: 'mono',
    canvasBg: '#fafaf9',
    tintHex: '#18181b',
    neonGlow: 0,
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, #fb7185, #fb923c, #a855f7)',
    color: true,
    colorPalette: 'original',
    canvasBg: '#0c1222',
    tintHex: '#fb7185',
    neonGlow: 1,
  },
  {
    id: 'matrix',
    label: 'Bio Matrix',
    swatch: 'linear-gradient(135deg, #86efac, #22c55e, #052e16)',
    color: false,
    colorPalette: 'mono',
    canvasBg: '#021408',
    tintHex: '#4ade80',
    neonGlow: 3,
  },
] as const;

export const FLOWER_ATMOSPHERES = [
  { id: 'none', label: 'Off', glyph: '·' },
  { id: 'petals', label: 'Petals', glyph: '❀' },
  { id: 'fireflies', label: 'Fireflies', glyph: '✦' },
  { id: 'rain', label: 'Rain', glyph: '╱' },
  { id: 'snow', label: 'Snow', glyph: '❄' },
  { id: 'starlight', label: 'Starlight', glyph: '✧' },
] as const;

export const GIFT_CARD_OCCASIONS = [
  {
    id: 'for_you',
    label: 'For You',
    title: 'FOR YOU',
    message: 'May your days always bloom bright',
  },
  {
    id: 'birthday',
    label: 'Birthday',
    title: 'HAPPY BIRTHDAY',
    message: 'Wishing you a year full of joy & light',
  },
  {
    id: 'love',
    label: 'Love',
    title: 'WITH LOVE',
    message: 'A digital flower that never fades',
  },
  {
    id: 'congrats',
    label: 'Congrats',
    title: 'CONGRATULATIONS',
    message: 'So proud of everything you achieved',
  },
  {
    id: 'thanks',
    label: 'Thank You',
    title: 'THANK YOU',
    message: 'Grateful for your kindness every day',
  },
] as const;

export const DEFAULT_FLOWER_CONFIG: FlowerConfig = {
  template: 'rose',
  dimension: '3d',
  arrangement: 'single',
  quality: 'std',
  style: 'colorful',
  bloom: 0.85,
  petalCount: 10,
  showStem: true,
  atmosphere: 'petals',
  windSway: true,
  autoBloom: false,
  autoSpin: true,
  audioBloom: false,

  customColorsEnabled: false,
  customPetalHex: '#f43f5e',
  customRibbonHex: '#fbbf24',
  customWrapHex: '#d6c2a8',

  giftCardEnabled: false,
  giftTitle: 'FOR YOU',
  giftMessage: 'A digital flower that never fades',
  giftSender: 'ASCII Studio',

  dnaName: '',
};

export const FLORAL_CUSTOM_CHARSET = '✿❀❁*+~·. ';
