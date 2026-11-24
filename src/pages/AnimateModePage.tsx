import React, { useRef } from 'react';
import { Pause, Play, Video } from 'lucide-react';
import { SliderField } from '../components/ui/SliderField';
import { useStudio } from '../context/StudioContext';
import type { AnimPreset } from '../types/studio';

const ANIM_PRESETS: { id: AnimPreset; label: string }[] = [
  { id: 'orbit', label: '3D Orbit' },
  { id: 'plasma', label: 'Plasma' },
  { id: 'rain', label: 'Matrix' },
  { id: 'radar', label: 'Radar' },
  { id: 'bars', label: 'Equalizer' },
  { id: 'cube', label: '3D Cube' },
];

export const AnimateModePage: React.FC = () => {
  const {
    modeState,
    updateModeState,
    selectAnimPreset,
    toggleAnimPlayPause,
    handleVideoFile,
  } = useStudio();
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Procedural scenes
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {ANIM_PRESETS.map((preset) => {
            const active =
              !modeState.hasCustomVideo && modeState.animPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectAnimPreset(preset.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAnimPlayPause}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap"
        >
          {modeState.animPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Upload Video</span>
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <SliderField
        id="fpsSlider"
        label="Playback FPS"
        valueLabel={`${modeState.animFps} FPS`}
        min={8}
        max={30}
        step={2}
        value={modeState.animFps}
        onChange={(val) => updateModeState({ animFps: val })}
      />
    </div>
  );
};
