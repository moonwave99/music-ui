import { get as getNote } from "@tonaljs/note";
import type { NoteInput } from "@music-ui/core";
import { type ScaleNote, GroupedInput } from "./Piano";

export function parseNoteInput(
  input: NoteInput,
  noteLabels: NoteInput = "",
): GroupedInput {
  const noteGroups = getGroups(input).toReversed();
  const labelGroups = getGroups(noteLabels).toReversed();
  return noteGroups.flatMap((group, groupIndex) =>
    group.map((note, noteIndex) => ({
      note,
      group: groupIndex,
      label: getNoteLabel(
        labelGroups[groupIndex] ? labelGroups[groupIndex][noteIndex] : "",
      ),
    })),
  );
}

function getGroups(input: NoteInput) {
  return Array.isArray(input)
    ? [input]
    : input
        .split(",")
        .filter(Boolean)
        .map((x) => x.split(" ").filter(Boolean));
}

function getNoteLabel(label: string | undefined) {
  if (!label || label === "_") {
    return "";
  }
  return label;
}

export function normalizeInput(input: NoteInput) {
  return Array.isArray(input)
    ? input
    : input.replaceAll(",", "").split(" ").filter(Boolean);
}

export const CHROMATIC_SCALE: ScaleNote[] = [
  {
    chroma: 0,
    color: "white",
    note: "C",
  },
  {
    chroma: 1,
    color: "black",
    note: "C#",
  },
  {
    chroma: 2,
    color: "white",
    note: "D",
  },
  {
    chroma: 3,
    color: "black",
    note: "D#",
  },
  {
    chroma: 4,
    color: "white",
    note: "E",
  },
  {
    chroma: 5,
    color: "white",
    note: "F",
  },
  {
    chroma: 6,
    color: "black",
    note: "F#",
  },
  {
    chroma: 7,
    color: "white",
    note: "G",
  },
  {
    chroma: 8,
    color: "black",
    note: "G#",
  },
  {
    chroma: 9,
    color: "white",
    note: "A",
  },
  {
    chroma: 10,
    color: "black",
    note: "A#",
  },
  {
    chroma: 11,
    color: "white",
    note: "B",
  },
] as const;

export function parseNote(
  noteString: string,
  defaultOctave: number,
): {
  chroma: number;
  note: string;
  octave: number;
  midi: number;
} {
  let octave = defaultOctave;
  const maybeOctave = noteString.slice(-1);
  if (Number.isInteger(+maybeOctave)) {
    octave = +maybeOctave;
    noteString = noteString.slice(0, -1);
  }
  const { chroma, pc: note, oct, midi } = getNote(`${noteString}${octave}`);
  return {
    chroma,
    note,
    octave: oct || 0,
    midi: midi || 0,
  };
}
