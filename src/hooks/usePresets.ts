import { useCallback, useState } from 'react';
import { PRESET_STORAGE_KEY } from '../constants/studio';
import type {
  CharsetKey,
  ColorPalette,
  DetailMode,
  FrameStyle,
  RenderFxMode,
  StudioPresetData,
  StudioSettings,
} from '../types/studio';

function readStoredPresets(): Record<string, StudioPresetData> {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function generateSurpriseSettings(): Partial<StudioSettings> {
  const engines: DetailMode[] = ['standard', 'photo_hd', 'braille_hd', 'halfblock_hd'];
  const charsets: CharsetKey[] = ['standard', 'detailed', 'blocks', 'braille', 'matrix'];
  const palettes: ColorPalette[] = [
    'mono',
    'original',
    'gameboy',
    'vaporwave',
    'thermal',
    'cyberpunk',
    'rainbow',
  ];
  const tints = ['#4ade80', '#38bdf8', '#fbbf24', '#f472b6', '#e4e4e7'];
  const bgs = ['#09090b', '#021408', '#0c1222'];
  const fxs: RenderFxMode[] = ['none', 'none', 'wave', 'glitch', 'scanline', 'pulse'];
  const frames: FrameStyle[] = ['none', 'double', 'macos', 'dos'];

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const colorPalette = pick(palettes);

  return {
    detailMode: pick(engines),
    charsetKey: pick(charsets),
    colorPalette,
    color: colorPalette !== 'mono',
    tintHex: pick(tints),
    canvasBg: pick(bgs),
    neonGlow: Math.random() > 0.45 ? Math.floor(Math.random() * 10) + 3 : 0,
    crt: Math.random() > 0.55,
    fxMode: pick(fxs),
    frameStyle: pick(frames),
    contrast: Number((1.0 + Math.random() * 0.45).toFixed(2)),
    sharpen: Math.random() > 0.5 ? 0.35 : 0,
  };
}

export function usePresets() {
  const [presets, setPresets] = useState<Record<string, StudioPresetData>>(() =>
    readStoredPresets()
  );

  const savePreset = useCallback((name: string, settings: StudioSettings) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const snapshot: StudioPresetData = {
      detailMode: settings.detailMode,
      charsetKey: settings.charsetKey,
      width: settings.width,
      aspect: settings.aspect,
      contrast: settings.contrast,
      brightness: settings.brightness,
      sharpen: settings.sharpen,
      invert: settings.invert,
      dither: settings.dither,
      edgeDetect: settings.edgeDetect,
      crt: settings.crt,
      cutoutMode: settings.cutoutMode,
      cutoutThreshold: settings.cutoutThreshold,
      color: settings.color,
      colorPalette: settings.colorPalette,
      tintHex: settings.tintHex,
      canvasBg: settings.canvasBg,
      neonGlow: settings.neonGlow,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      fxMode: settings.fxMode,
      mouseFx: settings.mouseFx,
      frameStyle: settings.frameStyle,
      watermark: settings.watermark,
    };

    setPresets((prev) => {
      const next = { ...prev, [trimmed]: snapshot };
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
    return true;
  }, []);

  const deletePreset = useCallback((name: string) => {
    setPresets((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      try {
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  return {
    presets,
    presetNames: Object.keys(presets),
    savePreset,
    deletePreset,
  };
}
