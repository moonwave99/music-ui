import { describe, it, assert } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Player, getMockedPlayerParams } from "@music-ui/core";
import { PianoWithPlayer } from "./PianoWithPlayer";
import { PlayerProvider } from "../PlayerProvider";

describe("PianoWithPlayer", () => {
  it("Renders correctly", () => {
    render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <PianoWithPlayer id="1" />
      </PlayerProvider>,
    );
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /arpeggio/i })).toBeVisible();
  });

  it("Throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<PianoWithPlayer id="1" />);
    }, "usePlayer has to be used within a <PlayerProvider>");
  });

  it("Plays the notes altogether when the Play button is pressed", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const player = new Player(playerParams);

    const notes = ["C3", "E3", "G3"];

    const { container } = render(
      <PlayerProvider player={player}>
        <PianoWithPlayer id="1" notes={notes} />
      </PlayerProvider>,
    );
    const playBlockButton = screen.getByRole("button", { name: /play/i });
    await user.click(playBlockButton);
    expect(playBlockButton).toBeDisabled();

    notes.forEach((note) =>
      expect(
        container.querySelector(`.note-with-octave-${note}`)?.classList,
      ).toContain("key-played"),
    );
  });

  it("Plays the notes in arpeggio when the Arpeggio button is pressed", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const player = new Player(playerParams);

    const notes = ["C3", "E3", "G3"];

    const { container } = render(
      <PlayerProvider player={player}>
        <PianoWithPlayer id="1" notes={notes} />
      </PlayerProvider>,
    );
    const playArpeggioButton = screen.getByRole("button", {
      name: /arpeggio/i,
    });
    await user.click(playArpeggioButton);
    expect(playArpeggioButton).toBeDisabled();

    notes.forEach((note) => {
      expect(
        container.querySelector(`.note-with-octave-${note}`)?.classList,
      ).toContain("key-played");
      act(() => playerParams.transport.playNext());
    });
  });
});
