export type StudioMode = 'image' | 'text' | 'animate' | 'camera' | 'paint' | '3d';

export type DetailMode = 'standard' | 'photo_hd' | 'braille_hd' | 'halfblock_hd';

export type CharsetKey =
  | 'standard'
  | 'detailed'
  | 'blocks'
  | 'braille'
  | 'matrix'
  | 'minimal'
  | 'binary'
  | 'custom';

export type ColorPalette =
  | 'mono'
  | 'original'
  | 'gameboy'
  | 'vaporwave'
  | 'thermal'
  | 'cyberpunk'
  | 'rainbow';

export type RenderFxMode =
  | 'none'
  | 'typewriter'
  | 'scramble'
  | 'wave'
  | 'glitch'
  | 'scanline'
  | 'pulse';

export type MouseFxMode = 'none' | 'spotlight' | 'repel' | 'ripple';

export type FrameStyle = 'none' | 'double' | 'single' | 'macos' | 'dos';

export type CutoutMode = 'none' | 'dark' | 'light';

export type AudioFxTarget = 'pulse' | 'wave' | 'glitch' | 'all';

export type AudioSourceMode = 'none' | 'file' | 'mic';

export type SampleArtworkName = 'sphere' | 'sunset' | 'wave' | 'portrait';

export type BannerStyle = 'solid' | 'outline' | 'shadow';

export type AnimPreset = 'orbit' | 'plasma' | 'rain' | 'radar' | 'bars' | 'cube';

export type PaintTool = 'brush' | 'eraser' | 'line' | 'box' | 'fill';

export type Object3DType = 'donut' | 'globe' | 'knot' | 'pyramid';

export type ImageTransformAction = 'flipH' | 'flipV' | 'rotateCw' | 'cropSquare';

export type EmbedFormat = 'html' | 'react';

export type InspectorTab = 'engine' | 'color' | 'fx' | 'presets';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface AsciiCell {
  ch: string;
  r: number;
  g: number;
  b: number;
  br?: number;
  bg?: number;
  bb?: number;
}

export type AsciiGrid = AsciiCell[][];

export interface StudioSettings {
  // Conversion & Detail Engine
  detailMode: DetailMode;
  charsetKey: CharsetKey;
  customCharset: string;
  width: number;
  aspect: number;
  contrast: number;
  brightness: number;
  sharpen: number; // 0.0 to 1.0
  invert: boolean;
  dither: boolean;
  edgeDetect: boolean;
  crt: boolean;
  cutoutMode: CutoutMode;
  cutoutThreshold: number;

  // Color, Canvas Theme & Typography
  color: boolean;
  colorPalette: ColorPalette;
  tintHex: string;
  canvasBg: string;
  neonGlow: number;
  lineHeight: number;
  letterSpacing: number;

  // Render FX, Mouse FX & Frame
  fxMode: RenderFxMode;
  fxSpeed: number;
  fxIntensity: number; // 0.1 to 1.0
  mouseFx: MouseFxMode;
  frameStyle: FrameStyle;
  watermark: string;
}

export type StudioPresetData = Omit<StudioSettings, 'customCharset' | 'fxSpeed' | 'fxIntensity'>;

export interface ModeSpecificState {
  // Image mode
  sampleName: SampleArtworkName;
  hasCustomImage: boolean;

  // Text mode
  bannerText: string;
  bannerFont: string;
  bannerStyle: BannerStyle;

  // Animate mode
  animPreset: AnimPreset;
  animPlaying: boolean;
  animFps: number;
  hasCustomVideo: boolean;

  // Paint mode
  paintTool: PaintTool;
  paintChar: string;
  paintSize: number;
  paintColor: string;
  paintOnionSkin: boolean;
  paintFlipbookPlaying: boolean;
  paintFlipbookFps: number;
  paintFrameIdx: number;
  paintFrameCount: number;

  // 3D mode
  obj3d: Object3DType;
  autoSpin3d: boolean;
}

export interface AudioState {
  active: boolean;
  mode: AudioSourceMode;
  playing: boolean;
  fxTarget: AudioFxTarget;
  sensitivity: number;
  fileName: string | null;
}

export interface MediaCaptureState {
  camActive: boolean;
  screenActive: boolean;
  frozen: boolean;
  mirror: boolean;
}
