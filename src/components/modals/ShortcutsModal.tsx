import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Modal } from '../ui/Modal';

const SHORTCUTS = [
  { label: 'Fullscreen presentation', keys: 'F' },
  { label: 'Play / Pause animation, flipbook, or audio', keys: 'Space' },
  { label: 'Randomize style (Surprise Me)', keys: 'R' },
  { label: 'Toggle inspector panel (Zen mode)', keys: 'Z' },
  { label: 'Zoom in / out / fit to viewport', keys: '+ / - / 0' },
  { label: 'Paint undo / redo', keys: 'Ctrl+Z / Ctrl+Y' },
  { label: 'Show / hide shortcuts', keys: '?' },
];

export const ShortcutsModal: React.FC = () => {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useStudio();

  return (
    <Modal
      open={shortcutsModalOpen}
      onClose={() => setShortcutsModalOpen(false)}
      title="Keyboard shortcuts"
      maxWidthClass="max-w-md"
    >
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
        {SHORTCUTS.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 py-2.5"
          >
            <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
            <kbd className="px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px] font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
              {item.keys}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
