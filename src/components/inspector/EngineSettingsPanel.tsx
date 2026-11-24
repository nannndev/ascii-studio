import React from 'react';
import { RotateCcw } from 'lucide-react';
import { WIDTH_PRESETS } from '../../constants/studio';
import { useStudio } from '../../context/StudioContext';
import type { CutoutMode, DetailMode } from '../../types/studio';
import { SelectField } from '../ui/SelectField';
import { SliderField } from '../ui/SliderField';
import { ToggleSwitch } from '../ui/ToggleSwitch';

const DETAIL_ENGINE_OPTIONS: readonly { value: DetailMode; label: string }[] = [
  { value: 'standard', label: 'Classic ASCII (Standard)' },
  { value: 'photo_hd', label: 'HD Photo ASCII (70-Char + Floyd-Steinberg)' },
  { value: 'braille_hd', label: 'Ultra Braille 2×4 Sub-Pixel (8× Sharp)' },
  { value: 'halfblock_hd', label: 'True-Color Photo HD (Half-Block ▀)' },
];

const CUTOUT_OPTIONS: readonly { value: CutoutMode; label: string }[] = [
  { value: 'none', label: 'Off' },
  { value: 'dark', label: 'Remove Dark BG' },
  { value: 'light', label: 'Remove Light BG' },
];

export const EngineSettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetAllSettings } = useStudio();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Conversion engine
        </span>
        <button
          type="button"
          onClick={resetAllSettings}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset all</span>
        </button>
      </div>

      <SelectField
        id="detailModeSelect"
        label="Render detail engine"
        value={settings.detailMode}
        options={DETAIL_ENGINE_OPTIONS}
        onChange={(detailMode) => updateSettings({ detailMode })}
      />

      {/* Resolution + Presets */}
      <div className="space-y-2">
        <SliderField
          id="widthSlider"
          label="Resolution (columns)"
          valueLabel={`${settings.width}`}
          min={24}
          max={260}
          step={2}
          value={settings.width}
          onChange={(width) => updateSettings({ width }, { fitAfter: true })}
        />
        <div className="grid grid-cols-5 gap-1">
          {WIDTH_PRESETS.map((preset) => {
            const active = settings.width === preset.width;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  updateSettings({ width: preset.width }, { fitAfter: true })
                }
                className={`py-1 px-1 rounded-md text-[11px] leading-tight font-medium border transition-colors ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>{preset.label}</div>
                <div className="font-mono tabular-nums text-[10px]">
                  {preset.width}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders: Aspect, Contrast, Brightness, Sharpen */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <SliderField
          id="aspectSlider"
          label="Aspect"
          valueLabel={settings.aspect.toFixed(2)}
          min={0.35}
          max={0.8}
          step={0.02}
          value={settings.aspect}
          onChange={(aspect) => updateSettings({ aspect })}
        />
        <SliderField
          id="contrastSlider"
          label="Contrast"
          valueLabel={settings.contrast.toFixed(2)}
          min={0.5}
          max={2.5}
          step={0.05}
          value={settings.contrast}
          onChange={(contrast) => updateSettings({ contrast })}
        />
        <SliderField
          id="brightnessSlider"
          label="Brightness"
          valueLabel={`${settings.brightness}`}
          min={-80}
          max={80}
          step={2}
          value={settings.brightness}
          onChange={(brightness) => updateSettings({ brightness })}
        />
        <SliderField
          id="sharpenSlider"
          label="Sharpen"
          valueLabel={`${Math.round(settings.sharpen * 100)}%`}
          min={0}
          max={100}
          step={5}
          value={Math.round(settings.sharpen * 100)}
          onChange={(val) => updateSettings({ sharpen: val / 100 })}
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <ToggleSwitch
          label="Invert tone"
          checked={settings.invert}
          onChange={(invert) => updateSettings({ invert })}
        />
        <ToggleSwitch
          label="Bayer dither"
          checked={settings.dither}
          onChange={(dither) => updateSettings({ dither })}
        />
        <ToggleSwitch
          label="Edge sketch"
          checked={settings.edgeDetect}
          onChange={(edgeDetect) => updateSettings({ edgeDetect })}
        />
        <ToggleSwitch
          label="CRT lines"
          checked={settings.crt}
          onChange={(crt) => updateSettings({ crt })}
        />
      </div>

      {/* Background Cutout */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="cutoutModeSelect"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Background cutout
          </label>
          <SelectField
            id="cutoutModeSelect"
            value={settings.cutoutMode}
            options={CUTOUT_OPTIONS}
            onChange={(cutoutMode) => updateSettings({ cutoutMode })}
            className="w-40"
          />
        </div>
        {settings.cutoutMode !== 'none' && (
          <SliderField
            id="cutoutThresholdSlider"
            label="Cutout threshold"
            valueLabel={`${settings.cutoutThreshold}`}
            min={5}
            max={180}
            step={1}
            value={settings.cutoutThreshold}
            onChange={(cutoutThreshold) => updateSettings({ cutoutThreshold })}
          />
        )}
      </div>
    </div>
  );
};
