import { describe, it, expect } from "vitest";
import { getAbcScore } from "./utils";
import { ScoreManager } from "./scoreManager";

describe("ScoreManager - getScoreContent", () => {
  it("Gets the playback info of the passed score", () => {
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    const scoreManager = new ScoreManager();
    const playbackInfo = scoreManager.getScoreContent(score, 0.02);
    expect(playbackInfo).toMatchObject([
      {
        time: 0,
        duration: 0.5,
        notes: ["C4"],
      },
      {
        time: 0.5,
        duration: 0.5,
        notes: ["D4"],
      },
      {
        time: 1,
        duration: 0.5,
        notes: ["E4"],
      },
      {
        time: 1.5,
        duration: 0.5,
        notes: ["F4"],
      },
    ]);
  });

  it("Gets the playback info of the passed score - with chords", () => {
    const score = getAbcScore({
      id: "1",
      input: "[CEG][DFA]",
    });
    const scoreManager = new ScoreManager();
    const playbackInfo = scoreManager.getScoreContent(score, 0.02);
    expect(playbackInfo).toMatchObject([
      {
        time: 0,
        duration: 0.5,
        notes: ["C4", "E4", "G4"],
      },
      {
        time: 0.5,
        duration: 0.5,
        notes: ["D4", "F4", "A4"],
      },
    ]);
  });
});
