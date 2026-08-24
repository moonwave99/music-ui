import { describe, it, assert } from "vitest";
import { render, screen } from "@testing-library/react";
import { Player, getMockedPlayerParams } from "@music-ui/core";
import { ABCScoreWithPlayer } from "./ABCScoreWithPlayer";
import { PlayerProvider } from "./PlayerProvider";

describe("ABCScoreWithPlayer", () => {
  it("Renders correctly", () => {
    const { container } = render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer>CDEF GABc|</ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".abc-score")).toBeTruthy();
  });

  it("throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<ABCScoreWithPlayer>CDEF GABc|</ABCScoreWithPlayer>);
    }, "usePlayer has to be used within <PlayerProvider>");
  });

  it("Renders passed button labels", () => {
    render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer
          playButtonLabel="Play!"
          pauseButtonLabel="Pause!"
          stopButtonLabel="Stop!"
        >
          CDEF GABc|
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(screen.getByLabelText("Play!")).toBeTruthy();
    expect(screen.getByLabelText("Pause!")).toBeTruthy();
    expect(screen.getByLabelText("Stop!")).toBeTruthy();
  });

  it("doesn't show the time signature when showTimeSignature is false", () => {
    const { container } = render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer showTimeSignature={false}>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".abcjs-time-signature")).toBeFalsy();
  });

  it("doesn't show the tempo when showTempo is false", () => {
    const { container } = render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer showTempo={false}>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".abcjs-tempo")).toBeFalsy();
  });

  it("shows the piano if showPiano is true", () => {
    const { container } = render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer showPiano>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".piano")).toBeTruthy();
  });
});
