import React from 'react';
import { Minimize2, MoveHorizontal } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PreviewStage: React.FC = () => {
  const {
    mode,
    settings,
    fontSize,
    compareActive,
    comparePos,
    isFullscreen,
    toggleFullscreen,
    previewStageRef,
    asciiWrapperRef,
    asciiOutputRef,
    compareCanvasRef,
    onStagePointerDown,
    onStagePointerLeave,
    onSplitDragStart,
  } = useStudio();

  const cursorClass =
    mode === 'paint'
      ? 'cursor-crosshair select-none'
      : mode === '3d'
      ? 'cursor-grab active:cursor-grabbing select-none'
      : 'select-text';

  return (
    <div
      ref={previewStageRef}
      style={{ backgroundColor: settings.canvasBg }}
      className={`stage-grid-overlay relative flex-1 overflow-auto flex p-5 transition-colors duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {isFullscreen && (
        <button
          type="button"
          onClick={() => toggleFullscreen(true)}
          className="fixed top-4 right-4 z-[60] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900/90 border border-white/15 text-white text-xs font-semibold shadow-xl hover:bg-indigo-600 transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Fullscreen (F / Esc)</span>
        </button>
      )}

      <div
        ref={asciiWrapperRef}
        className="relative inline-block m-auto shrink-0 rounded-lg ring-1 ring-white/10 shadow-2xl"
      >
        <pre
          ref={asciiOutputRef}
          onMouseDown={onStagePointerDown}
          onTouchStart={onStagePointerDown}
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
          className={`ascii-pre font-mono text-zinc-200 block ${cursorClass}`}
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

      {/* CRT Scanline Overlay */}
      {settings.crt && (
        <div
          aria-hidden="true"
          className="crt-overlay pointer-events-none fixed md:absolute inset-0"
        />
      )}
    </div>
  );
};
