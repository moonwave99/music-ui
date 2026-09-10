"use client";

import { useState } from "react";
import { CHROMATIC_SCALE } from "@music-ui/core";
import { Scale } from "@music-ui/react";

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

export function ScaleKitchenSink() {
  const [root, setRoot] = useState("C");
  const [type, setType] = useState("major");
  const [highlightRoots, setHighlightRoots] = useState(true);
  const [showNoteNames, setShowNoteNames] = useState(true);
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
          Highlight roots{" "}
          <input
            name="highlightRoots"
            type="checkbox"
            checked={highlightRoots}
            onChange={() => setHighlightRoots((prev) => !prev)}
          />
        </label>
        <label>
          Show note names
          <input
            name="showNoteNames"
            type="checkbox"
            checked={showNoteNames}
            onChange={() => setShowNoteNames((prev) => !prev)}
          />
        </label>
      </div>
      <Scale
        root={root}
        type={type}
        highlightRoots={highlightRoots}
        showNoteNames={showNoteNames}
      />
    </div>
  );
}
