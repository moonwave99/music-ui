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
      content: `Q:120
[C, E, G, B,]6`,
    });

    const scoreWithDefaultPlaybackMode = getPianoScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "e5cb2e9bddf789d759392e77e28da51d",
      info: { bpm: 120 },
      content: `Q:120
[C, E, G, B,]6`,
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
      info: { bpm: 120 },
      content: "C E G",
      hash: "9f2fd30bba4472d786cecd2dbfd0cfe6",
    });
  });
});
