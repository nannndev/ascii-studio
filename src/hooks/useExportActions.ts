import { useCallback, useRef, useState } from 'react';
import {
  buildAnsiScript,
  buildStandaloneHtml,
  buildSvgDocument,
  copyTextToClipboard,
  drawAsciiToCanvas,
  encodeGif89a,
  triggerDownload,
} from '../lib/exporters';
import type { AsciiGrid, ModeSpecificState, StudioMode, StudioSettings } from '../types/studio';
import type { PaintRuntimeRef } from './usePaintFlipbook';

interface UseExportActionsParams {
  getLastGrid: () => AsciiGrid;
  getPlainText: () => string;
  getRenderedHtml: () => string;
  getSettings: () => StudioSettings;
  getMode: () => StudioMode;
  getModeState: () => ModeSpecificState;
  getFontSize: () => number;
  paintRef: React.MutableRefObject<PaintRuntimeRef>;
  exportCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  renderFrame: (now?: number, overrideOnionSkin?: boolean) => void;
  onSyncPaintFrame: (frameIdx: number, frameCount: number) => void;
  showToast: (msg: string) => void;
}

export function useExportActions({
  getLastGrid,
  getPlainText,
  getRenderedHtml,
  getSettings,
  getMode,
  getModeState,
  getFontSize,
  paintRef,
  exportCanvasRef,
  renderFrame,
  onSyncPaintFrame,
  showToast,
}: UseExportActionsParams) {
  const [isRecordingWebm, setIsRecordingWebm] = useState(false);
  const [isRecordingGif, setIsRecordingGif] = useState(false);

  const isRecordingWebmRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const copyPlain = useCallback(async () => {
    const text = getPlainText();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    showToast(ok ? 'Copied plain ASCII to clipboard' : 'Clipboard copy failed');
  }, [getPlainText, showToast]);

  const copyCodeBlock = useCallback(async () => {
    const text = getPlainText();
    if (!text) return;
    const trimmed = text
      .split('\n')
      .map((line) => line.replace(/\s+$/, ''))
      .join('\n');
    const ok = await copyTextToClipboard(`\`\`\`\n${trimmed}\n\`\`\``);
    showToast(
      ok ? 'Copied code block for Discord / WhatsApp' : 'Clipboard copy failed'
    );
  }, [getPlainText, showToast]);

  const downloadTxt = useCallback(() => {
    const text = getPlainText();
    if (!text) return;
    triggerDownload(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
      `ascii-studio-${Date.now()}.txt`
    );
    showToast('Exported .TXT file');
  }, [getPlainText, showToast]);

  const downloadAnsi = useCallback(() => {
    const grid = getLastGrid();
    if (!grid.length) return;
    const script = buildAnsiScript(grid, getSettings(), getMode());
    triggerDownload(
      new Blob([script], { type: 'text/x-shellscript' }),
      `ascii-terminal-${Date.now()}.sh`
    );
    showToast('Exported ANSI Terminal .SH script');
  }, [getLastGrid, getMode, getSettings, showToast]);

  const downloadPng = useCallback(() => {
    const canvas = exportCanvasRef.current;
    const grid = getLastGrid();
    if (!canvas || !grid.length) return;
    drawAsciiToCanvas(canvas, grid, getSettings(), getMode(), 14);
    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(blob, `ascii-studio-${Date.now()}.png`);
        showToast('Exported high-res .PNG');
      }
    }, 'image/png');
  }, [exportCanvasRef, getLastGrid, getMode, getSettings, showToast]);

  const downloadSvg = useCallback(() => {
    const grid = getLastGrid();
    if (!grid.length) return;
    const svgDoc = buildSvgDocument(grid, getSettings(), getMode());
    triggerDownload(
      new Blob([svgDoc], { type: 'image/svg+xml' }),
      `ascii-studio-${Date.now()}.svg`
    );
    showToast('Exported vector .SVG');
  }, [getLastGrid, getMode, getSettings, showToast]);

  const downloadHtml = useCallback(() => {
    const plain = getPlainText();
    if (!plain) return;
    const doc = buildStandaloneHtml(
      plain,
      getRenderedHtml(),
      getSettings(),
      getMode(),
      getFontSize()
    );
    triggerDownload(
      new Blob([doc], { type: 'text/html' }),
      `ascii-studio-${Date.now()}.html`
    );
    showToast('Exported standalone .HTML');
  }, [getFontSize, getMode, getPlainText, getRenderedHtml, getSettings, showToast]);

  const drawCurrentToWebmCanvas = useCallback(() => {
    const canvas = exportCanvasRef.current;
    if (!isRecordingWebmRef.current || !canvas) return;
    drawAsciiToCanvas(canvas, getLastGrid(), getSettings(), getMode(), 12);
  }, [exportCanvasRef, getLastGrid, getMode, getSettings]);

  const toggleWebmRecording = useCallback(() => {
    if (isRecordingWebmRef.current) {
      isRecordingWebmRef.current = false;
      setIsRecordingWebm(false);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    try {
      drawAsciiToCanvas(canvas, getLastGrid(), getSettings(), getMode(), 12);
      const stream = canvas.captureStream(18);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        triggerDownload(blob, `ascii-animation-${Date.now()}.webm`);
        showToast('Saved .WebM video');
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      isRecordingWebmRef.current = true;
      setIsRecordingWebm(true);
      showToast('Recording .WebM — click Stop Rec to save');
    } catch {
      showToast('WebM recording not supported in this browser');
    }
  }, [exportCanvasRef, getLastGrid, getMode, getSettings, showToast]);

  const recordAnimatedGif = useCallback(async () => {
    if (isRecordingGif) return;
    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    setIsRecordingGif(true);
    const mode = getMode();
    const p = paintRef.current;
    const isPaintFlipbook = mode === 'paint' && p.frames.length > 1;
    const totalCapture = isPaintFlipbook ? p.frames.length : 24;
    showToast(`Capturing ${totalCapture} frames for .GIF...`);

    try {
      const frames: Uint8ClampedArray[] = [];
      const tempCanvas = document.createElement('canvas');
      let gifW = 0;
      let gifH = 0;

      for (let f = 0; f < totalCapture; f++) {
        if (isPaintFlipbook) {
          p.frameIdx = f;
          p.grid = p.frames[f];
          onSyncPaintFrame(f, p.frames.length);
        }
        renderFrame(performance.now(), isPaintFlipbook ? false : undefined);
        drawAsciiToCanvas(canvas, getLastGrid(), getSettings(), mode, 10);

        const scale = Math.min(1, 460 / Math.max(1, canvas.width));
        gifW = Math.max(16, Math.round(canvas.width * scale));
        gifH = Math.max(16, Math.round(canvas.height * scale));
        tempCanvas.width = gifW;
        tempCanvas.height = gifH;
        const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
        if (tctx) {
          tctx.drawImage(canvas, 0, 0, gifW, gifH);
          frames.push(tctx.getImageData(0, 0, gifW, gifH).data);
        }
        await new Promise((r) => setTimeout(r, 85));
      }

      const modeState = getModeState();
      const delayCs = isPaintFlipbook
        ? Math.max(4, Math.round(100 / modeState.paintFlipbookFps))
        : 9;
      const gifBlob = encodeGif89a(frames, gifW, gifH, delayCs);
      triggerDownload(gifBlob, `ascii-studio-${Date.now()}.gif`);
      showToast('Saved animated .GIF');
    } catch {
      showToast('GIF export failed');
    } finally {
      setIsRecordingGif(false);
    }
  }, [
    exportCanvasRef,
    getLastGrid,
    getMode,
    getModeState,
    getSettings,
    isRecordingGif,
    onSyncPaintFrame,
    paintRef,
    renderFrame,
    showToast,
  ]);

  return {
    isRecordingWebm,
    isRecordingGif,
    isRecordingWebmRef,
    copyPlain,
    copyCodeBlock,
    downloadTxt,
    downloadAnsi,
    downloadPng,
    downloadSvg,
    downloadHtml,
    toggleWebmRecording,
    recordAnimatedGif,
    drawCurrentToWebmCanvas,
  };
}
