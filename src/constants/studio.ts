import type {
  CharsetKey,
  ModeSpecificState,
  StudioMode,
  StudioSettings,
} from '../types/studio';
import { DEFAULT_FLOWER_CONFIG } from './flowers';

export const CHARSETS: Record<Exclude<CharsetKey, 'custom'>, string> = {
  standard: '@%#*+=-:. ',
  detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  blocks: '█▓▒░ ',
  minimal: '#+:. ',
  binary: '10 ',
  braille: '⣿⣷⣶⣦⣤⣄⣀⠀',
  matrix: 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01 ',
};

export const BAYER_4X4: readonly (readonly number[])[] = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

export const BRAILLE_MAP: readonly (readonly [number, number, number])[] = [
  [0, 0, 0x01],
  [0, 1, 0x02],
  [0, 2, 0x04],
  [0, 3, 0x40],
  [1, 0, 0x08],
  [1, 1, 0x10],
  [1, 2, 0x20],
  [1, 3, 0x80],
];

export const DEFAULT_SETTINGS: StudioSettings = {
  detailMode: 'standard',
  charsetKey: 'standard',
  customCharset: '@#S%?*+;:,. ',
  width: 90,
  aspect: 0.5,
  contrast: 1.1,
  brightness: 0,
  sharpen: 0,
  invert: false,
  dither: false,
  edgeDetect: false,
  crt: false,
  cutoutMode: 'none',
  cutoutThreshold: 38,

  color: false,
  colorPalette: 'mono',
  tintHex: '#e4e4e7',
  canvasBg: '#09090b',
  neonGlow: 0,
  lineHeight: 1.05,
  letterSpacing: 0,

  fxMode: 'none',
  fxSpeed: 1.0,
  fxIntensity: 0.6,
  mouseFx: 'none',
  frameStyle: 'none',
  watermark: '',
};

export const DEFAULT_MODE_STATE: ModeSpecificState = {
  sampleName: 'sphere',
  hasCustomImage: false,

  bannerText: 'ASCII PRO',
  bannerFont: '900 110px Impact, sans-serif',
  bannerStyle: 'solid',

  animPreset: 'orbit',
  animPlaying: true,
  animFps: 20,
  hasCustomVideo: false,

  paintTool: 'brush',
  paintChar: '#',
  paintSize: 1,
  paintColor: '#38bdf8',
  paintOnionSkin: true,
  paintFlipbookPlaying: false,
  paintFlipbookFps: 6,
  paintFrameIdx: 0,
  paintFrameCount: 1,

  obj3d: 'donut',
  autoSpin3d: true,

  flower: DEFAULT_FLOWER_CONFIG,
};

export const WIDTH_PRESETS = [
  { label: 'WA', width: 36 },
  { label: 'Chat', width: 56 },
  { label: 'Std', width: 90 },
  { label: 'HD', width: 150 },
  { label: '4K', width: 220 },
] as const;

export const MONO_TINTS = [
  { hex: '#e4e4e7', label: 'Silver' },
  { hex: '#4ade80', label: 'Phosphor' },
  { hex: '#38bdf8', label: 'Cyan' },
  { hex: '#fbbf24', label: 'Amber' },
  { hex: '#f472b6', label: 'Rose' },
  { hex: '#18181b', label: 'Ink' },
] as const;

export const CANVAS_THEMES = [
  { bg: '#09090b', label: 'Obsidian', previewClass: 'bg-zinc-950 text-zinc-200' },
  { bg: '#021408', label: 'Matrix', previewClass: 'bg-emerald-950 text-emerald-300' },
  { bg: '#0c1222', label: 'Terminal', previewClass: 'bg-slate-900 text-sky-300' },
  { bg: '#fafaf9', label: 'Paper', previewClass: 'bg-stone-100 text-zinc-800' },
] as const;

export const QUICK_PAINT_CHARS = ['@', '#', '*', '+', '█', '▓', '░', '/', '\\'] as const;

export interface StudioRouteMeta {
  mode: StudioMode;
  path: string;
  label: string;
  title: string;
}

export const STUDIO_ROUTES: readonly StudioRouteMeta[] = [
  { mode: 'image', path: '/image', label: 'Image', title: 'Source Image' },
  { mode: 'flowers', path: '/flowers', label: 'Flowers', title: 'Flower Arts' },
  { mode: 'text', path: '/text', label: 'Text', title: 'Text Banner' },
  { mode: 'animate', path: '/animate', label: 'Animate', title: 'Animation & Video' },
  { mode: 'camera', path: '/live', label: 'Live', title: 'Camera & Screen' },
  { mode: 'paint', path: '/paint', label: 'Paint', title: 'ASCII Paint' },
  { mode: '3d', path: '/3d', label: '3D', title: 'Interactive 3D' },
] as const;

export const PATH_TO_MODE: Record<string, StudioMode> = {
  '/image': 'image',
  '/flowers': 'flowers',
  '/text': 'text',
  '/animate': 'animate',
  '/live': 'camera',
  '/paint': 'paint',
  '/3d': '3d',
};

export const PRESET_STORAGE_KEY = 'asciiStudioPro_presets_v1';
export const THEME_STORAGE_KEY = 'asciiStudioPro_theme_v1';
export const DEFAULT_PAINT_COLS = 72;
export const DEFAULT_PAINT_ROWS = 34;
