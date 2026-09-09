import { getNoteFromChroma } from "@music-ui/core";
import { Barre, type FretboardPosition } from "../fretboard/Fretboard";
import { FretboardSystem } from "../fretboardSystem/FretboardSystem";

const MIN_CHORD_FRET_SPAN = 3;

export const CHORD_SYMBOLS = {
  mute: "x",
  splitter: "-",
} as const;

/**
 * The parameters accepted by the parseChord function.
 * @property input The chord input (e.g. x32010).
 * @property chordName The chord name (e.g. C major, A7b9).
 * @property includeOpenStrings Show the open string notes or not.
 * @property system The current fretboard system (needed to determine the note names).
 */
export type ParseChordParams = {
  input: string;
  chordName?: string;
  includeOpenStrings?: boolean;
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
  includeOpenStrings,
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
        if (fret === "0" && !includeOpenStrings) {
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
          positions: [
            ...memo.positions,
            { ...position, note, noteWithOctave: `${note}${position.octave}` },
          ],
        };
      },
      {
        positions: [] as FretboardPosition[],
        mutedStrings: [] as number[],
      },
    );
}

/**
 * Returns how many frets does the passed chord take.
 * @example
 * getChordFretSpan("x32010") // returns 3
 * @example
 * getChordFretSpan("x5454x") // returns 3
 * @example
 * getChordFretSpan("xx5432") // returns 4
 * @param input The chord input
 * @returns The chord fret span
 */
export function getChordFretSpan(input: string) {
  const tokens = input
    .split(input.includes(CHORD_SYMBOLS.splitter) ? CHORD_SYMBOLS.splitter : "")
    .filter((x) => Number.isInteger(+x) && x !== "0")
    .map(Number);

  return Math.max(
    MIN_CHORD_FRET_SPAN,
    Math.max(...tokens) - Math.min(...tokens) + 1,
  );
}

/**
 * Parses the data attribute barres input.
 * @param input The barres input
 * @returns An array of the found barres
 */
export function parseBarres(input: string): Barre[] {
  return input
    .split(",")
    .filter(Boolean)
    .map((barre) => {
      const tokens = barre.trim().split(":");
      return {
        fret: Number(tokens[0]),
        stringFrom: tokens[1] ? Number(tokens[1]) : 6,
        stringTo: tokens[2] ? Number(tokens[2]) : 1,
      };
    });
}
