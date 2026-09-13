import { enharmonic, chroma as getChroma, get as getNote } from "@tonaljs/note";
import { get as getChord } from "@tonaljs/chord";
import { toMidi } from "@tonaljs/midi";
import type { Note } from "../types";

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

export function getChromaticScaleAtOctave(octave: number) {
  return CHROMATIC_SCALE.map((x) => ({
    ...x,
    octave,
    noteWithOctave: `${x.note}${octave}`,
    midi: toMidi(`${x.note}${octave}`)!,
  }));
}

type GetNoteFromChromaParams = {
  chroma: number;
  octave?: number;
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
  octave = DEFAULT_OCTAVE,
}: GetNoteFromChromaParams) {
  if (chroma < 0 || chroma > 11) {
    throw new Error(
      `Chroma must be between 0 and 11, received ${chroma} instead`,
    );
  }
  const { note } = CHROMATIC_SCALE[chroma]!;
  const chord = getChord(chordName);
  let noteName: string = note;
  if (!chord.empty && !chord.notes.includes(note)) {
    noteName = enharmonic(note);
  }
  return parseNote(`${noteName}${octave}`);
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
 * @param note The note literal (e.g. "E4")
 * @example
 * parseNote("E4") // returns { note: "E", octave: 4, chroma: 4, midi: 64 }
 * @returns The parsed Note
 */
export function parseNote(input: string, defaultOctave = DEFAULT_OCTAVE): Note {
  let octave = Number(input.slice(-1));
  let parsedNote = input;
  if (isNaN(octave)) {
    octave = defaultOctave;
  } else {
    parsedNote = input.slice(0, -1);
  }
  const { chroma, oct, midi } = getNote(`${parsedNote}${octave}`);
  return {
    note: parsedNote,
    noteWithOctave: `${parsedNote}${oct!}`,
    chroma,
    octave: oct!,
    midi: midi!,
  };
}

function getAdjustedEnharmonicsOctave({ note, octave }: Note) {
  if (note === "B#") {
    return octave + 1;
  }
  if (note === "Cb") {
    return octave - 1;
  }
  return octave!;
}
