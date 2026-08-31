import { type ChangeEvent } from "react";
import { BPM_RANGE } from "@music-ui/core";
import { cssClasses } from "@music-ui/abc";

/**
 * The props expected by the `TempoControl` component.
 * @property id The score id.
 * @property className The component class name.
 * @property inputLabel The input element label.
 * @property valueLabel The output element label.
 * @property resetButtonText The reset button text.
 * @property value The current tempo value.
 * @property onChange Function called when the tempo value changes.
 * @property onReset Function called when the tempo is reset.
 */
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

/**
 * A component that handles tempo change for the parent {@link ABCScore}.
 */
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
