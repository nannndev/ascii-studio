import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_MODE_STATE,
  DEFAULT_SETTINGS,
  PATH_TO_MODE,
} from '../constants/studio';
import {
  FLORAL_CUSTOM_CHARSET,
  FLOWER_STYLES,
  FLOWER_TEMPLATES,
} from '../constants/flowers';
import { useAudioReactive } from '../hooks/useAudioReactive';
import { useExportActions } from '../hooks/useExportActions';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMediaCapture } from '../hooks/useMediaCapture';
import { usePaintFlipbook } from '../hooks/usePaintFlipbook';
import { generateSurpriseSettings, usePresets } from '../hooks/usePresets';
import { useTheme, type ThemeMode } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import {
  draw3DObject,
  drawProceduralAnimationFrame,
  drawSampleArtwork,
  drawTextBanner,
} from '../lib/artworkGenerators';
import { drawFlowerArtwork } from '../lib/flowerGenerator';
import {
  decodeFlowerShareParam,
  encodeFlowerShareUrl,
  generateFlowerFromName,
} from '../lib/flowerExtras';
import { copyTextToClipboard } from '../lib/exporters';
import {
  applyFlowerGiftCardFrame,
  applyPostFx,
  applyTerminalFrame,
  gridToPlainAndHtml,
  isColorRenderingEnabled,
  renderGridFromImageData,
} from '../lib/asciiRenderer';
import { transformCanvasImage } from '../lib/imageProcessing';
import type {
  AnimPreset,
  AsciiGrid,
  AudioFxTarget,
  AudioState,
  DetailMode,
  FlowerArrangement,
  FlowerAtmosphere,
  FlowerConfig,
  FlowerQuality,
  FlowerStyleId,
  FlowerTemplateId,
  ImageTransformAction,
  MediaCaptureState,
  ModeSpecificState,
  Object3DType,
  PosterAspectRatio,
  SampleArtworkName,
  StudioMode,
  StudioPresetData,
  StudioSettings,
} from '../types/studio';

interface StudioContextValue {
  mode: StudioMode;
  theme: ThemeMode;
  toggleTheme: () => void;

  settings: StudioSettings;
  updateSettings: (
    patch: Partial<StudioSettings>,
    options?: { fitAfter?: boolean; resetFxTime?: boolean }
  ) => void;
  resetAllSettings: () => void;
  applyPhotoDetailPreset: (preset: Extract<DetailMode, 'photo_hd' | 'braille_hd' | 'halfblock_hd'>) => void;
  triggerSurpriseMe: () => void;
  replayFx: () => void;

  modeState: ModeSpecificState;
  updateModeState: (patch: Partial<ModeSpecificState>) => void;

  // Image mode actions
  selectSampleArtwork: (sample: SampleArtworkName) => void;
  handleImageFile: (file: File) => void;
  transformImage: (action: ImageTransformAction) => void;

  // Animate / Video mode actions
  selectAnimPreset: (preset: AnimPreset) => void;
  toggleAnimPlayPause: () => void;
  handleVideoFile: (file: File) => void;

  // Live Camera & Screen
  captureState: MediaCaptureState;
  toggleCamera: () => Promise<void>;
  toggleScreen: () => Promise<void>;
  toggleFreeze: () => void;
  setMirror: (mirror: boolean) => void;

  // Paint & Flipbook
  paintUndo: () => void;
  paintRedo: () => void;
  paintClear: () => void;
  paintImportCurrent: () => void;
  flipPrevFrame: () => void;
  flipNextFrame: () => void;
  flipTogglePlay: () => void;
  flipAddFrame: () => void;
  flipDuplicateFrame: () => void;
  flipDeleteFrame: () => void;

  // 3D mode actions
  selectObject3D: (obj: Object3DType) => void;
  reset3DCamera: () => void;

  // Flower Arts actions
  updateFlowerConfig: (patch: Partial<FlowerConfig>) => void;
  selectFlowerTemplate: (template: FlowerTemplateId) => void;
  selectFlowerArrangement: (arrangement: FlowerArrangement) => void;
  selectFlowerQuality: (quality: FlowerQuality) => void;
  selectFlowerStyle: (style: FlowerStyleId) => void;
  generateFlowerByName: (name: string) => void;
  copyFlowerShareLink: () => Promise<void>;
  randomizeFlowerArt: () => void;
  applyFloralGlyphs: () => void;
  resetFlowerCamera: () => void;

  // Audio reactive
  audioState: AudioState;
  meterBarRef: React.RefObject<HTMLDivElement | null>;
  handleAudioFile: (file: File) => void;
  toggleAudioPlayPause: () => void;
  toggleAudioMic: () => Promise<void>;
  setAudioFxTarget: (target: AudioFxTarget) => void;
  setAudioSensitivity: (sens: number) => void;

  // Presets
  presets: Record<string, StudioPresetData>;
  presetNames: string[];
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;

  // Stage & Viewport
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  fontSize: number;
  zoomPercent: number;
  minFontSize: number;
  maxFontSize: number;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoomFontSize: (px: number, anchor?: { clientX: number; clientY: number }) => void;
  zoomByFactor: (factor: number, anchor?: { clientX: number; clientY: number }) => void;
  fitAsciiToViewport: () => void;
  gridDims: { cols: number; rows: number };
  compareActive: boolean;
  comparePos: number;
  toggleCompare: () => void;
  setComparePos: (pct: number) => void;
  isFullscreen: boolean;
  toggleFullscreen: (forceExit?: boolean) => void;

  // Modals & Toast
  embedModalOpen: boolean;
  setEmbedModalOpen: (open: boolean) => void;
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
  toastMessage: string;
  toastVisible: boolean;
  showToast: (msg: string) => void;

  // Exports
  isRecordingWebm: boolean;
  isRecordingGif: boolean;
  copyPlain: () => Promise<void>;
  copyCodeBlock: () => Promise<void>;
  downloadTxt: () => void;
  downloadAnsi: () => void;
  downloadPng: () => void;
  downloadPoster: (aspect: PosterAspectRatio) => void;
  downloadSvg: () => void;
  downloadHtml: () => void;
  toggleWebmRecording: () => void;
  recordAnimatedGif: () => Promise<void>;
  getPlainAsciiText: () => string;

  // DOM refs for PreviewStage
  stageContainerRef: React.RefObject<HTMLDivElement | null>;
  previewStageRef: React.RefObject<HTMLDivElement | null>;
  asciiWrapperRef: React.RefObject<HTMLDivElement | null>;
  asciiOutputRef: React.RefObject<HTMLPreElement | null>;
  compareCanvasRef: React.RefObject<HTMLCanvasElement | null>;

  // Stage pointer handlers
  onStagePointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onStagePointerLeave: () => void;
  onSplitDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const mode: StudioMode = PATH_TO_MODE[location.pathname] ?? 'image';

  const { theme, toggleTheme: toggleThemeRaw } = useTheme();
  const { message: toastMessage, visible: toastVisible, showToast } = useToast();
  const {
    presets,
    presetNames,
    savePreset: savePresetRaw,
    deletePreset: deletePresetRaw,
  } = usePresets();

  const [settings, setSettings] = useState<StudioSettings>(() =>
    theme === 'light'
      ? { ...DEFAULT_SETTINGS, canvasBg: '#fafaf9', tintHex: '#18181b' }
      : DEFAULT_SETTINGS
  );
  const [modeState, setModeState] = useState<ModeSpecificState>(DEFAULT_MODE_STATE);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState(8);
  const [baseFitFontSize, setBaseFitFontSize] = useState(8);
  const [gridDims, setGridDims] = useState({ cols: 90, rows: 45 });
  const [compareActive, setCompareActive] = useState(false);
  const [comparePos, setComparePos] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  // Refs synced to latest React state for zero-overhead 60fps RAF loop
  const modeRef = useRef<StudioMode>(mode);
  modeRef.current = mode;
  const settingsRef = useRef<StudioSettings>(settings);
  settingsRef.current = settings;
  const modeStateRef = useRef<ModeSpecificState>(modeState);
  modeStateRef.current = modeState;
  const fontSizeRef = useRef(fontSize);
  fontSizeRef.current = fontSize;
  const compareActiveRef = useRef(compareActive);
  compareActiveRef.current = compareActive;

  // Stage & hidden media DOM refs
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const asciiWrapperRef = useRef<HTMLDivElement | null>(null);
  const asciiOutputRef = useRef<HTMLPreElement | null>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingZoomAnchorRef = useRef<{
    normX: number;
    normY: number;
    relX: number;
    relY: number;
  } | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  // High-frequency mutable engine state
  const lastFinalGridRef = useRef<AsciiGrid>([]);
  const plainAsciiTextRef = useRef('');
  const fxStartTimeRef = useRef(performance.now());
  const rot3dRef = useRef({ x: 0.55, y: 0.35, dragging: false, lastX: 0, lastY: 0 });
  const mouseRef = useRef({
    col: -999,
    row: -999,
    clickTime: 0,
    clickCol: -999,
    clickRow: -999,
  });
  const draggingSplitRef = useRef(false);
  const isFallbackFullscreenRef = useRef(false);
  const lastDimsRef = useRef({ cols: 0, rows: 0 });

  // Audio & Camera hooks
  const audio = useAudioReactive(showToast);
  const capture = useMediaCapture(showToast);

  // Forward ref to trigger render from sub-hooks
  const renderAsciiRef = useRef<(now?: number, overrideOnionSkin?: boolean) => void>(() => {});

  const syncPaintFrameState = useCallback(
    (frameIdx: number, frameCount: number, playing?: boolean) => {
      setModeState((prev) => ({
        ...prev,
        paintFrameIdx: frameIdx,
        paintFrameCount: frameCount,
        ...(playing !== undefined ? { paintFlipbookPlaying: playing } : {}),
      }));
    },
    []
  );

  const paint = usePaintFlipbook(
    DEFAULT_SETTINGS.tintHex,
    syncPaintFrameState,
    () => renderAsciiRef.current(),
    showToast
  );

  const getCurrentSourceDrawable = useCallback(():
    | HTMLCanvasElement
    | HTMLVideoElement
    | null => {
    const m = modeRef.current;
    const ms = modeStateRef.current;
    if (
      m === 'animate' &&
      ms.hasCustomVideo &&
      hiddenVideoRef.current &&
      hiddenVideoRef.current.readyState >= 2
    ) {
      return hiddenVideoRef.current;
    }
    if (
      m === 'camera' &&
      capture.captureRef.current.camActive &&
      capture.webcamVideoRef.current &&
      capture.webcamVideoRef.current.readyState >= 2
    ) {
      return capture.webcamVideoRef.current;
    }
    return sourceCanvasRef.current;
  }, [capture.captureRef, capture.webcamVideoRef]);

  const updateCompareOverlay = useCallback(() => {
    if (!compareActiveRef.current || modeRef.current === 'paint') return;
    const source = getCurrentSourceDrawable();
    const preEl = asciiOutputRef.current;
    const compareCanvas = compareCanvasRef.current;
    if (!source || !preEl || !compareCanvas) return;

    const srcW =
      source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const srcH =
      source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    if (!srcW || !srcH) return;

    const rect = preEl.getBoundingClientRect();
    const cw = Math.max(10, Math.round(rect.width));
    const ch = Math.max(10, Math.round(rect.height));
    if (compareCanvas.width !== cw || compareCanvas.height !== ch) {
      compareCanvas.width = cw;
      compareCanvas.height = ch;
    }
    const cctx = compareCanvas.getContext('2d');
    if (!cctx) return;

    cctx.clearRect(0, 0, cw, ch);
    cctx.save();
    if (
      modeRef.current === 'camera' &&
      capture.captureRef.current.mirror &&
      capture.captureRef.current.camActive
    ) {
      cctx.translate(cw, 0);
      cctx.scale(-1, 1);
    }
    cctx.drawImage(source, 0, 0, cw, ch);
    cctx.restore();
  }, [capture.captureRef, getCurrentSourceDrawable]);

  const renderAscii = useCallback(
    (now = performance.now(), overrideOnionSkin?: boolean) => {
      try {
        const currentMode = modeRef.current;
        const currentSettings = settingsRef.current;
        const currentModeState = modeStateRef.current;
        const preEl = asciiOutputRef.current;
        if (!preEl) return;

        const runtime = {
          now,
          fxStartTime: fxStartTimeRef.current,
          audioActive: audio.energyRef.current.active,
          audioBass: audio.energyRef.current.bass,
          audioFxTarget: audio.energyRef.current.fxTarget,
          mouseCol: mouseRef.current.col,
          mouseRow: mouseRef.current.row,
          mouseClickTime: mouseRef.current.clickTime,
          mouseClickCol: mouseRef.current.clickCol,
          mouseClickRow: mouseRef.current.clickRow,
        };

        let grid: AsciiGrid = [];

        if (currentMode === 'paint') {
          const p = paint.paintRef.current;
          const activePaint = p.previewGrid || p.grid;
          const showOnion =
            overrideOnionSkin !== undefined
              ? overrideOnionSkin
              : currentModeState.paintOnionSkin;
          const prevFrame =
            showOnion && !currentModeState.paintFlipbookPlaying && p.frameIdx > 0
              ? p.frames[p.frameIdx - 1]
              : null;

          grid = activePaint.map((row, y) =>
            row.map((c, x) => {
              if (
                c.ch === ' ' &&
                prevFrame &&
                prevFrame[y] &&
                prevFrame[y][x] &&
                prevFrame[y][x].ch !== ' '
              ) {
                const pf = prevFrame[y][x];
                return {
                  ch: pf.ch,
                  r: Math.round(pf.r * 0.32),
                  g: Math.round(pf.g * 0.32),
                  b: Math.round(pf.b * 0.45),
                };
              }
              return { ...c };
            })
          );
        } else {
          const srcCanvas = sourceCanvasRef.current;
          if (srcCanvas) {
            if (currentMode === 'text') {
              drawTextBanner(
                srcCanvas,
                currentModeState.bannerText,
                currentModeState.bannerFont,
                currentModeState.bannerStyle
              );
            } else if (
              currentMode === 'animate' &&
              !currentModeState.hasCustomVideo
            ) {
              drawProceduralAnimationFrame(
                srcCanvas,
                currentModeState.animPreset,
                now
              );
            } else if (currentMode === '3d') {
              draw3DObject(
                srcCanvas,
                currentModeState.obj3d,
                rot3dRef.current.x,
                rot3dRef.current.y
              );
            } else if (currentMode === 'flowers') {
              const audioBass = audio.energyRef.current.active
                ? audio.energyRef.current.bass
                : 0;
              drawFlowerArtwork(
                srcCanvas,
                currentModeState.flower,
                rot3dRef.current.x,
                rot3dRef.current.y,
                now,
                audioBass
              );
            }
          }

          const source = getCurrentSourceDrawable();
          const procCanvas = processingCanvasRef.current;
          if (!source || !procCanvas) return;

          const srcW =
            source instanceof HTMLVideoElement ? source.videoWidth : source.width;
          const srcH =
            source instanceof HTMLVideoElement ? source.videoHeight : source.height;
          if (!srcW || !srcH) return;

          const cols = currentSettings.width;
          const rows = Math.max(
            4,
            Math.round((srcH / srcW) * cols * currentSettings.aspect)
          );

          const subX = currentSettings.detailMode === 'braille_hd' ? 2 : 1;
          const subY =
            currentSettings.detailMode === 'braille_hd'
              ? 4
              : currentSettings.detailMode === 'halfblock_hd'
              ? 2
              : 1;
          const sampleW = cols * subX;
          const sampleH = rows * subY;

          procCanvas.width = sampleW;
          procCanvas.height = sampleH;
          const ctx = procCanvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;

          ctx.save();
          if (
            currentMode === 'camera' &&
            capture.captureRef.current.mirror &&
            capture.captureRef.current.camActive
          ) {
            ctx.translate(sampleW, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(source, 0, 0, sampleW, sampleH);
          ctx.restore();

          const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
          grid = renderGridFromImageData(
            imgData,
            cols,
            rows,
            sampleW,
            sampleH,
            currentMode,
            currentSettings,
            runtime
          );
        }

        const processedGrid = applyPostFx(grid, currentSettings, runtime);
        const finalGrid =
          currentMode === 'flowers' && currentModeState.flower.giftCardEnabled
            ? applyFlowerGiftCardFrame(
                processedGrid,
                currentModeState.flower.giftTitle,
                currentModeState.flower.giftMessage,
                currentModeState.flower.giftSender,
                currentSettings.tintHex
              )
            : applyTerminalFrame(
                processedGrid,
                currentSettings.frameStyle,
                currentSettings.watermark,
                currentSettings.tintHex
              );

        const useColor = isColorRenderingEnabled(currentSettings, currentMode);
        const { plainText, htmlText, cols, rows } = gridToPlainAndHtml(
          finalGrid,
          useColor
        );

        lastFinalGridRef.current = finalGrid;
        plainAsciiTextRef.current = plainText;

        if (
          lastDimsRef.current.cols !== cols ||
          lastDimsRef.current.rows !== rows
        ) {
          lastDimsRef.current = { cols, rows };
          setGridDims({ cols, rows });
        }

        if (useColor) {
          preEl.innerHTML = htmlText;
        } else {
          preEl.style.color = currentSettings.tintHex;
          preEl.textContent = plainText;
        }

        updateCompareOverlay();
      } catch (err) {
        console.error('ASCII render error:', err);
      }
    },
    [
      audio.energyRef,
      capture.captureRef,
      getCurrentSourceDrawable,
      paint.paintRef,
      updateCompareOverlay,
    ]
  );

  renderAsciiRef.current = renderAscii;

  const MIN_FONT_SIZE = 1.5;
  const MAX_FONT_SIZE = 64;

  const applyFontSize = useCallback(
    (px: number, anchor?: { clientX: number; clientY: number }) => {
      const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, px));
      const next = Math.round(clamped * 10) / 10;
      if (next === fontSizeRef.current) return;

      const stage = previewStageRef.current;
      const wrapper = asciiWrapperRef.current;
      if (stage && wrapper) {
        const stageRect = stage.getBoundingClientRect();
        const wrapRect = wrapper.getBoundingClientRect();
        if (wrapRect.width > 0 && wrapRect.height > 0) {
          const pointerX = anchor
            ? anchor.clientX
            : stageRect.left + stageRect.width / 2;
          const pointerY = anchor
            ? anchor.clientY
            : stageRect.top + stageRect.height / 2;
          pendingZoomAnchorRef.current = {
            normX: (pointerX - wrapRect.left) / wrapRect.width,
            normY: (pointerY - wrapRect.top) / wrapRect.height,
            relX: pointerX - stageRect.left,
            relY: pointerY - stageRect.top,
          };
        }
      }

      fontSizeRef.current = next;
      setFontSize(next);
    },
    []
  );

  useLayoutEffect(() => {
    const anchor = pendingZoomAnchorRef.current;
    if (!anchor) return;
    pendingZoomAnchorRef.current = null;

    const stage = previewStageRef.current;
    const wrapper = asciiWrapperRef.current;
    if (!stage || !wrapper) return;

    const stageRect = stage.getBoundingClientRect();
    const wrapRect = wrapper.getBoundingClientRect();
    const targetClientX = wrapRect.left + anchor.normX * wrapRect.width;
    const targetClientY = wrapRect.top + anchor.normY * wrapRect.height;
    const dx = targetClientX - (stageRect.left + anchor.relX);
    const dy = targetClientY - (stageRect.top + anchor.relY);

    if (Math.abs(dx) > 0.25) stage.scrollLeft += dx;
    if (Math.abs(dy) > 0.25) stage.scrollTop += dy;
  }, [fontSize]);

  const fitAsciiToViewport = useCallback(() => {
    const grid = lastFinalGridRef.current;
    const stage = previewStageRef.current;
    if (!grid.length || !stage) return;

    const cols = grid[0].length;
    const rows = grid.length;
    const availW = Math.max(160, stage.clientWidth - 40);
    const availH = Math.max(140, stage.clientHeight - 40);
    const sizeByW = availW / (cols * 0.62);
    const sizeByH =
      availH / (rows * Math.max(0.85, settingsRef.current.lineHeight));
    const best = Math.max(
      MIN_FONT_SIZE,
      Math.min(MAX_FONT_SIZE, Math.floor(Math.min(sizeByW, sizeByH) * 2) / 2)
    );
    pendingZoomAnchorRef.current = null;
    setBaseFitFontSize(best);
    fontSizeRef.current = best;
    setFontSize(best);
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
  }, []);

  const zoomByFactor = useCallback(
    (factor: number, anchor?: { clientX: number; clientY: number }) => {
      applyFontSize(fontSizeRef.current * factor, anchor);
    },
    [applyFontSize]
  );

  const zoomIn = useCallback(() => {
    const curr = fontSizeRef.current;
    const next = Math.max(curr + 0.5, curr * 1.18);
    applyFontSize(Math.round(next * 2) / 2);
  }, [applyFontSize]);

  const zoomOut = useCallback(() => {
    const curr = fontSizeRef.current;
    const next = Math.min(curr - 0.5, curr / 1.18);
    applyFontSize(Math.round(next * 2) / 2);
  }, [applyFontSize]);

  const zoomPercent = Math.max(
    10,
    Math.round((fontSize / Math.max(1, baseFitFontSize)) * 100)
  );

  const exportsApi = useExportActions({
    getLastGrid: () => lastFinalGridRef.current,
    getPlainText: () => plainAsciiTextRef.current,
    getRenderedHtml: () => asciiOutputRef.current?.innerHTML ?? '',
    getSettings: () => settingsRef.current,
    getMode: () => modeRef.current,
    getModeState: () => modeStateRef.current,
    getFontSize: () => fontSizeRef.current,
    paintRef: paint.paintRef,
    exportCanvasRef,
    renderFrame: renderAscii,
    onSyncPaintFrame: (idx, count) => syncPaintFrameState(idx, count),
    showToast,
  });

  // Initial artwork setup
  useEffect(() => {
    if (sourceCanvasRef.current) {
      drawSampleArtwork(sourceCanvasRef.current, DEFAULT_MODE_STATE.sampleName);
    }
    renderAscii();
    const timer = window.setTimeout(() => {
      fitAsciiToViewport();
    }, 80);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to route/mode changes
  const prevModeRef = useRef<StudioMode>(mode);
  const flowerVisitedRef = useRef(false);
  useEffect(() => {
    if (prevModeRef.current === 'camera' && mode !== 'camera') {
      capture.stopCapture();
    }
    prevModeRef.current = mode;

    if (mode === 'image' && !modeStateRef.current.hasCustomImage && sourceCanvasRef.current) {
      drawSampleArtwork(sourceCanvasRef.current, modeStateRef.current.sampleName);
    }

    if (mode === 'flowers') {
      rot3dRef.current.x = 0.34;
      rot3dRef.current.y = 0.25;
      const shared = decodeFlowerShareParam(location.search);
      if (shared) {
        flowerVisitedRef.current = true;
        setModeState((prev) => ({ ...prev, flower: shared.flower }));
        const preset = FLOWER_STYLES.find((s) => s.id === shared.flower.style);
        const is4k = shared.flower.quality === '4k';
        const isHd = shared.flower.quality === 'hd';
        const useColor = shared.flower.customColorsEnabled
          ? true
          : preset?.color ?? true;
        setSettings((prev) => ({
          ...prev,
          color: useColor,
          colorPalette: useColor ? 'original' : preset?.colorPalette ?? 'mono',
          canvasBg: preset?.canvasBg ?? prev.canvasBg,
          tintHex: preset?.tintHex ?? prev.tintHex,
          neonGlow: preset?.neonGlow ?? 0,
          width: is4k ? 240 : isHd ? 150 : 90,
          detailMode: is4k
            ? useColor
              ? 'halfblock_hd'
              : 'braille_hd'
            : isHd
            ? 'photo_hd'
            : 'standard',
          ...(shared.charsetKey ? { charsetKey: shared.charsetKey } : {}),
        }));
        showToast(
          shared.flower.giftCardEnabled && shared.flower.giftTitle
            ? `Opened Gift: ${shared.flower.giftTitle}`
            : 'Loaded shared 3D ASCII Flower'
        );
      } else if (!flowerVisitedRef.current) {
        flowerVisitedRef.current = true;
        if (modeStateRef.current.flower.style === 'colorful') {
          setSettings((prev) => ({
            ...prev,
            color: true,
            colorPalette: 'original',
          }));
        }
      }
    }

    renderAscii();
    if (mode === 'flowers') {
      window.setTimeout(fitAsciiToViewport, 45);
    }
  }, [mode, location.search, capture.stopCapture, fitAsciiToViewport, renderAscii, showToast]);

  // Re-render when settings or modeState change
  useEffect(() => {
    renderAscii();
  }, [settings, modeState, renderAscii]);

  // Update compare overlay when toggled
  useEffect(() => {
    if (compareActive) {
      updateCompareOverlay();
    }
  }, [compareActive, fontSize, updateCompareOverlay]);

  // Core RAF loop
  useEffect(() => {
    let rafId = 0;
    let lastLoopRender = 0;
    let lastFlipbookStep = 0;

    const tick = (now: number) => {
      audio.sampleAudioEnergy();

      const m = modeRef.current;
      const ms = modeStateRef.current;
      const st = settingsRef.current;

      if (m === '3d' && ms.autoSpin3d && !rot3dRef.current.dragging) {
        rot3dRef.current.y += 0.032;
        rot3dRef.current.x += 0.014;
      }

      if (
        m === 'flowers' &&
        ms.flower.dimension === '3d' &&
        ms.flower.autoSpin &&
        !rot3dRef.current.dragging
      ) {
        rot3dRef.current.y += 0.022;
      }

      if (
        m === 'paint' &&
        ms.paintFlipbookPlaying &&
        paint.paintRef.current.frames.length > 1
      ) {
        if (now - lastFlipbookStep >= 1000 / Math.max(2, ms.paintFlipbookFps)) {
          lastFlipbookStep = now;
          paint.selectFrame(paint.paintRef.current.frameIdx + 1);
          exportsApi.drawCurrentToWebmCanvas();
        }
      }

      const needsContinuous =
        (m === 'animate' && ms.animPlaying) ||
        (m === 'camera' &&
          capture.captureRef.current.camActive &&
          !capture.captureRef.current.frozen) ||
        (m === '3d' && ms.autoSpin3d) ||
        (m === 'flowers' &&
          (ms.flower.autoBloom ||
            ms.flower.windSway ||
            ms.flower.atmosphere !== 'none' ||
            ms.flower.audioBloom ||
            (ms.flower.dimension === '3d' && ms.flower.autoSpin))) ||
        audio.energyRef.current.active ||
        st.fxMode !== 'none' ||
        st.colorPalette === 'rainbow' ||
        (st.mouseFx === 'ripple' && now - mouseRef.current.clickTime < 1900);

      const targetFps =
        m === 'flowers' && ms.flower.quality === '4k'
          ? Math.min(12, ms.animFps)
          : ms.animFps;
      const frameInterval = 1000 / Math.max(8, targetFps);
      if (needsContinuous && now - lastLoopRender >= frameInterval) {
        lastLoopRender = now;
        renderAscii(now);
        exportsApi.drawCurrentToWebmCanvas();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    audio,
    capture.captureRef,
    exportsApi,
    paint,
    renderAscii,
  ]);

  // Cleanup uploaded video URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, []);

  // Fullscreen management
  const toggleFullscreen = useCallback(
    (forceExit = false) => {
      const stage = stageContainerRef.current ?? previewStageRef.current;
      const isNativeFs = !!document.fullscreenElement;

      if (forceExit || isNativeFs || isFallbackFullscreenRef.current) {
        if (isNativeFs && document.exitFullscreen) {
          void document.exitFullscreen().catch(() => {});
        }
        isFallbackFullscreenRef.current = false;
        setIsFullscreen(false);
        window.setTimeout(fitAsciiToViewport, 80);
        return;
      }

      if (stage?.requestFullscreen) {
        stage
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            window.setTimeout(fitAsciiToViewport, 100);
          })
          .catch(() => {
            isFallbackFullscreenRef.current = true;
            setIsFullscreen(true);
            window.setTimeout(fitAsciiToViewport, 80);
          });
      } else {
        isFallbackFullscreenRef.current = true;
        setIsFullscreen(true);
        window.setTimeout(fitAsciiToViewport, 80);
      }
    },
    [fitAsciiToViewport]
  );

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !isFallbackFullscreenRef.current) {
        setIsFullscreen(false);
        window.setTimeout(fitAsciiToViewport, 80);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [fitAsciiToViewport]);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    toggleThemeRaw();
    setSettings((prev) => {
      if (nextTheme === 'light' && prev.canvasBg !== '#fafaf9') {
        return {
          ...prev,
          canvasBg: '#fafaf9',
          tintHex: prev.tintHex === '#e4e4e7' ? '#18181b' : prev.tintHex,
        };
      }
      if (nextTheme === 'dark' && prev.canvasBg === '#fafaf9') {
        return {
          ...prev,
          canvasBg: '#09090b',
          tintHex: prev.tintHex === '#18181b' ? '#e4e4e7' : prev.tintHex,
        };
      }
      return prev;
    });
  }, [theme, toggleThemeRaw]);

  // Settings & actions
  const updateSettings = useCallback(
    (
      patch: Partial<StudioSettings>,
      options?: { fitAfter?: boolean; resetFxTime?: boolean }
    ) => {
      if (options?.resetFxTime) {
        fxStartTimeRef.current = performance.now();
      }
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (
          patch.detailMode === 'halfblock_hd' &&
          !prev.color &&
          prev.colorPalette === 'mono' &&
          patch.color === undefined
        ) {
          next.color = true;
          next.colorPalette = 'original';
        }
        if (patch.canvasBg === '#fafaf9' && prev.tintHex === '#e4e4e7' && !patch.tintHex) {
          next.tintHex = '#18181b';
        } else if (
          patch.canvasBg &&
          patch.canvasBg !== '#fafaf9' &&
          prev.tintHex === '#18181b' &&
          !patch.tintHex
        ) {
          next.tintHex = '#e4e4e7';
        }
        return next;
      });

      if (options?.fitAfter) {
        window.setTimeout(fitAsciiToViewport, 20);
      }
    },
    [fitAsciiToViewport]
  );

  const resetAllSettings = useCallback(() => {
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      tintHex: prev.tintHex,
      canvasBg: prev.canvasBg,
    }));
    window.setTimeout(fitAsciiToViewport, 20);
    showToast('All settings reset');
  }, [fitAsciiToViewport, showToast]);

  const applyPhotoDetailPreset = useCallback(
    (preset: Extract<DetailMode, 'photo_hd' | 'braille_hd' | 'halfblock_hd'>) => {
      if (preset === 'photo_hd') {
        updateSettings(
          {
            detailMode: 'photo_hd',
            width: 160,
            sharpen: 0.45,
            contrast: 1.15,
            charsetKey: 'detailed',
          },
          { fitAfter: true }
        );
        showToast('Switched to HD ASCII mode');
      } else if (preset === 'braille_hd') {
        updateSettings(
          {
            detailMode: 'braille_hd',
            width: 110,
            sharpen: 0.55,
            contrast: 1.2,
          },
          { fitAfter: true }
        );
        showToast('Switched to Braille 2×4 mode');
      } else {
        updateSettings(
          {
            detailMode: 'halfblock_hd',
            width: 130,
            sharpen: 0.35,
            contrast: 1.1,
            color: true,
            colorPalette: 'original',
          },
          { fitAfter: true }
        );
        showToast('Switched to Photo HD ▀ mode');
      }
    },
    [showToast, updateSettings]
  );

  const triggerSurpriseMe = useCallback(() => {
    const patch = generateSurpriseSettings();
    updateSettings(patch, { fitAfter: true, resetFxTime: true });
    showToast('Randomized style applied');
  }, [showToast, updateSettings]);

  const replayFx = useCallback(() => {
    fxStartTimeRef.current = performance.now();
    renderAscii();
  }, [renderAscii]);

  const updateModeState = useCallback((patch: Partial<ModeSpecificState>) => {
    setModeState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Image mode actions
  const selectSampleArtwork = useCallback(
    (sample: SampleArtworkName) => {
      setModeState((prev) => ({
        ...prev,
        sampleName: sample,
        hasCustomImage: false,
      }));
      if (sourceCanvasRef.current) {
        drawSampleArtwork(sourceCanvasRef.current, sample);
      }
      renderAscii();
    },
    [renderAscii]
  );

  const handleImageFile = useCallback(
    (file: File) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const srcCanvas = sourceCanvasRef.current;
          if (!srcCanvas) return;
          const maxDim = 960;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          srcCanvas.width = Math.round(img.width * scale);
          srcCanvas.height = Math.round(img.height * scale);
          srcCanvas
            .getContext('2d')
            ?.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);
          setModeState((prev) => ({ ...prev, hasCustomImage: true }));
          renderAscii();
          window.setTimeout(fitAsciiToViewport, 20);
          showToast(`Loaded ${file.name}`);
        };
        if (typeof ev.target?.result === 'string') {
          img.src = ev.target.result;
        }
      };
      reader.readAsDataURL(file);
    },
    [fitAsciiToViewport, renderAscii, showToast]
  );

  const transformImage = useCallback(
    (action: ImageTransformAction) => {
      if (!sourceCanvasRef.current) return;
      if (transformCanvasImage(sourceCanvasRef.current, action)) {
        renderAscii();
        window.setTimeout(fitAsciiToViewport, 20);
      }
    },
    [fitAsciiToViewport, renderAscii]
  );

  // Animate mode actions
  const selectAnimPreset = useCallback((preset: AnimPreset) => {
    hiddenVideoRef.current?.pause();
    setModeState((prev) => ({
      ...prev,
      animPreset: preset,
      hasCustomVideo: false,
    }));
  }, []);

  const toggleAnimPlayPause = useCallback(() => {
    setModeState((prev) => {
      const nextPlaying = !prev.animPlaying;
      if (prev.hasCustomVideo && hiddenVideoRef.current) {
        if (nextPlaying) void hiddenVideoRef.current.play();
        else hiddenVideoRef.current.pause();
      }
      return { ...prev, animPlaying: nextPlaying };
    });
  }, []);

  const handleVideoFile = useCallback(
    (file: File) => {
      const video = hiddenVideoRef.current;
      if (!file || !video) return;
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
      const url = URL.createObjectURL(file);
      videoUrlRef.current = url;
      video.src = url;
      void video.play();
      setModeState((prev) => ({
        ...prev,
        hasCustomVideo: true,
        animPlaying: true,
      }));
      showToast(`Playing video: ${file.name}`);
    },
    [showToast]
  );

  // Paint & Flipbook actions
  const flipTogglePlay = useCallback(() => {
    if (paint.paintRef.current.frames.length < 2) {
      showToast('Add at least 2 frames to play Flipbook');
      return;
    }
    setModeState((prev) => ({
      ...prev,
      paintFlipbookPlaying: !prev.paintFlipbookPlaying,
    }));
  }, [paint.paintRef, showToast]);

  // 3D actions
  const selectObject3D = useCallback((obj3d: Object3DType) => {
    setModeState((prev) => ({ ...prev, obj3d }));
  }, []);

  const reset3DCamera = useCallback(() => {
    rot3dRef.current.x = 0.55;
    rot3dRef.current.y = 0.35;
    renderAscii();
  }, [renderAscii]);

  // Flower Arts actions
  const updateFlowerConfig = useCallback((patch: Partial<FlowerConfig>) => {
    setModeState((prev) => ({
      ...prev,
      flower: { ...prev.flower, ...patch },
    }));
  }, []);

  const selectFlowerTemplate = useCallback((template: FlowerTemplateId) => {
    const meta = FLOWER_TEMPLATES.find((t) => t.id === template);
    setModeState((prev) => ({
      ...prev,
      flower: {
        ...prev.flower,
        template,
        arrangement:
          template === 'bouquet' ? 'bouquet' : prev.flower.arrangement,
        petalCount: meta ? meta.defaultPetals : prev.flower.petalCount,
      },
    }));
  }, []);

  const selectFlowerArrangement = useCallback(
    (arrangement: FlowerArrangement) => {
      setModeState((prev) => ({
        ...prev,
        flower: {
          ...prev.flower,
          arrangement,
          template:
            arrangement === 'single' && prev.flower.template === 'bouquet'
              ? 'rose'
              : prev.flower.template,
        },
      }));
      const labels: Record<FlowerArrangement, string> = {
        single: 'Single flower focus',
        bouquet: '3D Wrapped Bouquet active',
        vase: '3D Sculpted Vase active',
        dome: 'Enchanted 3D Glass Dome active',
      };
      showToast(labels[arrangement]);
    },
    [showToast]
  );

  const selectFlowerQuality = useCallback(
    (quality: FlowerQuality) => {
      setModeState((prev) => ({
        ...prev,
        flower: { ...prev.flower, quality },
      }));

      if (quality === '4k') {
        const useColorSubpixel = settingsRef.current.color;
        updateSettings(
          {
            width: 240,
            detailMode: useColorSubpixel ? 'halfblock_hd' : 'braille_hd',
            sharpen: 0.25,
          },
          { fitAfter: true }
        );
        showToast('4K Ultra-HD Mode (240 cols · Hi-Res 3D Mesh)');
      } else if (quality === 'hd') {
        updateSettings(
          {
            width: 150,
            detailMode: 'photo_hd',
            sharpen: 0.15,
          },
          { fitAfter: true }
        );
        showToast('HD Photo ASCII (150 cols)');
      } else {
        updateSettings(
          {
            width: 90,
            detailMode: 'standard',
            sharpen: 0,
          },
          { fitAfter: true }
        );
        showToast('Standard ASCII (90 cols)');
      }
    },
    [showToast, updateSettings]
  );

  const selectFlowerStyle = useCallback(
    (style: FlowerStyleId) => {
      const preset = FLOWER_STYLES.find((s) => s.id === style);
      setModeState((prev) => ({
        ...prev,
        flower: { ...prev.flower, style, customColorsEnabled: false },
      }));
      if (preset) {
        const isLightMono = style === 'monochrome' && theme === 'light';
        const is4k = modeStateRef.current.flower.quality === '4k';
        updateSettings({
          color: preset.color,
          colorPalette: preset.colorPalette,
          ...(is4k
            ? { detailMode: preset.color ? 'halfblock_hd' : 'braille_hd' }
            : {}),
          canvasBg: isLightMono
            ? '#fafaf9'
            : preset.canvasBg ?? settingsRef.current.canvasBg,
          tintHex: isLightMono
            ? '#18181b'
            : preset.tintHex ?? settingsRef.current.tintHex,
          neonGlow: preset.neonGlow,
        });
      }
    },
    [theme, updateSettings]
  );

  const generateFlowerByName = useCallback(
    (rawName: string) => {
      const clean = rawName.trim();
      if (!clean) {
        showToast('Enter a name first to generate its flower DNA');
        return;
      }
      const { patch, summary } = generateFlowerFromName(clean);
      setModeState((prev) => ({
        ...prev,
        flower: { ...prev.flower, ...patch },
      }));
      const is4k = modeStateRef.current.flower.quality === '4k';
      updateSettings({
        color: true,
        colorPalette: 'original',
        ...(is4k ? { detailMode: 'halfblock_hd' } : {}),
      });
      showToast(`"${clean}" DNA → ${summary}`);
    },
    [showToast, updateSettings]
  );

  const copyFlowerShareLink = useCallback(async () => {
    const url = encodeFlowerShareUrl(
      modeStateRef.current.flower,
      settingsRef.current
    );
    const ok = await copyTextToClipboard(url);
    showToast(
      ok
        ? 'Copied shareable 3D Flower Gift link!'
        : 'Could not copy link to clipboard'
    );
  }, [showToast]);

  const randomizeFlowerArt = useCallback(() => {
    const pick = <T,>(arr: readonly T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];
    const tpl = pick(FLOWER_TEMPLATES);
    const sty = pick(FLOWER_STYLES);
    const dim = Math.random() > 0.2 ? '3d' : '2d';
    const arrPool: FlowerArrangement[] = ['single', 'bouquet', 'vase', 'dome'];
    const arr: FlowerArrangement =
      tpl.id === 'bouquet' ? 'bouquet' : pick(arrPool);
    const atmoPool: FlowerAtmosphere[] = [
      'petals',
      'fireflies',
      'rain',
      'snow',
      'starlight',
    ];
    const bloom = Math.round((0.55 + Math.random() * 0.45) * 20) / 20;

    setModeState((prev) => ({
      ...prev,
      flower: {
        ...prev.flower,
        template: tpl.id,
        dimension: dim,
        arrangement: arr,
        style: sty.id,
        customColorsEnabled: false,
        bloom,
        petalCount: Math.max(
          5,
          Math.min(20, tpl.defaultPetals + Math.floor(Math.random() * 5) - 2)
        ),
        atmosphere: pick(atmoPool),
      },
    }));

    const is4k = modeStateRef.current.flower.quality === '4k';
    updateSettings({
      color: sty.color,
      colorPalette: sty.colorPalette,
      ...(is4k
        ? { detailMode: sty.color ? 'halfblock_hd' : 'braille_hd' }
        : {}),
      canvasBg: sty.canvasBg ?? '#09090b',
      tintHex: sty.tintHex ?? '#e4e4e7',
      neonGlow: sty.neonGlow,
    });
    showToast(
      `${tpl.label} · ${arr.toUpperCase()} (${dim.toUpperCase()} · ${sty.label})`
    );
  }, [showToast, updateSettings]);

  const applyFloralGlyphs = useCallback(() => {
    setModeState((prev) => ({
      ...prev,
      flower: {
        ...prev.flower,
        quality: prev.flower.quality === '4k' ? 'hd' : prev.flower.quality,
      },
    }));
    updateSettings({
      detailMode: 'standard',
      charsetKey: 'custom',
      customCharset: FLORAL_CUSTOM_CHARSET,
    });
    showToast('Applied Floral ASCII glyphs (✿❀❁*+~·)');
  }, [showToast, updateSettings]);

  const resetFlowerCamera = useCallback(() => {
    rot3dRef.current.x = 0.34;
    rot3dRef.current.y = 0.25;
    renderAscii();
  }, [renderAscii]);

  // Presets actions
  const savePreset = useCallback(
    (name: string) => {
      if (!name.trim()) {
        showToast('Enter a preset name first');
        return;
      }
      savePresetRaw(name, settingsRef.current);
      showToast(`Saved preset "${name.trim()}"`);
    },
    [savePresetRaw, showToast]
  );

  const loadPreset = useCallback(
    (name: string) => {
      const found = presets[name];
      if (!found) return;
      updateSettings(found, { fitAfter: true });
      showToast(`Loaded preset "${name}"`);
    },
    [presets, showToast, updateSettings]
  );

  const deletePreset = useCallback(
    (name: string) => {
      if (!name || !(name in presets)) return;
      deletePresetRaw(name);
      showToast(`Deleted preset "${name}"`);
    },
    [deletePresetRaw, presets, showToast]
  );

  // Pointer interaction on Stage (Paint, 3D Orbit, Mouse FX, Split Drag)
  const getCellCoords = useCallback(
    (clientX: number, clientY: number): { col: number; row: number } | null => {
      const preEl = asciiOutputRef.current;
      const grid = lastFinalGridRef.current;
      if (!preEl || !grid.length) return null;
      const rect = preEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const col = Math.floor(((clientX - rect.left) / rect.width) * grid[0].length);
      const row = Math.floor(((clientY - rect.top) / rect.height) * grid.length);
      return { col, row };
    },
    []
  );

  const onStagePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e && e.touches.length > 1) return;
      if (!('touches' in e) && e.button !== 0) return;

      const point =
        'touches' in e ? e.touches[0] : (e as React.MouseEvent);
      if (!point) return;

      const pos = getCellCoords(point.clientX, point.clientY);
      if (!pos) return;

      if (settingsRef.current.mouseFx === 'ripple') {
        mouseRef.current.clickCol = pos.col;
        mouseRef.current.clickRow = pos.row;
        mouseRef.current.clickTime = performance.now();
        renderAscii();
      }

      const is3DInteractive =
        modeRef.current === '3d' ||
        (modeRef.current === 'flowers' &&
          modeStateRef.current.flower.dimension === '3d');

      if (is3DInteractive) {
        e.preventDefault();
        rot3dRef.current.dragging = true;
        rot3dRef.current.lastX = point.clientX;
        rot3dRef.current.lastY = point.clientY;
        return;
      }

      if (modeRef.current === 'paint') {
        e.preventDefault();
        const ms = modeStateRef.current;
        paint.handlePaintPointerDown(
          pos,
          ms.paintTool,
          ms.paintChar,
          ms.paintColor,
          ms.paintSize
        );
      }
    },
    [getCellCoords, paint, renderAscii]
  );

  const onStagePointerLeave = useCallback(() => {
    mouseRef.current.col = -999;
    mouseRef.current.row = -999;
    if (settingsRef.current.mouseFx !== 'none') {
      renderAscii();
    }
  }, [renderAscii]);

  const onSplitDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      draggingSplitRef.current = true;
    },
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 1) {
        rot3dRef.current.dragging = false;
        return;
      }
      const point =
        'touches' in e ? e.touches[0] : (e as MouseEvent);
      if (!point) return;

      if (draggingSplitRef.current && asciiWrapperRef.current) {
        const rect = asciiWrapperRef.current.getBoundingClientRect();
        const pct = Math.max(
          0,
          Math.min(100, ((point.clientX - rect.left) / Math.max(1, rect.width)) * 100)
        );
        setComparePos(pct);
        return;
      }

      const is3DInteractive =
        modeRef.current === '3d' ||
        (modeRef.current === 'flowers' &&
          modeStateRef.current.flower.dimension === '3d');

      if (is3DInteractive && rot3dRef.current.dragging) {
        if ('touches' in e) e.preventDefault();
        rot3dRef.current.y += (point.clientX - rot3dRef.current.lastX) * 0.012;
        rot3dRef.current.x += (point.clientY - rot3dRef.current.lastY) * 0.012;
        rot3dRef.current.lastX = point.clientX;
        rot3dRef.current.lastY = point.clientY;
        renderAscii();
        return;
      }

      const pos = getCellCoords(point.clientX, point.clientY);
      if (!pos) return;
      mouseRef.current.col = pos.col;
      mouseRef.current.row = pos.row;

      if (settingsRef.current.mouseFx !== 'none' && modeRef.current !== 'paint') {
        renderAscii();
      }

      if (modeRef.current === 'paint' && paint.paintRef.current.drawing) {
        if ('touches' in e) e.preventDefault();
        const ms = modeStateRef.current;
        paint.handlePaintPointerMove(
          pos,
          ms.paintTool,
          ms.paintChar,
          ms.paintColor,
          ms.paintSize
        );
      }
    };

    const onUp = () => {
      draggingSplitRef.current = false;
      rot3dRef.current.dragging = false;
      paint.handlePaintPointerUp();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [getCellCoords, paint, renderAscii]);

  // Global keyboard shortcuts
  const shortcutHandlers = useMemo(
    () => ({
      mode,
      audioMode: audio.audioState.mode,
      onEscape: () => {
        setEmbedModalOpen(false);
        setShortcutsModalOpen(false);
        if (isFallbackFullscreenRef.current) toggleFullscreen(true);
      },
      onFullscreen: () => toggleFullscreen(),
      onSurpriseMe: triggerSurpriseMe,
      onToggleSidebar: () => setSidebarOpen((prev) => !prev),
      onToggleShortcuts: () => setShortcutsModalOpen((prev) => !prev),
      onZoomIn: zoomIn,
      onZoomOut: zoomOut,
      onFitScreen: fitAsciiToViewport,
      onPaintUndo: paint.undo,
      onPaintRedo: paint.redo,
      onSpaceAction: () => {
        if (modeRef.current === 'paint') flipTogglePlay();
        else if (modeRef.current === 'animate') toggleAnimPlayPause();
        else if (modeRef.current === 'flowers') {
          setModeState((prev) => ({
            ...prev,
            flower: {
              ...prev.flower,
              autoSpin:
                prev.flower.dimension === '3d'
                  ? !prev.flower.autoSpin
                  : prev.flower.autoSpin,
              autoBloom:
                prev.flower.dimension === '2d'
                  ? !prev.flower.autoBloom
                  : prev.flower.autoBloom,
            },
          }));
        } else if (audio.audioState.mode === 'file') audio.toggleAudioPlayPause();
      },
    }),
    [
      audio,
      fitAsciiToViewport,
      flipTogglePlay,
      mode,
      paint.redo,
      paint.undo,
      toggleAnimPlayPause,
      toggleFullscreen,
      triggerSurpriseMe,
      zoomIn,
      zoomOut,
    ]
  );

  useKeyboardShortcuts(shortcutHandlers);

  const value: StudioContextValue = {
    mode,
    theme,
    toggleTheme,

    settings,
    updateSettings,
    resetAllSettings,
    applyPhotoDetailPreset,
    triggerSurpriseMe,
    replayFx,

    modeState,
    updateModeState,

    selectSampleArtwork,
    handleImageFile,
    transformImage,

    selectAnimPreset,
    toggleAnimPlayPause,
    handleVideoFile,

    captureState: capture.captureState,
    toggleCamera: capture.toggleCamera,
    toggleScreen: capture.toggleScreen,
    toggleFreeze: capture.toggleFreeze,
    setMirror: capture.setMirror,

    paintUndo: paint.undo,
    paintRedo: paint.redo,
    paintClear: () => paint.clearCurrentFrame(settingsRef.current.tintHex),
    paintImportCurrent: () => paint.importGrid(lastFinalGridRef.current),
    flipPrevFrame: () => paint.selectFrame(paint.paintRef.current.frameIdx - 1, true),
    flipNextFrame: () => paint.selectFrame(paint.paintRef.current.frameIdx + 1, true),
    flipTogglePlay,
    flipAddFrame: () => paint.addBlankFrame(settingsRef.current.tintHex),
    flipDuplicateFrame: paint.duplicateFrame,
    flipDeleteFrame: paint.deleteFrame,

    selectObject3D,
    reset3DCamera,

    updateFlowerConfig,
    selectFlowerTemplate,
    selectFlowerArrangement,
    selectFlowerQuality,
    selectFlowerStyle,
    generateFlowerByName,
    copyFlowerShareLink,
    randomizeFlowerArt,
    applyFloralGlyphs,
    resetFlowerCamera,

    audioState: audio.audioState,
    meterBarRef: audio.meterBarRef,
    handleAudioFile: audio.handleAudioFile,
    toggleAudioPlayPause: audio.toggleAudioPlayPause,
    toggleAudioMic: audio.toggleMic,
    setAudioFxTarget: audio.setFxTarget,
    setAudioSensitivity: audio.setSensitivity,

    presets,
    presetNames,
    savePreset,
    loadPreset,
    deletePreset,

    sidebarOpen,
    toggleSidebar: () => setSidebarOpen((prev) => !prev),
    fontSize,
    zoomPercent,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE,
    zoomIn,
    zoomOut,
    setZoomFontSize: applyFontSize,
    zoomByFactor,
    fitAsciiToViewport,
    gridDims,
    compareActive,
    comparePos,
    toggleCompare: () => setCompareActive((prev) => !prev),
    setComparePos,
    isFullscreen,
    toggleFullscreen,

    embedModalOpen,
    setEmbedModalOpen,
    shortcutsModalOpen,
    setShortcutsModalOpen,
    toastMessage,
    toastVisible,
    showToast,

    isRecordingWebm: exportsApi.isRecordingWebm,
    isRecordingGif: exportsApi.isRecordingGif,
    copyPlain: exportsApi.copyPlain,
    copyCodeBlock: exportsApi.copyCodeBlock,
    downloadTxt: exportsApi.downloadTxt,
    downloadAnsi: exportsApi.downloadAnsi,
    downloadPng: exportsApi.downloadPng,
    downloadPoster: exportsApi.downloadPoster,
    downloadSvg: exportsApi.downloadSvg,
    downloadHtml: exportsApi.downloadHtml,
    toggleWebmRecording: exportsApi.toggleWebmRecording,
    recordAnimatedGif: exportsApi.recordAnimatedGif,
    getPlainAsciiText: () => plainAsciiTextRef.current,

    stageContainerRef,
    previewStageRef,
    asciiWrapperRef,
    asciiOutputRef,
    compareCanvasRef,

    onStagePointerDown,
    onStagePointerLeave,
    onSplitDragStart,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
      {/* Persistent offscreen canvases & media elements across route transitions */}
      <canvas ref={processingCanvasRef} className="hidden" />
      <canvas ref={sourceCanvasRef} className="hidden" />
      <canvas ref={exportCanvasRef} className="hidden" />
      <video
        ref={hiddenVideoRef}
        className="hidden"
        playsInline
        muted
        loop
        crossOrigin="anonymous"
      />
      <video
        ref={capture.webcamVideoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      <audio
        ref={audio.audioElRef}
        className="hidden"
        loop
        crossOrigin="anonymous"
      />
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
}
