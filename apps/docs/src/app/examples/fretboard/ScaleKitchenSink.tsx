"use client";

import { useState } from "react";
import { CHROMATIC_SCALE } from "@music-ui/core";
import { Scale, ScaleProps } from "@music-ui/react";
import { BareFretboardPosition } from "@music-ui/fretboard";

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

type ScaleKitchenSinkProps = Pick<ScaleProps, "display">;

export function ScaleKitchenSink(props: ScaleKitchenSinkProps) {
  const [root, setRoot] = useState("C");
  const [type, setType] = useState("major");
  const [highlightRoots, setHighlightRoots] = useState(true);
  const [showArpeggio, setShowArpeggio] = useState(false);
  const [textPropertyIndex, setTextPropertyIndex] = useState(0);
  const [shouldHighlightArea, setShouldHighlightArea] = useState(true);
  const [highlightArea, setHighlightArea] = useState<
    [BareFretboardPosition, BareFretboardPosition]
  >([
    { string: 6, fret: 1 },
    { string: 1, fret: 3 },
  ]);

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
        <label>
          Show 7th arpeggio
          <input
            name="showArpeggio"
            type="checkbox"
            checked={showArpeggio}
            onChange={() => setShowArpeggio((prev) => !prev)}
          />
        </label>
      </div>
      <Scale
        {...props}
        root={root}
        type={type}
        highlightDegree={highlightRoots ? 1 : undefined}
        pickDegrees={showArpeggio ? [1, 3, 5, 7] : undefined}
        textProperty={DISPLAY_TYPES[textPropertyIndex]!.value}
        highlightAreas={shouldHighlightArea ? [highlightArea] : undefined}
      />
      <div className="controls">
        <label>
          Highlight Area
          <input
            name="shouldHighlightArea"
            type="checkbox"
            checked={shouldHighlightArea}
            onChange={() => setShouldHighlightArea((prev) => !prev)}
          />
        </label>
        <label>
          From string
          <input
            type="number"
            value={highlightArea[0].string}
            min={1}
            max={6}
            onChange={(event) =>
              setHighlightArea((prev) => [
                { ...prev[0], string: Number(event.target.value) },
                prev[1],
              ])
            }
          />
        </label>
        <label>
          To string
          <input
            type="number"
            min={1}
            max={6}
            value={highlightArea[1].string}
            onChange={(event) =>
              setHighlightArea((prev) => [
                prev[0],
                { ...prev[1], string: Number(event.target.value) },
              ])
            }
          />
        </label>
        <label>
          From fret
          <input
            type="number"
            min={1}
            max={15}
            value={highlightArea[0].fret}
            onChange={(event) =>
              setHighlightArea((prev) => [
                { ...prev[0], fret: Number(event.target.value) },
                prev[1],
              ])
            }
          />
        </label>
        <label>
          To fret
          <input
            type="number"
            min={1}
            max={15}
            value={highlightArea[1].fret}
            onChange={(event) =>
              setHighlightArea((prev) => [
                prev[0],
                { ...prev[1], fret: Number(event.target.value) },
              ])
            }
          />
        </label>
      </div>
    </div>
  );
}
