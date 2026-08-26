import { type ChangeEvent } from "react";
import { BPM_RANGE } from "@music-ui/core";
import { cssClasses } from "@music-ui/abc";

type TempoControlProps = {
  id: string;
  className?: string;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
};

export function TempoControl({
  id,
  className = cssClasses.tempoControl,
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
      <label htmlFor={_id}>Tempo</label>
      <input
        type="range"
        value={value}
        id={_id}
        min={BPM_RANGE[0]}
        max={BPM_RANGE[1]}
        onChange={_onChange}
      />
      <output htmlFor={_id}>{value}</output>
      <button onClick={onReset}>Reset</button>
    </div>
  );
}
