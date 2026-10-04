import { BPM_RANGE } from "@music-ui/core";
import { cssClasses } from "@music-ui/abc";
import { type ReactNode } from "react";

/**
 * The props expected by the `TempoControl` component.
 * @property id The score id.
 * @property className The component class name.
 * @property inputLabel The input element label.
 * @property valueLabel The output element label.
 * @property resetButtonContent The reset button content.
 * @property value The current tempo value.
 * @property onChange Function called when the tempo value changes.
 * @property onReset Function called when the tempo is reset.
 */
export type TempoControlProps = {
  id: string;
  className?: string;
  inputLabel?: string;
  valueLabel?: string;
  resetButtonContent?: ReactNode;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
};

/**
 * A component that handles tempo change for the parent {@link ABCScore}.
 */
export function TempoControl({
  id,
  className = cssClasses.tempoControl,
  inputLabel = "Tempo",
  valueLabel = "Current Tempo in BPM",
  resetButtonContent = "Reset",
  value,
  onChange,
  onReset,
}: TempoControlProps) {
  const _id = `tempo-control-${id}`;
  return (
    <div className={className}>
      <label htmlFor={_id}>{inputLabel}</label>
      <input
        type="range"
        value={value}
        id={_id}
        min={BPM_RANGE[0]}
        max={BPM_RANGE[1]}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output htmlFor={_id} aria-label={valueLabel}>
        {value}
      </output>
      <button onClick={onReset}>{resetButtonContent}</button>
    </div>
  );
}
