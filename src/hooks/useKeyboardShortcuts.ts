import { useEffect } from 'react';
import type { StudioMode } from '../types/studio';

interface ShortcutHandlers {
  mode: StudioMode;
  audioMode: 'none' | 'file' | 'mic';
  onEscape: () => void;
  onFullscreen: () => void;
  onSurpriseMe: () => void;
  onToggleSidebar: () => void;
  onToggleShortcuts: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitScreen: () => void;
  onPaintUndo: () => void;
  onPaintRedo: () => void;
  onSpaceAction: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        handlers.onEscape();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (handlers.mode === 'paint') {
          e.preventDefault();
          handlers.onPaintUndo();
        }
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' ||
          (e.key.toLowerCase() === 'z' && e.shiftKey))
      ) {
        if (handlers.mode === 'paint') {
          e.preventDefault();
          handlers.onPaintRedo();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        handlers.onFullscreen();
      } else if (key === 'r') {
        e.preventDefault();
        handlers.onSurpriseMe();
      } else if (key === 'z') {
        e.preventDefault();
        handlers.onToggleSidebar();
      } else if (key === '?' || e.key === '/') {
        e.preventDefault();
        handlers.onToggleShortcuts();
      } else if (key === '=' || key === '+') {
        e.preventDefault();
        handlers.onZoomIn();
      } else if (key === '-') {
        e.preventDefault();
        handlers.onZoomOut();
      } else if (key === '0') {
        e.preventDefault();
        handlers.onFitScreen();
      } else if (e.code === 'Space') {
        e.preventDefault();
        handlers.onSpaceAction();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
