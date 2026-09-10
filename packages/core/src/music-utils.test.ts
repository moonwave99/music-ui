import { describe, it, expect, assert } from "vitest";

import {
  getNoteFromChroma,
  areNotesEquivalent,
  parseNote,
} from "./music-utils";

describe("getNoteFromChroma", () => {
  it("returns the note of the passed chroma", () => {
    expect(getNoteFromChroma({ chroma: 0 })).toBe("C");
    expect(getNoteFromChroma({ chroma: 3 })).toBe("D#");
    expect(getNoteFromChroma({ chroma: 3, chordName: "C minor" })).toBe("Eb");
    expect(getNoteFromChroma({ chroma: 1, chordName: "A7b9" })).toBe("C#");
    expect(getNoteFromChroma({ chroma: 10, chordName: "A7b9" })).toBe("Bb");

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

    expect(areNotesEquivalent("C3", "B#2")).toBe(true);
    expect(areNotesEquivalent("B2", "Cb3")).toBe(true);
  });
});

describe("parseNote", () => {
  it("parses the given note literal", () => {
    expect(parseNote("E")).toEqual({ note: "E", octave: 2 });
    expect(parseNote("E4")).toEqual({ note: "E", octave: 4 });
    expect(parseNote("Bb4")).toEqual({ note: "Bb", octave: 4 });
    expect(parseNote("C#4")).toEqual({ note: "C#", octave: 4 });
  });
});
