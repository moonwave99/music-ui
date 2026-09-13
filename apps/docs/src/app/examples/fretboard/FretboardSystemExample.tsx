"use client";

import { useState } from "react";
import { CHROMATIC_SCALE } from "@music-ui/core";
import { Scale } from "@music-ui/react";
import { Systems } from "@music-ui/fretboard";

type FretboardSystemExampleProps = {
  system: Systems;
};

const boxesMap: Record<Systems, string[] | number[]> = {
  CAGED: ["C", "A", "G", "E", "D"],
  TNPS: [1, 2, 3, 4, 5, 6, 7],
  pentatonic: [1, 2, 3, 4, 5],
} as const;

export function FretboardSystemExample({
  system = "CAGED",
}: FretboardSystemExampleProps) {
  const [root, setRoot] = useState("C");
  const [box, setBox] = useState(boxesMap[system].at(0)!);

  return (
    <div className="scale-kitchen-sink">
      <div className="controls">
        Box system: {system}
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
          Box
          <select
            name="box"
            value={box}
            onChange={(event) => setBox(event.target.value)}
          >
            {boxesMap[system].map((box) => (
              <option key={box}>{box}</option>
            ))}
          </select>
        </label>
      </div>
      <Scale
        root={root}
        type="major"
        highlightRoots
        showNoteNames
        displayBoxOnly
        box={{ system, box }}
      />
    </div>
  );
}
