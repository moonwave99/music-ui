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
    expect(playbackInfo).toMatchSnapshot();
  });

  it("Gets the playback info of the passed score - with chords", () => {
    const score = getAbcScore({
      id: "1",
      input: "[CEG][DFA]",
    });
    const scoreManager = new ScoreManager();
    const playbackInfo = scoreManager.getScoreContent(score, 0.02);
    expect(playbackInfo).toMatchSnapshot();
  });
});
