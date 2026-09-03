import { FretboardPosition } from "../fretboard/Fretboard";
import { get as getInterval } from "@tonaljs/interval";
import { transpose } from "@tonaljs/note";

export type TetrachordTypes =
  "Major" | "Minor" | "Phrygian" | "Harmonic" | "Lydian";
export type TetrachordLayouts =
  "Linear" | "ThreePlusOne" | "TwoPlusTwo" | "OnePlusThree";

const Tetrachords = {
  Major: ["M2", "M2", "m2"],
  Minor: ["M2", "m2", "M2"],
  Phrygian: ["m2", "M2", "M2"],
  Harmonic: ["m2", "A2", "m2"],
  Lydian: ["M2", "M2", "M2"],
} as const;

type TetrachordArgs = {
  root: string;
  type: TetrachordTypes;
  layout: TetrachordLayouts;
  string: number;
  fret: number;
};

export function tetrachord(
  { root, type, layout, string, fret }: TetrachordArgs = {
    root: "E",
    type: "Major",
    layout: "Linear",
    string: 6,
    fret: 0,
  },
): FretboardPosition[] {
  const tetrachord = Tetrachords[type];
  const pattern = [
    {
      string,
      fret,
      note: root,
    },
  ];

  let partial = 0;
  let currentNote = root;
  if (layout === "Linear") {
    tetrachord.forEach((x) => {
      const { semitones } = getInterval(x);
      currentNote = transpose(currentNote, x);
      partial += semitones;
      pattern.push({
        string,
        fret: fret + partial,
        note: currentNote,
      });
    });
    return pattern;
  }

  if (string === 1) {
    throw new Error(
      "Cannot split a tetrachord over two strings if starting on the first one",
    );
  }

  let currentString = string;

  const splitIndex = ((): number => {
    switch (layout) {
      case "ThreePlusOne":
        return 2;
      case "TwoPlusTwo":
        return 1;
      case "OnePlusThree":
        return 0;
    }
  })();

  tetrachord.forEach((x, i) => {
    const { semitones } = getInterval(x);
    currentNote = transpose(currentNote, x);
    if (i === splitIndex) {
      currentString -= 1;
      partial = currentString === 2 ? partial - 4 : partial - 5;
    }
    partial += semitones;

    const currentFret = fret + partial;

    if (currentFret < 0) {
      throw new Error("Cannot use this layout from this starting fret");
    }

    pattern.push({
      string: currentString,
      fret: currentFret,
      note: currentNote,
    });
  });

  return pattern;
}
