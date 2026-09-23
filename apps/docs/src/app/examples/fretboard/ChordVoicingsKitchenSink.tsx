"use client";

import { useState } from "react";
import { CHROMATIC_SCALE } from "@music-ui/core";
import { Fretboard, ScaleProps } from "@music-ui/react";
import {
  highlightDegreeFill,
  getVoicingTypeStrings,
  voicingTypes,
  voicingInversions,
  voicingQualities,
  type GetChordVoicingParams,
} from "@music-ui/fretboard";

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
    label: "Nothing",
    value: undefined,
  },
] as const;

export function ChordVoicingsKitchenSink() {
  const [type, setType] = useState<GetChordVoicingParams["type"]>("drop2");
  const [string, setString] = useState<GetChordVoicingParams["string"]>(
    getVoicingTypeStrings(type).at(0)!,
  );
  const [root, setRoot] = useState("C");
  const [quality, setQuality] =
    useState<GetChordVoicingParams["quality"]>("maj7");
  const [inversion, setInversion] =
    useState<GetChordVoicingParams["inversion"]>(0);
  const [highlightRoots, setHighlightRoots] = useState(true);
  const [textPropertyIndex, setTextPropertyIndex] = useState(0);

  return (
    <div className="scale-kitchen-sink">
      <div className="controls">
        <label>
          Type
          <select
            name="type"
            value={type}
            onChange={(event) => {
              const type = event.target.value as GetChordVoicingParams["type"];
              setType(type);
              setString(getVoicingTypeStrings(type).at(0)!);
            }}
          >
            {Object.keys(voicingTypes).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          String
          <select
            name="string"
            value={string}
            onChange={(event) =>
              setString(
                Number(event.target.value) as GetChordVoicingParams["string"],
              )
            }
          >
            {getVoicingTypeStrings(type).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
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
          Quality
          <select
            name="quality"
            value={quality}
            onChange={(event) =>
              setQuality(event.target.value as GetChordVoicingParams["quality"])
            }
          >
            {voicingQualities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Inversion
          <select
            name="inversion"
            value={inversion}
            onChange={(event) =>
              setInversion(
                Number(
                  event.target.value,
                ) as GetChordVoicingParams["inversion"],
              )
            }
          >
            {voicingInversions.map((x) => (
              <option key={x}>{x}</option>
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
      <Fretboard
        display="contain"
        chordVoicing={{
          root,
          type,
          string,
          quality,
          inversion,
        }}
        style={{
          fill: highlightRoots
            ? highlightDegreeFill({ degree: 1 })
            : "DEFAULT_COLORS.positionFill",
        }}
        textProperty={DISPLAY_TYPES[textPropertyIndex]!.value}
      />
    </div>
  );
}
