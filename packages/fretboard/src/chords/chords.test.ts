import { describe, it, expect } from "vitest";

import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import { parseChord } from "./chords";

describe("parseChord", () => {
  it("parses the passed input", () => {
    const system = new FretboardSystem();
    expect(
      parseChord({
        input: "x32010",
        system,
      }),
    ).toEqual({
      positions: [
        { string: 2, fret: 1, chroma: 0, note: "C" },
        { string: 4, fret: 2, chroma: 4, note: "E" },
        { string: 5, fret: 3, chroma: 0, note: "C" },
      ],
      mutedStrings: [6],
    });
  });

  it("includes open strings if showOpenStrings is true", () => {
    const system = new FretboardSystem();
    expect(
      parseChord({
        input: "x32010",
        showOpenStrings: true,
        system,
      }),
    ).toEqual({
      positions: [
        { string: 1, fret: 0, chroma: 4, note: "E" },
        { string: 2, fret: 1, chroma: 0, note: "C" },
        { string: 3, fret: 0, chroma: 7, note: "G" },
        { string: 4, fret: 2, chroma: 4, note: "E" },
        { string: 5, fret: 3, chroma: 0, note: "C" },
      ],
      mutedStrings: [6],
    });
  });

  it("parses double digit frets", () => {
    const system = new FretboardSystem();
    expect(
      parseChord({
        input: "x-10-12-12-11-10",
        chordName: "G minor",
        system,
      }),
    ).toEqual({
      positions: [
        { string: 1, fret: 10, chroma: 2, note: "D" },
        { string: 2, fret: 11, chroma: 10, note: "Bb" },
        { string: 3, fret: 12, chroma: 7, note: "G" },
        { string: 4, fret: 12, chroma: 2, note: "D" },
        { string: 5, fret: 10, chroma: 7, note: "G" },
      ],
      mutedStrings: [6],
    });
  });

  it("ignores non existing positions", () => {
    const system = new FretboardSystem();
    expect(
      parseChord({
        input: "x-10-12-12-11-100",
        chordName: "G minor",
        system,
      }),
    ).toEqual({
      positions: [
        { string: 2, fret: 11, chroma: 10, note: "Bb" },
        { string: 3, fret: 12, chroma: 7, note: "G" },
        { string: 4, fret: 12, chroma: 2, note: "D" },
        { string: 5, fret: 10, chroma: 7, note: "G" },
      ],
      mutedStrings: [6],
    });
  });
});
