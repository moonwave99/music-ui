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
      hash: "e5cb2e9bddf789d759392e77e28da51d",
      info: { bpm: 120 },
      content: "Q:120\n[C, E, G, B,]6",
    });

    const scoreWithDefaultPlaybackMode = getPianoScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "e5cb2e9bddf789d759392e77e28da51d",
      info: { bpm: 120 },
      content: "Q:120\n[C, E, G, B,]6",
    });
  });

  it("returns the score for the given notes - arpeggio", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "arpeggio" });
    expect(score).toEqual({
      id: "1",
      hash: "4c230803a315943460fc7546cf506cd5",
      info: { bpm: 120 },
      content: `Q:120
C, E, G, B,`,
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
      hash: "69e0a4a35c98433d7bcc4f065acd0ff8",
    });
  });
});
