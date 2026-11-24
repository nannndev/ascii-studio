import React from 'react';
import { SelectField } from '../components/ui/SelectField';
import { useStudio } from '../context/StudioContext';
import type { BannerStyle } from '../types/studio';

const FONT_OPTIONS = [
  { value: '900 110px Impact, sans-serif', label: 'Impact Bold' },
  { value: '900 100px "Plus Jakarta Sans", sans-serif', label: 'Modern Sans' },
  { value: '700 95px Georgia, serif', label: 'Classic Serif' },
  { value: '700 90px "JetBrains Mono", monospace', label: 'Tech Mono' },
] as const;

const FILL_OPTIONS: readonly { value: BannerStyle; label: string }[] = [
  { value: 'solid', label: 'Solid Fill' },
  { value: 'outline', label: 'Outline' },
  { value: 'shadow', label: 'Drop Shadow' },
];

export const TextModePage: React.FC = () => {
  const { modeState, updateModeState } = useStudio();

  return (
    <div className="space-y-3.5">
      <div>
        <label
          htmlFor="bannerTextInput"
          className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5"
        >
          Banner text
        </label>
        <input
          id="bannerTextInput"
          type="text"
          value={modeState.bannerText}
          maxLength={24}
          placeholder="Type your banner..."
          onChange={(e) => updateModeState({ bannerText: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <SelectField
          id="bannerFontSelect"
          label="Typography"
          value={modeState.bannerFont}
          options={FONT_OPTIONS}
          onChange={(val) => updateModeState({ bannerFont: val })}
        />
        <SelectField
          id="bannerStyleSelect"
          label="Fill style"
          value={modeState.bannerStyle}
          options={FILL_OPTIONS}
          onChange={(val) => updateModeState({ bannerStyle: val })}
        />
      </div>
    </div>
  );
};
