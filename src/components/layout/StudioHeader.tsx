import React from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Shuffle, Sun } from 'lucide-react';
import { STUDIO_ROUTES } from '../../constants/studio';
import { useStudio } from '../../context/StudioContext';

export const StudioHeader: React.FC = () => {
  const { theme, toggleTheme, triggerSurpriseMe } = useStudio();

  return (
    <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-6">
      {/* Zone 1: Single-line Brand Wordmark */}
      <NavLink
        to="/image"
        className="inline-flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
          @#
        </span>
        <span>ASCII Studio Pro</span>
      </NavLink>

      {/* Zone 2: Clean Single-Line Route Navigation Links */}
      <nav
        aria-label="Studio modes"
        className="flex items-center gap-1 sm:gap-5 overflow-x-auto no-scrollbar"
      >
        {STUDIO_ROUTES.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `relative py-4 px-1.5 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>{route.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Zone 3: Primary Action & Theme Switch */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={triggerSurpriseMe}
          title="Randomize Style (R)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap shrink-0"
        >
          <Shuffle className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Randomize</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors shrink-0"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      </div>
    </header>
  );
};
