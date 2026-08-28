import { type ChangeEvent } from "react";
import { BPM_RANGE } from "@music-ui/core";
import { cssClasses } from "@music-ui/abc";

type TempoControlProps = {
  id: string;
  className?: string;
  inputLabel?: string;
  valueLabel?: string;
  resetButtonText?: string;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
};

export function TempoControl({
  id,
  className = cssClasses.tempoControl,
  inputLabel = "Tempo",
  valueLabel = "Current Tempo in BPM",
  resetButtonText = "Reset",
  value,
  onChange,
  onReset,
}: TempoControlProps) {
  const _id = `tempo-control-${id}`;

  function _onChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <div className={className}>
      <label htmlFor={_id}>{inputLabel}</label>
      <input
        type="range"
        value={value}
        id={_id}
        min={BPM_RANGE[0]}
        max={BPM_RANGE[1]}
        onChange={_onChange}
      />
      <output htmlFor={_id} aria-label={valueLabel}>
        {value}
      </output>
      <button onClick={onReset}>{resetButtonText}</button>
    </div>
  );
}
