import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { STUDIO_ROUTES } from '../../constants/studio';
import { useStudio } from '../../context/StudioContext';
import type { InspectorTab } from '../../types/studio';
import { CharacterPaletteSwitcher } from '../inspector/CharacterPaletteSwitcher';
import { ColorSettingsPanel } from '../inspector/ColorSettingsPanel';
import { EngineSettingsPanel } from '../inspector/EngineSettingsPanel';
import { FxAudioPanel } from '../inspector/FxAudioPanel';
import { PresetsPanel } from '../inspector/PresetsPanel';
import { EmbedModal } from '../modals/EmbedModal';
import { ShortcutsModal } from '../modals/ShortcutsModal';
import { Toast } from '../ui/Toast';
import { PreviewStage } from '../workspace/PreviewStage';
import { WorkspaceToolbar } from '../workspace/WorkspaceToolbar';
import { StudioHeader } from './StudioHeader';

const INSPECTOR_TABS: { id: InspectorTab; label: string }[] = [
  { id: 'engine', label: 'Engine' },
  { id: 'color', label: 'Color' },
  { id: 'fx', label: 'FX & Audio' },
  { id: 'presets', label: 'Presets' },
];

export const StudioLayout: React.FC = () => {
  const { mode, sidebarOpen, toastMessage, toastVisible } = useStudio();
  const [activeTab, setActiveTab] = useState<InspectorTab>('engine');

  const routeMeta =
    STUDIO_ROUTES.find((r) => r.mode === mode) ?? STUDIO_ROUTES[0];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <StudioHeader />

      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-visible md:overflow-hidden">
        {/* Left Inspector Sidebar */}
        <aside
          className={`order-2 md:order-1 w-full md:w-[340px] lg:w-[370px] shrink-0 md:h-full md:overflow-y-auto border-t md:border-t-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col ${
            sidebarOpen ? '' : 'md:hidden'
          }`}
        >
          {/* Active Mode Section (Routed via React Router Outlet) */}
          <section className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              {routeMeta.title}
            </h2>
            <Outlet />
          </section>

          {/* Character Palette Switcher */}
          <CharacterPaletteSwitcher />

          {/* Inspector Settings Tabs (Zero Scroll Fatigue) */}
          <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-3 pt-2.5 pb-2">
            <div
              role="tablist"
              aria-label="Studio settings sections"
              className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900"
            >
              {INSPECTOR_TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="p-4 flex-1">
            {activeTab === 'engine' && <EngineSettingsPanel />}
            {activeTab === 'color' && <ColorSettingsPanel />}
            {activeTab === 'fx' && <FxAudioPanel />}
            {activeTab === 'presets' && <PresetsPanel />}
          </section>
        </aside>

        {/* Right Workspace Stage */}
        <section className="order-1 md:order-2 flex-1 flex flex-col min-w-0 sticky top-14 z-20 md:static h-[48vh] sm:h-[52vh] md:h-full bg-zinc-100 dark:bg-zinc-950 border-b md:border-b-0 border-zinc-200 dark:border-zinc-800">
          <WorkspaceToolbar />
          <PreviewStage />
        </section>
      </main>

      <EmbedModal />
      <ShortcutsModal />
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
};
