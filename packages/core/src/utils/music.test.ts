import { describe, it, expect, assert } from "vitest";

import {
  getNoteFromChroma,
  areNotesEquivalent,
  parseNote,
  getChromaticScaleAtOctave,
} from "./music";

describe("getChromaticScaleAtOctave", () => {
  it("returns the chromatic scale with all information for the given octave", () => {
    expect(getChromaticScaleAtOctave(4)).toMatchSnapshot();
  });
});

describe("getNoteFromChroma", () => {
  it("returns the note of the passed chroma", () => {
    expect(getNoteFromChroma({ chroma: 0 })).toEqual({
      chroma: 0,
      midi: 36,
      note: "C",
      noteWithOctave: "C2",
      octave: 2,
    });
    expect(getNoteFromChroma({ chroma: 3 })).toEqual({
      chroma: 3,
      midi: 39,
      note: "D#",
      noteWithOctave: "D#2",
      octave: 2,
    });
    expect(getNoteFromChroma({ chroma: 3, chordName: "C minor" })).toEqual({
      chroma: 3,
      midi: 39,
      note: "Eb",
      noteWithOctave: "Eb2",
      octave: 2,
    });
    expect(getNoteFromChroma({ chroma: 1, chordName: "A7b9" })).toEqual({
      chroma: 1,
      midi: 37,
      note: "C#",
      noteWithOctave: "C#2",
      octave: 2,
    });
    expect(getNoteFromChroma({ chroma: 10, chordName: "A7b9" })).toEqual({
      chroma: 10,
      midi: 46,
      note: "Bb",
      noteWithOctave: "Bb2",
      octave: 2,
    });

    [-1, 12].forEach((chroma) =>
      assert.throws(
        () => getNoteFromChroma({ chroma }),
        `Chroma must be between 0 and 11, received ${chroma} instead`,
      ),
    );
  });
});

describe("areNotesEquivalent", () => {
  it("checks the enharmonic equivalence relationship", () => {
    // 1. reflexivity
    expect(areNotesEquivalent("C3", "C3")).toBe(true);
    // 2. symmetry
    expect(areNotesEquivalent("D#3", "Eb3")).toBe(true);
    expect(areNotesEquivalent("Eb3", "D#3")).toBe(true);
    // 3. transitivity
    expect(areNotesEquivalent("E3", "Fb3")).toBe(true);
    expect(areNotesEquivalent("Fb3", "D##3")).toBe(true);
    expect(areNotesEquivalent("E3", "D##3")).toBe(true);

    expect(areNotesEquivalent("C3", "C4")).toBe(false);
    expect(areNotesEquivalent("C3", "B#2")).toBe(true);
    expect(areNotesEquivalent("B2", "Cb3")).toBe(true);
  });
});

describe("parseNote", () => {
  it("parses the given note literal", () => {
    expect(parseNote("E")).toEqual({
      note: "E",
      octave: 2,
      noteWithOctave: "E2",
      chroma: 4,
      midi: 40,
    });
    expect(parseNote("E4")).toEqual({
      note: "E",
      octave: 4,
      noteWithOctave: "E4",
      chroma: 4,
      midi: 64,
    });
    expect(parseNote("Bb4")).toEqual({
      note: "Bb",
      octave: 4,
      noteWithOctave: "Bb4",
      chroma: 10,
      midi: 70,
    });
    expect(parseNote("C#4")).toEqual({
      note: "C#",
      octave: 4,
      noteWithOctave: "C#4",
      chroma: 1,
      midi: 61,
    });
  });
});
