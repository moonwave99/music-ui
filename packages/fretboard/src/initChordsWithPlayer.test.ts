// @vitest-environment jsdom
import { describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { initChordsWithPlayer } from "./initChordsWithPlayer";
import { getMockedPlayerParams } from "@music-ui/core";
import { Player } from "@music-ui/core";
import { DEFAULT_COLORS } from "./constants";

describe("initChordsWithPlayer", () => {
  it("initializes chords with players on selection", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
        <main>
          <div data-chord data-id="chord-1">
            <div class="fretboard"
              data-input="x32310"
              data-chord-name="C7"
              data-include-open-strings></div>
            <div class="controls"></div>
          </div>
          <div data-chord data-id="chord-2">
            <div class="fretboard"
              data-input="x02210"
              data-chord-name="A minor"></div>
            <div class="controls"></div>
          </div>     
        </main>`;

    const elements = document.querySelectorAll<HTMLElement>("[data-chord]");
    const mockedParams = getMockedPlayerParams();
    const player = new Player(mockedParams);

    initChordsWithPlayer({ player });

    const activeElement = elements[0]!;

    const playBlockButton =
      activeElement.querySelector<HTMLButtonElement>(".playBlock-button")!;
    const playArpeggioButton = activeElement.querySelector<HTMLButtonElement>(
      ".playArpeggio-button",
    )!;

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    await user.click(playBlockButton);

    expect(playBlockButton.disabled).toBe(true);
    expect(playArpeggioButton.disabled).toBe(true);

    ["C3", "E3", "Bb3", "C4", "E4"].forEach((note) => {
      expect(
        activeElement
          .querySelector(`.position-note-with-octave-${note} circle`)
          ?.getAttribute("fill"),
      ).toBe(DEFAULT_COLORS.highlight);
    });

    mockedParams.transport.playUntilEnd();

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    mockedParams.reset();

    await user.click(playArpeggioButton);

    expect(playBlockButton.disabled).toBe(true);
    expect(playArpeggioButton.disabled).toBe(true);

    ["C3", "E3", "Bb3", "C4", "E4"].forEach((note) => {
      expect(
        activeElement
          .querySelector(`.position-note-with-octave-${note} circle`)
          ?.getAttribute("fill"),
      ).toBe(DEFAULT_COLORS.highlight);
      mockedParams.transport.playNext();
    });

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initChordsWithPlayer({ player: null as unknown as Player });
    }, "You must pass a Player instance");
  });
});
