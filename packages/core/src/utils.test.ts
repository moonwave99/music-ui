import { describe, it, expect } from "vitest";
import { getPianoScore } from "./utils";

describe("getPianoScore", () => {
  it("returns the score for the given notes - block", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "block" });
    expect(score).toEqual({
      id: "1",
      hash: "bc0c2820adcbc54960b4e01d0378e803",
      content: "[C, E, G, B,]",
    });

    const scoreWithDefaultPlaybackMode = getPianoScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "bc0c2820adcbc54960b4e01d0378e803",
      content: "[C, E, G, B,]",
    });
  });

  it("returns the score for the given notes - arpeggio", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "arpeggio" });
    expect(score).toEqual({
      id: "1",
      hash: "8849aede79e4bb94720cbf414ce36f67",
      content: "C, E, G, B,",
    });
  });
});
