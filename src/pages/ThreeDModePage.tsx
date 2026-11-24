import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useStudio } from '../context/StudioContext';
import type { Object3DType } from '../types/studio';

const OBJECTS_3D: { id: Object3DType; label: string }[] = [
  { id: 'donut', label: 'Donut' },
  { id: 'globe', label: 'Globe' },
  { id: 'knot', label: 'Knot' },
  { id: 'pyramid', label: 'Pyramid' },
];

export const ThreeDModePage: React.FC = () => {
  const { modeState, updateModeState, selectObject3D, reset3DCamera } =
    useStudio();

  return (
    <div className="space-y-3.5">
      <div className="space-y-1.5">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          3D geometry
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {OBJECTS_3D.map((obj) => {
            const active = modeState.obj3d === obj.id;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => selectObject3D(obj.id)}
                className={`py-1.5 px-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {obj.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <ToggleSwitch
          label="Auto-spin"
          checked={modeState.autoSpin3d}
          onChange={(checked) => updateModeState({ autoSpin3d: checked })}
          compact
        />
        <button
          type="button"
          onClick={reset3DCamera}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Angle</span>
        </button>
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Drag directly on the ASCII preview to orbit the 3D camera.
      </p>
    </div>
  );
};
