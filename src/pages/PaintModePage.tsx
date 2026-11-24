import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  Download,
  Eraser,
  PaintBucket,
  Pause,
  Pencil,
  Play,
  Plus,
  Redo2,
  Slash,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { QUICK_PAINT_CHARS } from '../constants/studio';
import { SliderField } from '../components/ui/SliderField';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useStudio } from '../context/StudioContext';
import type { PaintTool } from '../types/studio';

const TOOLS: { id: PaintTool; label: string; icon: React.ReactNode }[] = [
  { id: 'brush', label: 'Brush', icon: <Pencil className="w-3.5 h-3.5" /> },
  { id: 'eraser', label: 'Erase', icon: <Eraser className="w-3.5 h-3.5" /> },
  { id: 'line', label: 'Line', icon: <Slash className="w-3.5 h-3.5" /> },
  { id: 'box', label: 'Box', icon: <Square className="w-3.5 h-3.5" /> },
  { id: 'fill', label: 'Fill', icon: <PaintBucket className="w-3.5 h-3.5" /> },
];

export const PaintModePage: React.FC = () => {
  const {
    modeState,
    updateModeState,
    paintUndo,
    paintRedo,
    paintClear,
    paintImportCurrent,
    flipPrevFrame,
    flipNextFrame,
    flipTogglePlay,
    flipAddFrame,
    flipDuplicateFrame,
    flipDeleteFrame,
  } = useStudio();

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <div className="grid grid-cols-5 gap-1">
        {TOOLS.map((tool) => {
          const active = modeState.paintTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => updateModeState({ paintTool: tool.id })}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-medium border transition-colors ${
                active
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Char, Size, Color */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label
            htmlFor="paintCharInput"
            className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Character
          </label>
          <input
            id="paintCharInput"
            type="text"
            maxLength={1}
            value={modeState.paintChar}
            onChange={(e) =>
              updateModeState({ paintChar: e.target.value || '#' })
            }
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-center font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="paintSizeSelect"
            className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Brush size
          </label>
          <select
            id="paintSizeSelect"
            value={modeState.paintSize}
            onChange={(e) =>
              updateModeState({ paintSize: parseInt(e.target.value, 10) })
            }
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
          >
            <option value={1}>1×1</option>
            <option value={2}>2×2</option>
            <option value={3}>3×3</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="paintColorInput"
            className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1"
          >
            Ink color
          </label>
          <input
            id="paintColorInput"
            type="color"
            value={modeState.paintColor}
            onChange={(e) => updateModeState({ paintColor: e.target.value })}
            className="w-full h-[34px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer"
          />
        </div>
      </div>

      {/* Quick Characters */}
      <div className="flex flex-wrap gap-1">
        {QUICK_PAINT_CHARS.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => updateModeState({ paintChar: ch })}
            className={`w-7 h-7 rounded-md font-mono text-xs border transition-colors ${
              modeState.paintChar === ch
                ? 'border-indigo-500 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* History & Canvas Actions */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={paintUndo}
          title="Undo (Ctrl+Z)"
          className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors"
        >
          <Undo2 className="w-3 h-3" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={paintRedo}
          title="Redo (Ctrl+Y)"
          className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors"
        >
          <Redo2 className="w-3 h-3" />
          <span>Redo</span>
        </button>
        <button
          type="button"
          onClick={paintClear}
          className="py-1.5 rounded-lg text-[11px] font-medium border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={paintImportCurrent}
          title="Import current ASCII into paint canvas"
          className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium border border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Import</span>
        </button>
      </div>

      {/* Flipbook Animator */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Flipbook timeline
          </span>
          <span className="font-mono tabular-nums text-[11px] text-zinc-500 dark:text-zinc-400">
            Frame {modeState.paintFrameIdx + 1} / {Math.max(1, modeState.paintFrameCount)}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            title="Previous Frame"
            onClick={flipPrevFrame}
            className="inline-flex items-center justify-center py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Play / Pause Flipbook (Space)"
            onClick={flipTogglePlay}
            className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {modeState.paintFlipbookPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>
          <button
            type="button"
            title="Next Frame"
            onClick={flipNextFrame}
            className="inline-flex items-center justify-center py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Add Blank Frame"
            onClick={flipAddFrame}
            className="inline-flex items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
          <button
            type="button"
            title="Duplicate Current Frame"
            onClick={flipDuplicateFrame}
            className="inline-flex items-center justify-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500"
          >
            <CopyPlus className="w-3 h-3" />
            <span>Dup</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <ToggleSwitch
            label="Onion skin"
            checked={modeState.paintOnionSkin}
            onChange={(checked) => updateModeState({ paintOnionSkin: checked })}
            compact
          />
          <button
            type="button"
            title="Delete Current Frame"
            onClick={flipDeleteFrame}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>

        <SliderField
          id="flipFpsSlider"
          label="Flipbook FPS"
          valueLabel={`${modeState.paintFlipbookFps} FPS`}
          min={2}
          max={16}
          step={1}
          value={modeState.paintFlipbookFps}
          onChange={(val) => updateModeState({ paintFlipbookFps: val })}
        />
      </div>
    </div>
  );
};
