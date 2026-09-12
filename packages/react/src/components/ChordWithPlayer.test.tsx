import { describe, it, assert } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Player, getMockedPlayerParams } from "@music-ui/core";
import { ChordWithPlayer } from "./ChordWithPlayer";
import { PlayerProvider } from "../PlayerProvider";
import { DEFAULT_COLORS } from "@music-ui/fretboard";

describe("ChordWithPlayer", () => {
  it("Renders correctly", () => {
    render(
      <PlayerProvider player={new Player(getMockedPlayerParams())}>
        <ChordWithPlayer input="x32010" />
      </PlayerProvider>,
    );
    expect(screen.getByRole("button", { name: /play/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /arpeggio/i })).toBeVisible();
  });

  it("Throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<ChordWithPlayer input="x32010" />);
    }, "usePlayer has to be used within a <PlayerProvider>");
  });

  it("Plays the notes altogether when the Play button is pressed", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const player = new Player(playerParams);

    const notes = ["C3", "E3", "C4"];

    const { container } = render(
      <PlayerProvider player={player}>
        <ChordWithPlayer input="x32010" />
      </PlayerProvider>,
    );
    const playBlockButton = screen.getByRole("button", { name: /play/i });
    await user.click(playBlockButton);
    expect(playBlockButton).toBeDisabled();

    notes.forEach((note) =>
      expect(
        container
          .querySelector(`.position-note-with-octave-${note} circle`)
          ?.getAttribute("fill"),
      ).toBe(DEFAULT_COLORS.highlight),
    );
  });

  it("Plays the notes in arpeggio when the Arpeggio button is pressed", async () => {
    const user = userEvent.setup();
    const playerParams = getMockedPlayerParams();
    const player = new Player(playerParams);

    const notes = ["C3", "E3", "G3", "C4", "E4"];

    const { container } = render(
      <PlayerProvider player={player}>
        <ChordWithPlayer input="x32010" includeOpenStrings />
      </PlayerProvider>,
    );
    const playArpeggioButton = screen.getByRole("button", {
      name: /arpeggio/i,
    });
    await user.click(playArpeggioButton);
    expect(playArpeggioButton).toBeDisabled();

    notes.forEach((note) => {
      expect(
        container
          .querySelector(`.position-note-with-octave-${note} circle`)
          ?.getAttribute("fill"),
      ).toBe(DEFAULT_COLORS.highlight);
      act(() => playerParams.transport.playNext());
    });
  });
});
