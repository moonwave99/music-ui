import { describe, it, expect } from "vitest";
import { getAbcScore } from "./utils";
import { ScoreManager } from "./scoreManager";

describe("ScoreManager - getScoreContent", () => {
  it("Gets the playback events from the passed score", () => {
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    const scoreManager = new ScoreManager();
    const playbackEvents = scoreManager.getScoreContent(score, 0.02);
    expect(playbackEvents).toMatchSnapshot();
  });

  it("Gets the playback events from the passed score - with chords", () => {
    const score = getAbcScore({
      id: "1",
      input: "[CEG][DFA]",
    });
    const scoreManager = new ScoreManager();
    const playbackEvents = scoreManager.getScoreContent(score, 0.02);
    expect(playbackEvents).toMatchSnapshot();
  });
});
