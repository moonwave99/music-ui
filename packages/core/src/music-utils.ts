import { enharmonic, chroma as getChroma } from "@tonaljs/note";
import { get as getChord } from "@tonaljs/chord";

export const ACCIDENTAL_MAP = [
  {
    symbol: "##",
    replacement: "double-sharp",
  },
  {
    symbol: "bb",
    replacement: "double-flat",
  },
  {
    symbol: "#",
    replacement: "sharp",
  },
  {
    symbol: "b",
    replacement: "flat",
  },
] as const;

export const CHROMATIC_SCALE = [
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

const DEFAULT_OCTAVE = 2;

type GetNoteFromChromaParams = {
  chroma: number;
  chordName?: string;
};

export function getNoteFromChroma({
  chroma,
  chordName = "",
}: GetNoteFromChromaParams) {
  if (chroma < 0 || chroma > 11) {
    throw new Error(
      `Chroma must be between 0 and 11, received ${chroma} instead`,
    );
  }
  const { note } = CHROMATIC_SCALE[chroma]!;
  const chord = getChord(chordName);
  if (!chord.empty && !chord.notes.includes(note)) {
    return enharmonic(note);
  }
  return note;
}

export function areNotesEquivalent(a: string, b: string) {
  const pa = parseNote(a);
  const pb = parseNote(b);
  return getChroma(pa.note) === getChroma(pb.note) && pa.octave === pb.octave;
}

export function parseNote(note: string) {
  let octave = Number(note.slice(-1));
  let parsedNote = note;
  if (isNaN(octave)) {
    octave = DEFAULT_OCTAVE;
  } else {
    parsedNote = note.slice(0, -1);
  }
  return {
    octave,
    note: parsedNote,
  };
}
