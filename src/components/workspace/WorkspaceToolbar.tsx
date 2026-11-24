import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Code2,
  Columns2,
  Copy,
  Download,
  Film,
  Image as ImageIcon,
  Keyboard,
  Maximize2,
  Minus,
  PanelLeft,
  Plus,
  Scan,
  Terminal,
  FileCode2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const WorkspaceToolbar: React.FC = () => {
  const {
    sidebarOpen,
    toggleSidebar,
    fontSize,
    zoomOut,
    zoomIn,
    fitAsciiToViewport,
    gridDims,
    compareActive,
    toggleCompare,
    toggleFullscreen,
    setShortcutsModalOpen,
    setEmbedModalOpen,
    copyPlain,
    copyCodeBlock,
    downloadTxt,
    downloadAnsi,
    downloadPng,
    downloadSvg,
    downloadHtml,
    isRecordingWebm,
    isRecordingGif,
    toggleWebmRecording,
    recordAnimatedGif,
  } = useStudio();

  const [exportOpen, setExportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [exportOpen]);

  return (
    <div className="shrink-0 px-3 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
      {/* Left: Panel Toggle, Zoom, Fit, Split, Fullscreen, Shortcuts & Dimensions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Toggle Inspector Panel (Z)"
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
            sidebarOpen
              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500'
              : 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
          }`}
        >
          <PanelLeft className="w-3.5 h-3.5" />
          <span>Inspector</span>
        </button>

        {/* Zoom Stepper */}
        <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
          <button
            type="button"
            onClick={zoomOut}
            aria-label="Zoom out"
            className="px-2 py-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-[11px] font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200 min-w-[42px] text-center">
            {fontSize}px
          </span>
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Zoom in"
            className="px-2 py-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={fitAsciiToViewport}
          title="Fit to Viewport (0)"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Fit</span>
        </button>

        <button
          type="button"
          onClick={toggleCompare}
          title="Toggle Before / After Split Comparison"
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
            compareActive
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500'
          }`}
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>

        <button
          type="button"
          onClick={() => toggleFullscreen()}
          title="Fullscreen Presentation (F)"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Full</span>
        </button>

        <button
          type="button"
          onClick={() => setShortcutsModalOpen(true)}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Quiet unboxed tabular metadata */}
        <span className="hidden sm:inline text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400 pl-1.5">
          {gridDims.cols}×{gridDims.rows}
        </span>
      </div>

      {/* Right: Copy, Export Menu & Recording */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => void copyPlain()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </button>

        <button
          type="button"
          onClick={() => void copyCodeBlock()}
          title="Copy wrapped in code block for WhatsApp/Discord"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Copy ```</span>
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl py-1 z-40">
              <button
                type="button"
                onClick={() => {
                  downloadTxt();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Plain Text (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadAnsi();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>ANSI Terminal (.sh)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadPng();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Raster Image (.png)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadSvg();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Vector Graphic (.svg)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadHtml();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Standalone Page (.html)</span>
              </button>
              <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
              <button
                type="button"
                onClick={() => {
                  setExportOpen(false);
                  setEmbedModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Embed Widget (HTML / React)</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleWebmRecording}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
            isRecordingWebm
              ? 'border-rose-500 bg-rose-600 text-white'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-rose-500'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>{isRecordingWebm ? 'Stop Rec' : 'WebM'}</span>
        </button>

        <button
          type="button"
          disabled={isRecordingGif}
          onClick={() => void recordAnimatedGif()}
          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap disabled:opacity-60 ${
            isRecordingGif
              ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300'
              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-amber-500'
          }`}
        >
          <span>{isRecordingGif ? 'Encoding...' : 'GIF'}</span>
        </button>
      </div>
    </div>
  );
};
