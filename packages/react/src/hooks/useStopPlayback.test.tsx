import { assert, describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Player, getMockedPlayerParams } from "@music-ui/core";
import { useStopPlayback } from "./useStopPlayback";
import { PlayerProvider } from "../PlayerProvider";
import { useEffect } from "react";
import { ABCScoreWithPlayer } from "../components/ABCScoreWithPlayer";

describe("useStopPlayback", () => {
  it("Renders correctly", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const player = new Player(playerParams);
    const { unmount } = render(
      <PlayerProvider player={player}>
        <Wrapper />
        <ABCScoreWithPlayer>CDEF GABc|</ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    await user.click(screen.getByRole("button", { name: /play/i }));
    unmount();

    expect(playerParams.transport.position).toBe("0:0:0");
    expect(player.getScore()).toBe(null);
  });

  it("Throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<Wrapper />);
    }, "useStopPlayback has to be used within a <PlayerProvider>");
  });
});

function Wrapper() {
  const { stop } = useStopPlayback();
  useEffect(() => {
    return () => stop();
  }, [stop]);
  return null;
}
