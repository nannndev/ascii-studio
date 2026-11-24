import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-lg border border-zinc-800 dark:border-zinc-200/20 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium shadow-lg pointer-events-none transition-all duration-200 ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {message}
    </div>
  );
};
