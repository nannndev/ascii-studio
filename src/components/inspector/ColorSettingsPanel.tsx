import React from 'react';
import { CANVAS_THEMES, MONO_TINTS } from '../../constants/studio';
import { useStudio } from '../../context/StudioContext';
import type { ColorPalette } from '../../types/studio';
import { SelectField } from '../ui/SelectField';
import { SliderField } from '../ui/SliderField';
import { ToggleSwitch } from '../ui/ToggleSwitch';

const PALETTE_OPTIONS: readonly { value: ColorPalette; label: string }[] = [
  { value: 'mono', label: 'Mono Ink' },
  { value: 'original', label: 'Original Color' },
  { value: 'gameboy', label: 'GameBoy 4-Color' },
  { value: 'vaporwave', label: 'Vaporwave Duotone' },
  { value: 'thermal', label: 'Thermal Heatmap' },
  { value: 'cyberpunk', label: 'Cyberpunk Neon' },
  { value: 'rainbow', label: 'Rainbow Spectrum' },
];

export const ColorSettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useStudio();

  const monoActive = settings.colorPalette === 'mono';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ToggleSwitch
          label="Full color"
          checked={settings.color}
          onChange={(checked) => {
            const nextPalette: ColorPalette = checked
              ? settings.colorPalette === 'mono'
                ? 'original'
                : settings.colorPalette
              : 'mono';
            updateSettings({ color: checked, colorPalette: nextPalette });
          }}
          compact
        />
        <SelectField
          id="colorPaletteSelect"
          value={settings.colorPalette}
          options={PALETTE_OPTIONS}
          onChange={(colorPalette) =>
            updateSettings({
              colorPalette,
              color: colorPalette !== 'mono',
            })
          }
          className="w-44"
        />
      </div>

      {/* Mono Ink Swatches */}
      <div
        className={`flex items-center justify-between gap-2 transition-opacity ${
          monoActive ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Mono ink
        </span>
        <div className="flex items-center gap-2">
          {MONO_TINTS.map((tint) => {
            const active = settings.tintHex === tint.hex;
            return (
              <button
                key={tint.hex}
                type="button"
                title={tint.label}
                aria-label={`Set mono ink to ${tint.label}`}
                onClick={() => updateSettings({ tintHex: tint.hex })}
                style={{ backgroundColor: tint.hex }}
                className={`w-5 h-5 rounded-full border border-zinc-400/50 transition-transform hover:scale-110 ${
                  active
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950'
                    : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Canvas Themes */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Canvas surface
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {CANVAS_THEMES.map((theme) => {
            const active = settings.canvasBg === theme.bg;
            return (
              <button
                key={theme.bg}
                type="button"
                onClick={() => updateSettings({ canvasBg: theme.bg })}
                className={`py-1.5 px-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  theme.previewClass
                } ${
                  active
                    ? 'border-indigo-500 ring-1 ring-indigo-500'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400'
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Glow & Typography */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <SliderField
          id="neonGlowSlider"
          label="Neon glow / bloom"
          valueLabel={`${settings.neonGlow}px`}
          min={0}
          max={18}
          step={1}
          value={settings.neonGlow}
          onChange={(neonGlow) => updateSettings({ neonGlow })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SliderField
            id="lineHeightSlider"
            label="Line height"
            valueLabel={settings.lineHeight.toFixed(2)}
            min={0.8}
            max={1.5}
            step={0.05}
            value={settings.lineHeight}
            onChange={(lineHeight) => updateSettings({ lineHeight })}
          />
          <SliderField
            id="letterSpacingSlider"
            label="Letter space"
            valueLabel={`${settings.letterSpacing}px`}
            min={-1}
            max={4}
            step={0.5}
            value={settings.letterSpacing}
            onChange={(letterSpacing) => updateSettings({ letterSpacing })}
          />
        </div>
      </div>
    </div>
  );
};
