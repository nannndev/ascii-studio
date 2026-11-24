import React from 'react';
import { RotateCcw } from 'lucide-react';
import { CHARSETS, DEFAULT_SETTINGS } from '../../constants/studio';
import { useStudio } from '../../context/StudioContext';
import type { CharsetKey } from '../../types/studio';

interface CharacterPaletteOption {
  key: CharsetKey;
  label: string;
  sample: string;
}

const PALETTE_OPTIONS: readonly CharacterPaletteOption[] = [
  { key: 'standard', label: 'Standard', sample: '@%#*+=-:.' },
  { key: 'blocks', label: 'Blocks', sample: '█▓▒░' },
  { key: 'braille', label: 'Dots', sample: '⣿⣷⣶⣦⣤⣄' },
  { key: 'detailed', label: 'Detailed', sample: '$@B%8&WM' },
  { key: 'matrix', label: 'Matrix', sample: 'ｦｱｳｴｵｶｷ' },
  { key: 'minimal', label: 'Minimal', sample: '#+:.' },
  { key: 'binary', label: 'Binary', sample: '10' },
  { key: 'custom', label: 'Custom', sample: 'Custom' },
];

export const CharacterPaletteSwitcher: React.FC = () => {
  const { settings, updateSettings } = useStudio();

  const handleSelectPalette = (charsetKey: CharsetKey) => {
    updateSettings({
      charsetKey,
      // Switch back to classic ASCII engine if an overriding sub-pixel engine was active
      ...(settings.detailMode !== 'standard' ? { detailMode: 'standard' } : {}),
    });
  };

  const activeRamp =
    settings.charsetKey === 'custom'
      ? settings.customCharset
      : CHARSETS[settings.charsetKey];

  const rampCharCount = Array.from(activeRamp).length;

  return (
    <section
      aria-label="Character palette switcher"
      className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Character palette
        </h2>
        <span className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
          {rampCharCount} chars
        </span>
      </div>

      <div
        role="group"
        aria-label="Select ASCII character set"
        className="grid grid-cols-4 gap-1.5"
      >
        {PALETTE_OPTIONS.map((option) => {
          const active =
            settings.charsetKey === option.key &&
            settings.detailMode === 'standard';
          const preview =
            option.key === 'custom'
              ? settings.customCharset.trim() || 'Edit'
              : option.sample;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => handleSelectPalette(option.key)}
              title={`${option.label}: ${
                option.key === 'custom'
                  ? settings.customCharset
                  : CHARSETS[option.key]
              }`}
              className={`flex flex-col items-start px-2 py-1.5 rounded-lg border text-left transition-colors min-w-0 ${
                active
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-[11px] font-medium leading-tight whitespace-nowrap truncate w-full">
                {option.label}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 truncate w-full">
                {preview}
              </span>
            </button>
          );
        })}
      </div>

      {settings.charsetKey === 'custom' && (
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="customPaletteInput"
              className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              Custom ramp (dark to light)
            </label>
            <button
              type="button"
              onClick={() =>
                updateSettings({ customCharset: DEFAULT_SETTINGS.customCharset })
              }
              title="Reset custom ramp"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <input
            id="customPaletteInput"
            type="text"
            value={settings.customCharset}
            placeholder="@#S%?*+;:,. "
            onChange={(e) => updateSettings({ customCharset: e.target.value })}
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      )}
    </section>
  );
};
