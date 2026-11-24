import React, { useRef, useState } from 'react';
import {
  Box,
  Dna,
  Flower2,
  Gift,
  Layers,
  Mic,
  MicOff,
  Monitor,
  Music,
  Palette,
  RotateCcw,
  Share2,
  Shuffle,
  Smartphone,
  Sparkles,
  Square,
  Wand2,
} from 'lucide-react';
import { SliderField } from '../components/ui/SliderField';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import {
  FLOWER_ATMOSPHERES,
  FLOWER_STYLES,
  FLOWER_TEMPLATES,
  GIFT_CARD_OCCASIONS,
} from '../constants/flowers';
import { useStudio } from '../context/StudioContext';
import type {
  FlowerArrangement,
  FlowerQuality,
} from '../types/studio';

type CategoryFilter = 'all' | 'classic' | 'exotic' | 'scene';
type FlowerSubTab = 'design' | 'fx' | 'gift';

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All (12)' },
  { id: 'classic', label: 'Classic' },
  { id: 'exotic', label: 'Exotic' },
  { id: 'scene', label: 'Scenes' },
];

const ARRANGEMENT_OPTIONS: { id: FlowerArrangement; label: string }[] = [
  { id: 'single', label: 'Single' },
  { id: 'bouquet', label: 'Bouquet' },
  { id: 'vase', label: 'Vase' },
  { id: 'dome', label: 'Dome' },
];

const QUALITY_OPTIONS: { id: FlowerQuality; label: string; cols: string }[] = [
  { id: 'std', label: 'Std', cols: '90' },
  { id: 'hd', label: 'HD', cols: '150' },
  { id: '4k', label: '4K', cols: '240' },
];

export const FlowerModePage: React.FC = () => {
  const {
    modeState,
    settings,
    updateSettings,
    updateFlowerConfig,
    selectFlowerTemplate,
    selectFlowerArrangement,
    selectFlowerQuality,
    selectFlowerStyle,
    generateFlowerByName,
    copyFlowerShareLink,
    randomizeFlowerArt,
    applyFloralGlyphs,
    resetFlowerCamera,
    audioState,
    toggleAudioMic,
    handleAudioFile,
    downloadPoster,
  } = useStudio();

  const [subTab, setSubTab] = useState<FlowerSubTab>('design');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [nameInput, setNameInput] = useState(modeState.flower.dnaName);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const flower = modeState.flower;

  const visibleTemplates =
    category === 'all'
      ? FLOWER_TEMPLATES
      : FLOWER_TEMPLATES.filter((tpl) => tpl.category === category);

  const isFloralGlyphActive =
    settings.detailMode === 'standard' &&
    settings.charsetKey === 'custom' &&
    settings.customCharset.includes('✿');

  const activeArrangement: FlowerArrangement =
    flower.template === 'bouquet' && flower.arrangement === 'single'
      ? 'bouquet'
      : flower.arrangement;

  const stemToggleLabel =
    activeArrangement === 'bouquet'
      ? 'Wrap & bow'
      : activeArrangement === 'vase'
      ? 'Glass vase'
      : activeArrangement === 'dome'
      ? 'Glass dome'
      : 'Stem & leaves';

  const enableCustomColor = (patch: Partial<typeof flower>) => {
    updateFlowerConfig({ customColorsEnabled: true, ...patch });
    if (!settings.color || settings.colorPalette !== 'original') {
      updateSettings({
        color: true,
        colorPalette: 'original',
        ...(flower.quality === '4k' ? { detailMode: 'halfblock_hd' } : {}),
      });
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Row: 3D/2D + Quality (Std/HD/4K) + Mix */}
      <div className="flex items-center gap-1.5">
        <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => updateFlowerConfig({ dimension: '3d' })}
            className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              flower.dimension === '3d'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D</span>
          </button>
          <button
            type="button"
            onClick={() => updateFlowerConfig({ dimension: '2d' })}
            className={`inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
              flower.dimension === '2d'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2D</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-0.5 flex-1 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900">
          {QUALITY_OPTIONS.map((q) => {
            const active = flower.quality === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => selectFlowerQuality(q.id)}
                title={`${q.label} ASCII (${q.cols} columns)`}
                className={`py-1.5 px-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? q.id === '4k'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={randomizeFlowerArt}
          title="Randomize flower, vessel, atmosphere & style"
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
        >
          <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Mix</span>
        </button>
      </div>

      {/* Arrangement Bar: Single | Bouquet | Vase | Dome */}
      <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900">
        {ARRANGEMENT_OPTIONS.map((opt) => {
          const active = activeArrangement === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => selectFlowerArrangement(opt.id)}
              className={`py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs for Clean Workspace Organization */}
      <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setSubTab('design')}
          className={`inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
            subTab === 'design'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Flower2 className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('fx')}
          className={`inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
            subTab === 'fx'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>FX &amp; DNA</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('gift')}
          className={`inline-flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
            subTab === 'gift'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Gift &amp; 4K</span>
        </button>
      </div>

      {/* ============================================================
          TAB 1: DESIGN (TEMPLATES, STYLES, CUSTOM COLORS, SCULPT)
         ============================================================ */}
      {subTab === 'design' && (
        <div className="space-y-3.5">
          {/* Botanical Template Library */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Templates
              </span>
              <div className="flex items-center gap-1">
                {CATEGORY_TABS.map((tab) => {
                  const active = category === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCategory(tab.id)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        active
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {visibleTemplates.map((tpl) => {
                const active = flower.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => selectFlowerTemplate(tpl.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left border transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="text-xs leading-none shrink-0 opacity-85"
                    >
                      {tpl.glyph}
                    </span>
                    <span className="text-[11px] font-medium truncate">
                      {tpl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color & Mood Presets */}
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Color &amp; mood
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {FLOWER_STYLES.map((st) => {
                const active =
                  !flower.customColorsEnabled && flower.style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => selectFlowerStyle(st.id)}
                    className={`flex flex-col items-start gap-1 px-2 py-1.5 rounded-lg border text-left transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-full h-1.5 rounded-sm block"
                      style={{ background: st.swatch }}
                    />
                    <span className="text-[10px] font-medium leading-tight truncate w-full">
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Petal / Ribbon / Wrap Color Pickers */}
          <div className="space-y-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Custom colors</span>
              </span>
              <ToggleSwitch
                label=""
                checked={flower.customColorsEnabled}
                onChange={(checked) => {
                  if (checked) {
                    enableCustomColor({});
                  } else {
                    updateFlowerConfig({ customColorsEnabled: false });
                  }
                }}
                compact
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer">
                <input
                  type="color"
                  value={flower.customPetalHex}
                  onChange={(e) =>
                    enableCustomColor({ customPetalHex: e.target.value })
                  }
                  className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  Petal
                </span>
              </label>

              <label className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer">
                <input
                  type="color"
                  value={flower.customRibbonHex}
                  onChange={(e) =>
                    enableCustomColor({ customRibbonHex: e.target.value })
                  }
                  className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  Ribbon
                </span>
              </label>

              <label className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer">
                <input
                  type="color"
                  value={flower.customWrapHex}
                  onChange={(e) =>
                    enableCustomColor({ customWrapHex: e.target.value })
                  }
                  className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  Wrap
                </span>
              </label>
            </div>
          </div>

          {/* Botanical Sculpt Sliders */}
          <div className="grid grid-cols-2 gap-3">
            <SliderField
              label="Bloom"
              value={flower.bloom}
              valueLabel={`${Math.round(flower.bloom * 100)}%`}
              min={0.15}
              max={1}
              step={0.05}
              onChange={(bloom) =>
                updateFlowerConfig({ bloom, autoBloom: false })
              }
            />
            <SliderField
              label="Petals"
              value={flower.petalCount}
              valueLabel={String(flower.petalCount)}
              min={5}
              max={20}
              step={1}
              onChange={(petalCount) => updateFlowerConfig({ petalCount })}
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <ToggleSwitch
              label={stemToggleLabel}
              checked={flower.showStem}
              onChange={(showStem) => updateFlowerConfig({ showStem })}
              compact
            />
            <ToggleSwitch
              label="Wind sway"
              checked={flower.windSway}
              onChange={(windSway) => updateFlowerConfig({ windSway })}
              compact
            />
            <ToggleSwitch
              label="Auto-bloom"
              checked={flower.autoBloom}
              onChange={(autoBloom) => updateFlowerConfig({ autoBloom })}
              compact
            />
            {flower.dimension === '3d' && (
              <ToggleSwitch
                label="Auto-spin 3D"
                checked={flower.autoSpin}
                onChange={(autoSpin) => updateFlowerConfig({ autoSpin })}
                compact
              />
            )}
          </div>

          {/* Quick Glyphs & Camera Reset */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={applyFloralGlyphs}
              title="Use floral ASCII characters (✿❀❁*+~·)"
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap ${
                isFloralGlyphActive
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>✿ Floral Glyphs</span>
            </button>

            {flower.dimension === '3d' && (
              <button
                type="button"
                onClick={resetFlowerCamera}
                title="Reset 3D camera angle"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset 3D</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: FX & DNA (ATMOSPHERE, NAME-TO-FLOWER, AUDIO BLOOM)
         ============================================================ */}
      {subTab === 'fx' && (
        <div className="space-y-4">
          {/* Weather & Particle Atmosphere */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Atmosphere &amp; weather
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {FLOWER_ATMOSPHERES.map((atmo) => {
                const active = flower.atmosphere === atmo.id;
                return (
                  <button
                    key={atmo.id}
                    type="button"
                    onClick={() => updateFlowerConfig({ atmosphere: atmo.id })}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left border transition-colors ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs leading-none shrink-0">
                      {atmo.glyph}
                    </span>
                    <span className="text-[11px] font-medium truncate">
                      {atmo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name-to-Flower DNA Generator */}
          <div className="space-y-2 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <Dna className="w-3.5 h-3.5 text-indigo-500" />
              <span>Name-to-Flower DNA</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Type any name to deterministically grow a unique 3D flower, vessel &amp; palette.
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') generateFlowerByName(nameInput);
                }}
                placeholder="e.g. Alya, Budi, Sakura..."
                maxLength={32}
                className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => generateFlowerByName(nameInput)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors whitespace-nowrap"
              >
                Grow
              </button>
            </div>
          </div>

          {/* Audio-Reactive Blooming */}
          <div className="space-y-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Music className="w-3.5 h-3.5 text-indigo-500" />
                <span>Audio-Reactive Bloom</span>
              </span>
              <ToggleSwitch
                label=""
                checked={flower.audioBloom}
                onChange={(audioBloom) => updateFlowerConfig({ audioBloom })}
                compact
              />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Petals bloom and glow in sync with live microphone or music beats.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  updateFlowerConfig({ audioBloom: true });
                  void toggleAudioMic();
                }}
                className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                  audioState.mode === 'mic' && audioState.active
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500'
                }`}
              >
                {audioState.mode === 'mic' && audioState.active ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Live Mic</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  updateFlowerConfig({ audioBloom: true });
                  audioInputRef.current?.click();
                }}
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Load Audio</span>
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioFile(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: GIFT CARD, SHARE LINK & 4K WALLPAPER POSTERS
         ============================================================ */}
      {subTab === 'gift' && (
        <div className="space-y-4">
          {/* ASCII Gift Card Builder */}
          <div className="space-y-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Gift className="w-3.5 h-3.5 text-indigo-500" />
                <span>ASCII Gift Card Frame</span>
              </span>
              <ToggleSwitch
                label=""
                checked={flower.giftCardEnabled}
                onChange={(giftCardEnabled) =>
                  updateFlowerConfig({ giftCardEnabled })
                }
                compact
              />
            </div>

            {/* Quick Occasion Presets */}
            <div className="flex flex-wrap gap-1">
              {GIFT_CARD_OCCASIONS.map((occ) => (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() =>
                    updateFlowerConfig({
                      giftCardEnabled: true,
                      giftTitle: occ.title,
                      giftMessage: occ.message,
                    })
                  }
                  className="px-2 py-1 rounded-md text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 transition-colors"
                >
                  {occ.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={flower.giftTitle}
                onChange={(e) =>
                  updateFlowerConfig({
                    giftCardEnabled: true,
                    giftTitle: e.target.value,
                  })
                }
                placeholder="Card title (e.g. HAPPY BIRTHDAY)"
                maxLength={40}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={flower.giftMessage}
                onChange={(e) =>
                  updateFlowerConfig({
                    giftCardEnabled: true,
                    giftMessage: e.target.value,
                  })
                }
                placeholder="Short greeting message..."
                maxLength={80}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={flower.giftSender}
                onChange={(e) =>
                  updateFlowerConfig({
                    giftCardEnabled: true,
                    giftSender: e.target.value,
                  })
                }
                placeholder="From (sender name)"
                maxLength={32}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => void copyFlowerShareLink()}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Shareable 3D Flower Link</span>
            </button>
          </div>

          {/* 4K Wallpaper & Poster PNG Exporter */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Export 4K Wallpaper / Poster (.PNG)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => downloadPoster('story_9_16')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span className="text-[11px] font-semibold">Story</span>
                <span className="text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  9:16
                </span>
              </button>
              <button
                type="button"
                onClick={() => downloadPoster('square_1_1')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors"
              >
                <Square className="w-4 h-4 text-indigo-500" />
                <span className="text-[11px] font-semibold">Square</span>
                <span className="text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  1:1
                </span>
              </button>
              <button
                type="button"
                onClick={() => downloadPoster('desktop_16_9')}
                className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-indigo-500 transition-colors"
              >
                <Monitor className="w-4 h-4 text-indigo-500" />
                <span className="text-[11px] font-semibold">Desktop</span>
                <span className="text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                  16:9
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
