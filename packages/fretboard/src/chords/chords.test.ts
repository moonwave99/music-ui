import { describe, it, expect } from "vitest";

import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import { parseChord, getChordFretSpan, parseBarres } from "./chords";

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
        {
          string: 2,
          fret: 1,
          chroma: 0,
          note: "C",
          octave: 4,
          noteWithOctave: "C4",
        },
        {
          string: 4,
          fret: 2,
          chroma: 4,
          note: "E",
          octave: 3,
          noteWithOctave: "E3",
        },
        {
          string: 5,
          fret: 3,
          chroma: 0,
          note: "C",
          octave: 3,
          noteWithOctave: "C3",
        },
      ],
      mutedStrings: [6],
    });
  });

  it("includes open strings if includeOpenStrings is true", () => {
    const system = new FretboardSystem();
    expect(
      parseChord({
        input: "x32010",
        includeOpenStrings: true,
        system,
      }),
    ).toEqual({
      positions: [
        {
          string: 1,
          fret: 0,
          chroma: 4,
          note: "E",
          octave: 4,
          noteWithOctave: "E4",
        },
        {
          string: 2,
          fret: 1,
          chroma: 0,
          note: "C",
          octave: 4,
          noteWithOctave: "C4",
        },
        {
          string: 3,
          fret: 0,
          chroma: 7,
          note: "G",
          octave: 3,
          noteWithOctave: "G3",
        },
        {
          string: 4,
          fret: 2,
          chroma: 4,
          note: "E",
          octave: 3,
          noteWithOctave: "E3",
        },
        {
          string: 5,
          fret: 3,
          chroma: 0,
          note: "C",
          octave: 3,
          noteWithOctave: "C3",
        },
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
        {
          string: 1,
          fret: 10,
          chroma: 2,
          note: "D",
          octave: 5,
          noteWithOctave: "D5",
        },
        {
          string: 2,
          fret: 11,
          chroma: 10,
          note: "Bb",
          octave: 4,
          noteWithOctave: "Bb4",
        },
        {
          string: 3,
          fret: 12,
          chroma: 7,
          note: "G",
          octave: 4,
          noteWithOctave: "G4",
        },
        {
          string: 4,
          fret: 12,
          chroma: 2,
          note: "D",
          octave: 4,
          noteWithOctave: "D4",
        },
        {
          string: 5,
          fret: 10,
          chroma: 7,
          note: "G",
          octave: 3,
          noteWithOctave: "G3",
        },
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
        {
          string: 2,
          fret: 11,
          chroma: 10,
          note: "Bb",
          octave: 4,
          noteWithOctave: "Bb4",
        },
        {
          string: 3,
          fret: 12,
          chroma: 7,
          note: "G",
          octave: 4,
          noteWithOctave: "G4",
        },
        {
          string: 4,
          fret: 12,
          chroma: 2,
          note: "D",
          octave: 4,
          noteWithOctave: "D4",
        },
        {
          string: 5,
          fret: 10,
          chroma: 7,
          note: "G",
          octave: 3,
          noteWithOctave: "G3",
        },
      ],
      mutedStrings: [6],
    });
  });
});

describe("getChordFretSpan", () => {
  it("Returns how many frets does the passed chord take", () => {
    expect(getChordFretSpan("x32010")).toBe(3);
    expect(getChordFretSpan("x5454x")).toBe(3);
    expect(getChordFretSpan("xx5432")).toBe(4);
  });
});

describe("parseBarres", () => {
  it("Parses the data attribute barres input", () => {
    expect(parseBarres("1")).toEqual([{ fret: 1, stringFrom: 6, stringTo: 1 }]);
    expect(parseBarres("1:2")).toEqual([
      { fret: 1, stringFrom: 2, stringTo: 1 },
    ]);
    expect(parseBarres("1:5:3")).toEqual([
      { fret: 1, stringFrom: 5, stringTo: 3 },
    ]);
    expect(parseBarres("1,2,3")).toEqual([
      { fret: 1, stringFrom: 6, stringTo: 1 },
      { fret: 2, stringFrom: 6, stringTo: 1 },
      { fret: 3, stringFrom: 6, stringTo: 1 },
    ]);
    expect(parseBarres("1:2:3,1:2:3,1:2:3")).toEqual([
      { fret: 1, stringFrom: 2, stringTo: 3 },
      { fret: 1, stringFrom: 2, stringTo: 3 },
      { fret: 1, stringFrom: 2, stringTo: 3 },
    ]);
  });
});
