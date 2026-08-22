import { describe, it, assert } from "vitest";
import { render } from "@testing-library/react";
import { ABCScoreWithPlayer } from "./ABCScoreWithPlayer";

describe("ABCScoreWithPlayer", () => {
  it("throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<ABCScoreWithPlayer>Content</ABCScoreWithPlayer>);
    }, "usePlayer has to be used within <PlayerProvider>");
  });
});
