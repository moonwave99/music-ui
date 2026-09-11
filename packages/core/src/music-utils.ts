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

type NoteWithOctave = {
  note: string;
  octave: number;
};

type GetNoteFromChromaParams = {
  chroma: number;
  chordName?: string;
};

/**
 * Returns the note name for a given chroma, in the context of the given chord name.
 * @example
 * getNoteFromChroma({ chroma: 0 }) // returns "C"
 * getNoteFromChroma({ chroma: 3 }) // returns "D#"
 * getNoteFromChroma({ chroma: 3, chordName: "C minor" }) // returns "Eb"
 * @param __namedParameters The expected parameters
 * @returns The note name
 */
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

/**
 * Defines an equivalence relationship over the notes, if they have the same chroma and belong to the same octave.
 * @example
 * areNotesEquivalent("C3", "C3") // true
 * areNotesEquivalent("C3", "C4") // false
 * areNotesEquivalent("D#3", "Eb3") // true
 * areNotesEquivalent("B2", "Cb3") // true
 * @param a The first note
 * @param b The second note
 * @returns True if the note are equivalent, false otherwise
 */
export function areNotesEquivalent(a: string, b: string) {
  const pa = parseNote(a);
  const pb = parseNote(b);
  return (
    getChroma(pa.note) === getChroma(pb.note) &&
    getAdjustedEnharmonicsOctave(pa) === getAdjustedEnharmonicsOctave(pb)
  );
}

/**
 * Extracts the note name and octave from a note literal.
 * @param note The note literal (e.g. "E3")
 * @returns The parsed information (e.g. `{ note: "E", octave: 3 }`)
 */
export function parseNote(note: string): NoteWithOctave {
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

function getAdjustedEnharmonicsOctave({ note, octave }: NoteWithOctave) {
  if (note === "B#") {
    return octave + 1;
  }
  if (note === "Cb") {
    return octave - 1;
  }
  return octave!;
}
