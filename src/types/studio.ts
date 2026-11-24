export type StudioMode =
  | 'image'
  | 'flowers'
  | 'text'
  | 'animate'
  | 'camera'
  | 'paint'
  | '3d';

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

export type FlowerTemplateId =
  | 'rose'
  | 'lotus'
  | 'sakura'
  | 'sunflower'
  | 'tulip'
  | 'daisy'
  | 'orchid'
  | 'hibiscus'
  | 'dandelion'
  | 'bonsai'
  | 'bouquet'
  | 'neon_lily';

export type FlowerDimension = '3d' | '2d';

export type FlowerArrangement = 'single' | 'bouquet' | 'vase' | 'dome';

export type FlowerQuality = 'std' | 'hd' | '4k';

export type FlowerAtmosphere =
  | 'none'
  | 'petals'
  | 'fireflies'
  | 'rain'
  | 'snow'
  | 'starlight';

export type PosterAspectRatio = 'story_9_16' | 'square_1_1' | 'desktop_16_9';

export type FlowerStyleId =
  | 'colorful'
  | 'monochrome'
  | 'pastel'
  | 'neon'
  | 'golden'
  | 'sumie'
  | 'sunset'
  | 'matrix';

export interface FlowerConfig {
  template: FlowerTemplateId;
  dimension: FlowerDimension;
  arrangement: FlowerArrangement;
  quality: FlowerQuality;
  style: FlowerStyleId;
  bloom: number; // 0.15 to 1.0
  petalCount: number; // 5 to 20
  showStem: boolean;
  atmosphere: FlowerAtmosphere;
  windSway: boolean;
  autoBloom: boolean;
  autoSpin: boolean;
  audioBloom: boolean;

  // Custom color overrides
  customColorsEnabled: boolean;
  customPetalHex: string;
  customRibbonHex: string;
  customWrapHex: string;

  // ASCII Gift Card overlay
  giftCardEnabled: boolean;
  giftTitle: string;
  giftMessage: string;
  giftSender: string;

  // Name-to-Flower DNA seed
  dnaName: string;
}

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

  // Flower Arts mode
  flower: FlowerConfig;
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
