import React from 'react';
import { Camera, Monitor, Snowflake } from 'lucide-react';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useStudio } from '../context/StudioContext';

export const LiveModePage: React.FC = () => {
  const { captureState, toggleCamera, toggleScreen, toggleFreeze, setMirror } =
    useStudio();

  const isCameraOnly = captureState.camActive && !captureState.screenActive;

  return (
    <div className="space-y-3.5">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Stream your webcam or capture a browser tab, monitor, or window into
        live ASCII.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void toggleCamera()}
          className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-colors whitespace-nowrap ${
            isCameraOnly
              ? 'bg-rose-600 hover:bg-rose-500'
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isCameraOnly ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        <button
          type="button"
          onClick={() => void toggleScreen()}
          className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
            captureState.screenActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-indigo-500'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>{captureState.screenActive ? 'Stop Screen' : 'Share Screen'}</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <ToggleSwitch
          label="Mirror horizontally"
          checked={captureState.mirror}
          onChange={setMirror}
          compact
        />
        <button
          type="button"
          disabled={!captureState.camActive}
          onClick={toggleFreeze}
          className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
            captureState.frozen
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500'
          }`}
        >
          <Snowflake className="w-3.5 h-3.5" />
          <span>{captureState.frozen ? 'Unfreeze' : 'Freeze'}</span>
        </button>
      </div>
    </div>
  );
};
