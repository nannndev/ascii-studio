import React, { useState } from 'react';
import { Shuffle, Trash2 } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

export const PresetsPanel: React.FC = () => {
  const { presetNames, savePreset, loadPreset, deletePreset, triggerSurpriseMe } =
    useStudio();

  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = presetName.trim();
    savePreset(trimmed);
    if (trimmed) {
      setSelectedPreset(trimmed);
      setPresetName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Saved studio presets
        </span>
        <button
          type="button"
          onClick={triggerSurpriseMe}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
        >
          <Shuffle className="w-3 h-3" />
          <span>Randomize</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="flex gap-1.5">
        <input
          type="text"
          maxLength={24}
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="New preset name..."
          className="flex-1 min-w-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap"
        >
          Save
        </button>
      </form>

      {presetNames.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 py-3 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          No saved presets yet. Save your current engine, palette, and FX settings above.
        </p>
      ) : (
        <div className="space-y-1.5">
          {presetNames.map((name) => {
            const active = selectedPreset === name;
            return (
              <div
                key={name}
                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border transition-colors ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreset(name);
                    loadPreset(name);
                  }}
                  className="flex-1 text-left text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                >
                  {name}
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPreset(name);
                      loadPreset(name);
                    }}
                    className="px-2 py-1 rounded text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete preset ${name}`}
                    onClick={() => {
                      deletePreset(name);
                      if (selectedPreset === name) setSelectedPreset('');
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
