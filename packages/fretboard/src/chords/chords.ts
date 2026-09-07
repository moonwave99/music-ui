import { getNoteFromChroma } from "@music-ui/core";
import { type FretboardPosition } from "../fretboard/Fretboard";
import { FretboardSystem } from "../fretboardSystem/FretboardSystem";

const CHORD_SYMBOLS = {
  mute: "x",
  splitter: "-",
} as const;

/**
 * The parameters accepted by the parseChord function.
 * @property input The chord input (e.g. x32010).
 * @property chordName The chord name (e.g. C major, A7b9).
 * @property showOpenStrings Show the open string notes or not.
 * @property system The current fretboard system (needed to determine the note names).
 */
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

/**
 * Parses the chord input in the given system context.
 * @param __namedParameters The expected parameters.
 * @returns { ParseChord } The parsed chord information.
 */
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
          console.warn(
            `Could not find position at: fret ${fret}, string ${string + 1}`,
          );
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
