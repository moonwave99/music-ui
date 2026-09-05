import { getNoteFromChroma } from "@music-ui/core";
import { type FretboardPosition } from "../fretboard/Fretboard";
import { FretboardSystem } from "../fretboardSystem/FretboardSystem";

const CHORD_SYMBOLS = {
  mute: "x",
  splitter: "-",
} as const;

export type ParseChordParams = {
  input: string;
  chordName?: string;
  showOpenStrings?: boolean;
  system: FretboardSystem;
};

type ParseChord = {
  positions: FretboardPosition[];
  mutedStrings: number[];
};

export function parseChord({
  input,
  chordName,
  showOpenStrings,
  system,
}: ParseChordParams): ParseChord {
  const splitter = input.includes(CHORD_SYMBOLS.splitter)
    ? CHORD_SYMBOLS.splitter
    : "";

  return input
    .split(splitter)
    .reverse()
    .reduce(
      (memo, fret, string) => {
        if (fret === "0" && !showOpenStrings) {
          return memo;
        }
        if (fret === CHORD_SYMBOLS.mute) {
          return { ...memo, mutedStrings: [...memo.mutedStrings, string + 1] };
        }

        const position = system.getPositionAt({
          fret: Number(fret),
          string: string + 1,
        });

        if (!position) {
          return memo;
        }

        const note = getNoteFromChroma({
          chroma: position.chroma,
          chordName,
        });

        return {
          ...memo,
          positions: [...memo.positions, { ...position, note }],
        };
      },
      {
        positions: [] as FretboardPosition[],
        mutedStrings: [] as number[],
      },
    );
}
