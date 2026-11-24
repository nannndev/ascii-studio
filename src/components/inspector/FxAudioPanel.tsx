import React, { useRef } from 'react';
import { Mic, MicOff, Music, Pause, Play, RotateCcw } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import type {
  AudioFxTarget,
  FrameStyle,
  MouseFxMode,
  RenderFxMode,
} from '../../types/studio';
import { SelectField } from '../ui/SelectField';
import { SliderField } from '../ui/SliderField';

const RENDER_FX_OPTIONS: readonly { value: RenderFxMode; label: string }[] = [
  { value: 'none', label: 'None (Static)' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'scramble', label: 'Matrix Decode' },
  { value: 'wave', label: 'Wave Ripple' },
  { value: 'glitch', label: 'Cyber Glitch' },
  { value: 'scanline', label: 'Radar Scanline' },
  { value: 'pulse', label: 'Breathing Pulse' },
];

const MOUSE_FX_OPTIONS: readonly { value: MouseFxMode; label: string }[] = [
  { value: 'none', label: 'Off' },
  { value: 'spotlight', label: 'Spotlight Torch' },
  { value: 'repel', label: 'Magnetic Repel' },
  { value: 'ripple', label: 'Click Ripple' },
];

const FRAME_OPTIONS: readonly { value: FrameStyle; label: string }[] = [
  { value: 'none', label: 'No Frame' },
  { value: 'double', label: 'Double ╔═══╗' },
  { value: 'single', label: 'Single ┌───┐' },
  { value: 'macos', label: 'macOS ● ● ●' },
  { value: 'dos', label: 'Retro DOS +---+' },
];

const AUDIO_TARGET_OPTIONS: readonly { value: AudioFxTarget; label: string }[] = [
  { value: 'pulse', label: 'Beat Pulse' },
  { value: 'wave', label: 'Wave Dance' },
  { value: 'glitch', label: 'Glitch Drop' },
  { value: 'all', label: 'Full Reactive' },
];

export const FxAudioPanel: React.FC = () => {
  const {
    settings,
    updateSettings,
    replayFx,
    audioState,
    meterBarRef,
    handleAudioFile,
    toggleAudioPlayPause,
    toggleAudioMic,
    setAudioFxTarget,
    setAudioSensitivity,
  } = useStudio();

  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const audioStatusText =
    audioState.mode === 'mic'
      ? 'Live mic'
      : audioState.mode === 'file'
      ? audioState.playing
        ? 'Playing'
        : 'Paused'
      : 'Idle';

  return (
    <div className="space-y-5">
      {/* Render & Pointer FX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Render &amp; pointer FX
          </span>
          <button
            type="button"
            onClick={replayFx}
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Replay FX</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <SelectField
            id="fxModeSelect"
            label="Render FX"
            value={settings.fxMode}
            options={RENDER_FX_OPTIONS}
            onChange={(fxMode) => updateSettings({ fxMode }, { resetFxTime: true })}
          />
          <SelectField
            id="mouseFxSelect"
            label="Pointer FX"
            value={settings.mouseFx}
            options={MOUSE_FX_OPTIONS}
            onChange={(mouseFx) => updateSettings({ mouseFx })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SliderField
            id="fxSpeedSlider"
            label="FX speed"
            valueLabel={`${settings.fxSpeed.toFixed(1)}×`}
            min={0.3}
            max={3.0}
            step={0.1}
            value={settings.fxSpeed}
            onChange={(fxSpeed) => updateSettings({ fxSpeed })}
          />
          <SliderField
            id="fxIntensitySlider"
            label="Intensity"
            valueLabel={`${Math.round(settings.fxIntensity * 100)}%`}
            min={10}
            max={100}
            step={5}
            value={Math.round(settings.fxIntensity * 100)}
            onChange={(val) => updateSettings({ fxIntensity: val / 100 })}
          />
        </div>
      </div>

      {/* Terminal Frame & Watermark */}
      <div className="pt-3.5 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Frame &amp; watermark
        </span>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            id="frameStyleSelect"
            value={settings.frameStyle}
            options={FRAME_OPTIONS}
            onChange={(frameStyle) => updateSettings({ frameStyle })}
          />
          <input
            id="watermarkInput"
            type="text"
            maxLength={32}
            value={settings.watermark}
            placeholder="Title / watermark"
            onChange={(e) => updateSettings({ watermark: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Audio Reactive Engine */}
      <div className="pt-3.5 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Audio reactive
          </span>
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            {audioStatusText}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
          >
            <Music className="w-3.5 h-3.5 shrink-0" />
            <span>Audio</span>
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAudioFile(file);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            disabled={audioState.mode !== 'file'}
            onClick={toggleAudioPlayPause}
            className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {audioState.playing && audioState.mode === 'file' ? (
              <>
                <Pause className="w-3.5 h-3.5 shrink-0" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => void toggleAudioMic()}
            className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
              audioState.mode === 'mic'
                ? 'border-rose-500 bg-rose-600 text-white'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500'
            }`}
          >
            {audioState.mode === 'mic' ? (
              <>
                <MicOff className="w-3.5 h-3.5 shrink-0" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span>Mic</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 items-end">
          <SelectField
            id="audioFxTargetSelect"
            label="Reaction"
            value={audioState.fxTarget}
            options={AUDIO_TARGET_OPTIONS}
            onChange={setAudioFxTarget}
          />
          <SliderField
            id="audioSensSlider"
            label="Gain"
            valueLabel={`${audioState.sensitivity.toFixed(1)}×`}
            min={0.4}
            max={2.5}
            step={0.1}
            value={audioState.sensitivity}
            onChange={setAudioSensitivity}
          />
        </div>

        {/* Audio Energy Level Meter */}
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            ref={meterBarRef}
            className="h-full w-0 bg-indigo-500 transition-[width] duration-75"
          />
        </div>
      </div>
    </div>
  );
};
