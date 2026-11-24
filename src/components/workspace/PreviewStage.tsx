import React, { useEffect, useRef, useState } from 'react';
import {
  Hand,
  Minimize2,
  Minus,
  MoveHorizontal,
  Plus,
  Scan,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PreviewStage: React.FC = () => {
  const {
    mode,
    modeState,
    settings,
    fontSize,
    zoomPercent,
    minFontSize,
    maxFontSize,
    zoomIn,
    zoomOut,
    setZoomFontSize,
    zoomByFactor,
    fitAsciiToViewport,
    compareActive,
    comparePos,
    isFullscreen,
    toggleFullscreen,
    stageContainerRef,
    previewStageRef,
    asciiWrapperRef,
    asciiOutputRef,
    compareCanvasRef,
    onStagePointerDown,
    onStagePointerLeave,
    onSplitDragStart,
  } = useStudio();

  const [panMode, setPanMode] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const panStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const pinchDistRef = useRef<number | null>(null);

  // Wheel zoom & two-finger touch pinch directly on the canvas stage
  useEffect(() => {
    const stage = previewStageRef.current;
    if (!stage) return;

    const handleWheel = (e: WheelEvent) => {
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= 120;

      // Trackpad pinch (ctrlKey/metaKey) or vertical wheel zooms the canvas
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const clamped = Math.max(-100, Math.min(100, dy));
        const factor = Math.exp(-clamped * 0.01);
        zoomByFactor(factor, { clientX: e.clientX, clientY: e.clientY });
        return;
      }

      // Let Shift+Wheel or horizontal trackpad swipes scroll naturally
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      if (dy !== 0) {
        e.preventDefault();
        const clamped = Math.max(-120, Math.min(120, dy));
        const factor = Math.exp(-clamped * 0.0026);
        zoomByFactor(factor, { clientX: e.clientX, clientY: e.clientY });
      }
    };

    const getTouchMetrics = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return {
        dist: Math.hypot(dx, dy),
        midX: (touches[0].clientX + touches[1].clientX) / 2,
        midY: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchDistRef.current = getTouchMetrics(e.touches).dist;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchDistRef.current !== null) {
        e.preventDefault();
        const { dist, midX, midY } = getTouchMetrics(e.touches);
        if (pinchDistRef.current > 0 && dist > 0) {
          const ratio = dist / pinchDistRef.current;
          if (Math.abs(ratio - 1) > 0.005) {
            zoomByFactor(ratio, { clientX: midX, clientY: midY });
            pinchDistRef.current = dist;
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchDistRef.current = null;
      }
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    stage.addEventListener('touchstart', handleTouchStart, { passive: true });
    stage.addEventListener('touchmove', handleTouchMove, { passive: false });
    stage.addEventListener('touchend', handleTouchEnd, { passive: true });
    stage.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      stage.removeEventListener('wheel', handleWheel);
      stage.removeEventListener('touchstart', handleTouchStart);
      stage.removeEventListener('touchmove', handleTouchMove);
      stage.removeEventListener('touchend', handleTouchEnd);
      stage.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [previewStageRef, zoomByFactor]);

  // Global mouse pan tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!panStateRef.current.active) return;
      const stage = previewStageRef.current;
      if (!stage) return;
      const dx = e.clientX - panStateRef.current.startX;
      const dy = e.clientY - panStateRef.current.startY;
      stage.scrollLeft = panStateRef.current.scrollLeft - dx;
      stage.scrollTop = panStateRef.current.scrollTop - dy;
    };

    const onMouseUp = () => {
      if (!panStateRef.current.active) return;
      panStateRef.current.active = false;
      setIsPanning(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [previewStageRef]);

  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = previewStageRef.current;
    if (!stage) return;

    const clickedOutsideArtwork =
      asciiWrapperRef.current &&
      !asciiWrapperRef.current.contains(e.target as Node);

    const shouldPan =
      e.button === 1 || (e.button === 0 && (panMode || clickedOutsideArtwork));

    if (!shouldPan) return;

    e.preventDefault();
    panStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: stage.scrollLeft,
      scrollTop: stage.scrollTop,
    };
    setIsPanning(true);
  };

  const handleStageDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickedOutsideArtwork =
      asciiWrapperRef.current &&
      !asciiWrapperRef.current.contains(e.target as Node);
    if (clickedOutsideArtwork || panMode) {
      fitAsciiToViewport();
    }
  };

  const handlePrePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (panMode) return;
    onStagePointerDown(e);
  };

  const is3DOrbitable =
    mode === '3d' || (mode === 'flowers' && modeState.flower.dimension === '3d');

  const cursorClass = panMode
    ? isPanning
      ? 'cursor-grabbing select-none'
      : 'cursor-grab select-none'
    : mode === 'paint'
    ? 'cursor-crosshair select-none'
    : is3DOrbitable
    ? 'cursor-grab active:cursor-grabbing select-none'
    : 'select-text';

  const isLightCanvas = settings.canvasBg.toLowerCase() === '#fafaf9';

  // Logarithmic slider mapping for uniform perceptual zoom across 1.5px..64px
  const logMin = Math.log(minFontSize);
  const logMax = Math.log(maxFontSize);
  const clampedFont = Math.max(minFontSize, Math.min(maxFontSize, fontSize));
  const sliderPos = ((Math.log(clampedFont) - logMin) / (logMax - logMin)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ratio = Number(e.target.value) / 100;
    const nextPx = Math.exp(logMin + ratio * (logMax - logMin));
    setZoomFontSize(nextPx);
  };

  return (
    <div
      ref={stageContainerRef}
      style={{ backgroundColor: settings.canvasBg }}
      className={`relative flex-1 min-h-0 flex flex-col transition-colors duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Scrollable, zoomable & pannable ASCII canvas viewport */}
      <div
        ref={previewStageRef}
        onMouseDown={handleStageMouseDown}
        onDoubleClick={handleStageDoubleClick}
        className={`${
          isLightCanvas ? 'stage-grid-light' : 'stage-grid-overlay'
        } relative flex-1 overflow-auto flex p-5 ${
          isPanning ? 'cursor-grabbing select-none' : panMode ? 'cursor-grab' : ''
        }`}
      >
        <div
          ref={asciiWrapperRef}
          className={`relative inline-block m-auto shrink-0 rounded-lg transition-shadow ${
            isLightCanvas
              ? 'ring-1 ring-zinc-900/10 bg-white/70 shadow-lg'
              : 'ring-1 ring-white/10 shadow-2xl'
          }`}
        >
          <pre
            ref={asciiOutputRef}
            onMouseDown={handlePrePointerDown}
            onTouchStart={handlePrePointerDown}
            onMouseLeave={onStagePointerLeave}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: String(settings.lineHeight),
              letterSpacing: `${settings.letterSpacing}px`,
              textShadow:
                settings.neonGlow > 0
                  ? `0 0 ${settings.neonGlow}px currentColor, 0 0 ${
                      settings.neonGlow * 2
                    }px currentColor`
                  : 'none',
            }}
            className={`ascii-pre font-mono block ${
              isLightCanvas ? 'text-zinc-900' : 'text-zinc-200'
            } ${cursorClass}`}
          />

          {/* Before / After Original Image Overlay */}
          {compareActive && mode !== 'paint' && (
            <>
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
                style={{
                  clipPath: `inset(0 calc(100% - ${comparePos}%) 0 0)`,
                }}
              >
                <canvas ref={compareCanvasRef} className="w-full h-full block" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono tracking-wide">
                  Original
                </span>
              </div>

              {/* Draggable Split Divider Handle */}
              <div
                onMouseDown={onSplitDragStart}
                onTouchStart={onSplitDragStart}
                style={{ left: `${comparePos}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 cursor-ew-resize z-10"
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-indigo-600 text-white border-2 border-white shadow-lg flex items-center justify-center select-none">
                  <MoveHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pinned Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          type="button"
          onClick={() => toggleFullscreen(true)}
          className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900/90 border border-white/15 text-white text-xs font-semibold shadow-xl hover:bg-indigo-600 transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Fullscreen (F / Esc)</span>
        </button>
      )}

      {/* Pinned Floating Canvas Zoom & Pan Dock */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className={`absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1 px-1.5 py-1 rounded-xl border backdrop-blur-md select-none transition-colors ${
          isLightCanvas
            ? 'bg-white/90 border-zinc-200/90 text-zinc-700 shadow-lg'
            : 'bg-zinc-900/90 border-zinc-700/75 text-zinc-200 shadow-xl'
        }`}
      >
        <button
          type="button"
          onClick={() => setPanMode((prev) => !prev)}
          title={
            panMode
              ? 'Pan Tool Active (Click to disable)'
              : 'Pan Tool (Drag canvas when zoomed)'
          }
          aria-label="Toggle canvas pan tool"
          aria-pressed={panMode}
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
            panMode
              ? 'bg-indigo-600 text-white'
              : isLightCanvas
              ? 'hover:bg-zinc-100 text-zinc-600'
              : 'hover:bg-zinc-800 text-zinc-300'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
        </button>

        <div
          className={`w-px h-4 mx-0.5 ${
            isLightCanvas ? 'bg-zinc-200' : 'bg-zinc-700/80'
          }`}
        />

        <button
          type="button"
          onClick={zoomOut}
          disabled={fontSize <= minFontSize}
          title="Zoom Out (- or Scroll Down)"
          aria-label="Zoom out canvas"
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-35 ${
            isLightCanvas
              ? 'hover:bg-zinc-100 text-zinc-700'
              : 'hover:bg-zinc-800 text-zinc-200'
          }`}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={sliderPos}
          onChange={handleSliderChange}
          aria-label="Canvas zoom level"
          title={`Zoom: ${zoomPercent}% (${fontSize}px)`}
          className="hidden sm:block w-20 mx-1 cursor-pointer"
        />

        <button
          type="button"
          onClick={zoomIn}
          disabled={fontSize >= maxFontSize}
          title="Zoom In (+ or Scroll Up)"
          aria-label="Zoom in canvas"
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors disabled:opacity-35 ${
            isLightCanvas
              ? 'hover:bg-zinc-100 text-zinc-700'
              : 'hover:bg-zinc-800 text-zinc-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={fitAsciiToViewport}
          title={`Reset zoom to Fit (${fontSize}px)`}
          className={`px-1.5 h-7 rounded-lg text-[11px] font-mono tabular-nums font-medium min-w-[44px] text-center transition-colors ${
            isLightCanvas
              ? 'hover:bg-zinc-100 text-zinc-800'
              : 'hover:bg-zinc-800 text-zinc-100'
          }`}
        >
          {zoomPercent}%
        </button>

        <button
          type="button"
          onClick={fitAsciiToViewport}
          title="Fit Canvas to Viewport (0)"
          aria-label="Fit canvas to viewport"
          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
            isLightCanvas
              ? 'hover:bg-zinc-100 text-zinc-600'
              : 'hover:bg-zinc-800 text-zinc-300'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CRT Scanline Overlay pinned to viewport */}
      {settings.crt && (
        <div
          aria-hidden="true"
          className="crt-overlay pointer-events-none absolute inset-0 z-10"
        />
      )}
    </div>
  );
};
