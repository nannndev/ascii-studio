import React from 'react';

interface SliderFieldProps {
  id?: string;
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  id,
  label,
  valueLabel,
  min,
  max,
  step = 1,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <label
          htmlFor={id}
          className="font-medium text-zinc-600 dark:text-zinc-400 truncate"
        >
          {label}
        </label>
        <span className="font-mono tabular-nums text-[11px] font-medium text-zinc-900 dark:text-zinc-200 shrink-0">
          {valueLabel}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="studio-slider w-full cursor-pointer"
      />
    </div>
  );
};
