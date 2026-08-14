import { describe, it, expect } from "vitest";
import { getAbcScore, getPianoScore, toAbcNotation } from "./utils";

describe("toAbcNotation", () => {
  it("converts the input from scientific to abc notation", () => {
    expect(toAbcNotation(["C3", "E3", "G3"])).toBe("C, E, G,");
    expect(toAbcNotation("C3 E3 G3")).toBe("C, E, G,");
  });
});

describe("getPianoScore", () => {
  it("returns the score for the given notes - block", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "block" });
    expect(score).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });

    const scoreWithDefaultPlaybackMode = getPianoScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });
  });

  it("returns the score for the given notes - arpeggio", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "arpeggio" });
    expect(score).toEqual({
      id: "1",
      hash: "2df5ea19f579b803d9efd1f62db18d9b",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\nC, E, G, B,",
    });
  });
});

describe("getAbcScore", () => {
  it("returns the score for the given content", () => {
    const abcScore = getAbcScore({ id: "1", input: "C E G" });
    expect(abcScore).toEqual({
      id: "1",
      info: {
        title: "",
        composer: "",
        key: "C",
        meter: "4/4",
        unitNoteLength: "1/4",
        bpm: 120,
      },
      content: "T:\nC:\nK:C\nM:4/4\nL:1/4\nQ:120\nC E G",
      hash: "cf0770b9c505737f4a593df9c813ea5d",
    });
  });
});
