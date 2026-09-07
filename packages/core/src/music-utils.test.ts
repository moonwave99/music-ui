import { describe, it, expect, assert } from "vitest";

import { getNoteFromChroma } from "./music-utils";

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
