import React, { useRef, useState } from 'react';
import {
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
  Upload,
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import type { SampleArtworkName } from '../types/studio';

const SAMPLES: { id: SampleArtworkName; label: string }[] = [
  { id: 'sphere', label: 'Sphere' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'wave', label: 'Waves' },
  { id: 'portrait', label: 'Cyber' },
];

export const ImageModePage: React.FC = () => {
  const {
    modeState,
    settings,
    selectSampleArtwork,
    handleImageFile,
    transformImage,
    applyPhotoDetailPreset,
  } = useStudio();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleImageFile(file);
        }}
        className={`group rounded-xl border border-dashed p-4 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-zinc-50/70 dark:bg-zinc-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
            e.target.value = '';
          }}
        />
        <Upload className="w-4 h-4 mx-auto mb-1.5 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors" />
        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
          Drop photo or click to browse
        </p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          PNG, JPG, WebP, or GIF
        </p>
      </div>

      {/* Built-in Procedural Samples */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Sample artworks
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {SAMPLES.map((sample) => {
            const active =
              !modeState.hasCustomImage && modeState.sampleName === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => selectSampleArtwork(sample.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {sample.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Image Transform */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Transform source
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            title="Flip Horizontal"
            onClick={() => transformImage('flipH')}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <FlipHorizontal2 className="w-3.5 h-3.5 shrink-0" />
            <span>H</span>
          </button>
          <button
            type="button"
            title="Flip Vertical"
            onClick={() => transformImage('flipV')}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <FlipVertical2 className="w-3.5 h-3.5 shrink-0" />
            <span>V</span>
          </button>
          <button
            type="button"
            title="Rotate 90° Clockwise"
            onClick={() => transformImage('rotateCw')}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span>90°</span>
          </button>
          <button
            type="button"
            title="Center Square 1:1 Crop"
            onClick={() => transformImage('cropSquare')}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <Crop className="w-3.5 h-3.5 shrink-0" />
            <span>1:1</span>
          </button>
        </div>
      </div>

      {/* 1-Click Detail Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Detail presets
          </span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Auto-fit
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'photo_hd', label: 'HD ASCII' },
              { id: 'braille_hd', label: 'Braille 2×4' },
              { id: 'halfblock_hd', label: 'Photo HD ▀' },
            ] as const
          ).map((preset) => {
            const active = settings.detailMode === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPhotoDetailPreset(preset.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
