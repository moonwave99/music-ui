import { type FretboardPosition } from "../fretboard/Fretboard";

const CHORD_SYMBOLS = {
  mute: "x",
  splitter: "-",
} as const;

export type ParseChordParams = {
  input: string;
  showOpenStrings?: boolean;
};

type ParseChord = {
  positions: FretboardPosition[];
  mutedStrings: number[];
};

export function parseChord({
  input,
  showOpenStrings,
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
        return {
          ...memo,
          positions: [
            ...memo.positions,
            {
              fret: Number(fret),
              string: string + 1,
            },
          ],
        };
      },
      {
        positions: [] as FretboardPosition[],
        mutedStrings: [] as number[],
      },
    );
}
