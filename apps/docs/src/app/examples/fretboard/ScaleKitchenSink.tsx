"use client";

import { useState } from "react";
import { CHROMATIC_SCALE } from "@music-ui/core";
import { Scale, ScaleProps } from "@music-ui/react";

const SCALE_TYPES = [
  "major",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "minor",
  "locrian",
  "harmonic minor",
  "melodic minor",
  "minor pentatonic",
  "major pentatonic",
  "minor blues",
  "major blues",
];

const DISPLAY_TYPES: { label: string; value: ScaleProps["textProperty"] }[] = [
  {
    label: "Note name",
    value: "note",
  },
  {
    label: "Scale degree",
    value: "degree",
  },
  {
    label: "Interval from root",
    value: "interval",
  },
  {
    label: "Nothing",
    value: undefined,
  },
] as const;

export function ScaleKitchenSink() {
  const [root, setRoot] = useState("C");
  const [type, setType] = useState("major");
  const [highlightRoots, setHighlightRoots] = useState(true);
  const [textPropertyIndex, setTextPropertyIndex] = useState(0);

  return (
    <div className="scale-kitchen-sink">
      <div className="controls">
        <label>
          Root
          <select
            name="root"
            value={root}
            onChange={(event) => setRoot(event.target.value)}
          >
            {CHROMATIC_SCALE.map(({ note }) => (
              <option key={note}>{note}</option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {SCALE_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Show
          <select
            name="type"
            value={textPropertyIndex}
            onChange={(event) =>
              setTextPropertyIndex(Number(event.target.value))
            }
          >
            {DISPLAY_TYPES.map(({ label }, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Highlight roots{" "}
          <input
            name="highlightRoots"
            type="checkbox"
            checked={highlightRoots}
            onChange={() => setHighlightRoots((prev) => !prev)}
          />
        </label>
      </div>
      <Scale
        root={root}
        type={type}
        highlightDegree={highlightRoots ? 1 : undefined}
        textProperty={DISPLAY_TYPES[textPropertyIndex]!.value}
      />
    </div>
  );
}
