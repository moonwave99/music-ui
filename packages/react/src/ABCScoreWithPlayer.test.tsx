import { describe, it, assert } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("Throws error if not used within a PlayerProvider", () => {
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

  it("Doesn't show the time signature when showTimeSignature is false", () => {
    const { container } = render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ABCScoreWithPlayer showTimeSignature={false}>
          T: TestScore
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".abcjs-time-signature")).toBeFalsy();
  });

  it("Doesn't show the tempo when showTempo is false", () => {
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

  it("Shows the piano if showPiano is true", () => {
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

  it("Updates the transport position on note click", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const { container } = render(
      <PlayerProvider player={new Player(playerParams)}>
        <ABCScoreWithPlayer>
          {`
T: Test Score
Q: 60
L: 1/4 
CGEB|DFAC
`}
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );

    expect(playerParams.transport.position).toBe("0:0:0");

    await user.click(container.querySelector(".abcjs-mm1.abcjs-n1")!);
    expect(playerParams.transport.position).toBe("0:0:0");

    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(container.querySelector(".abcjs-mm1.abcjs-n1")!);

    expect(playerParams.transport.position).toBe("1:1:0");
  });

  it("handles tempo change", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const { container } = render(
      <PlayerProvider player={new Player(playerParams)}>
        <ABCScoreWithPlayer>
          {`
T: Test Score
Q: 60
L: 1/4 
CGEB|DFAC
`}
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );

    expect(playerParams.transport.bpm.value).toBe(120);

    const output = screen.getByRole("status", { name: "Current Tempo in BPM" });
    expect(output).toHaveTextContent("60");

    fireEvent.change(container.querySelector("input")!, {
      target: { value: 99 },
    });

    expect(output).toHaveTextContent("99");
    expect(playerParams.transport.bpm.value).toBe(120);
    expect(output).toHaveTextContent("99");

    await user.click(screen.getByRole('button', { name: /reset/i }));

    expect(output).toHaveTextContent("60");    

    await user.click(screen.getByRole("button", { name: /play/i }));
    
    expect(playerParams.transport.bpm.value).toBe(60);

    fireEvent.change(container.querySelector("input")!, {
      target: { value: 99 },
    });

    expect(output).toHaveTextContent("99");
    expect(playerParams.transport.bpm.value).toBe(99);

    await user.click(screen.getByRole("button", { name: /reset/i }));

    expect(output).toHaveTextContent("60");    
    expect(playerParams.transport.bpm.value).toBe(60);
  });
});
