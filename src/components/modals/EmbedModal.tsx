import React, { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { copyTextToClipboard, generateEmbedCode } from '../../lib/exporters';
import type { EmbedFormat } from '../../types/studio';
import { Modal } from '../ui/Modal';
import { ToggleSwitch } from '../ui/ToggleSwitch';

export const EmbedModal: React.FC = () => {
  const {
    embedModalOpen,
    setEmbedModalOpen,
    settings,
    fontSize,
    getPlainAsciiText,
    showToast,
  } = useStudio();

  const [format, setFormat] = useState<EmbedFormat>('html');
  const [withAnim, setWithAnim] = useState(true);

  const code = useMemo(() => {
    if (!embedModalOpen) return '';
    return generateEmbedCode(
      getPlainAsciiText(),
      settings,
      fontSize,
      format,
      withAnim
    );
  }, [embedModalOpen, fontSize, format, getPlainAsciiText, settings, withAnim]);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(code);
    showToast(
      ok
        ? `Copied ${format.toUpperCase()} embed code`
        : 'Clipboard copy failed'
    );
  };

  return (
    <Modal
      open={embedModalOpen}
      onClose={() => setEmbedModalOpen(false)}
      title="Export embed widget"
      description="Ready-to-paste code for websites, portfolios, or React applications."
      maxWidthClass="max-w-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {(
            [
              { id: 'html', label: 'HTML Widget' },
              { id: 'react', label: 'React (.jsx)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFormat(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                format === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ToggleSwitch
          label="Include live animation FX"
          checked={withAnim}
          onChange={setWithAnim}
          compact
        />
      </div>

      <textarea
        readOnly
        rows={12}
        value={code}
        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-300 p-3 font-mono text-[11px] leading-relaxed focus:outline-none"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEmbedModalOpen(false)}
          className="px-3.5 py-2 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Embed Code</span>
        </button>
      </div>
    </Modal>
  );
};
