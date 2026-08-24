// @vitest-environment jsdom
import { describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { initPianoWithPlayer } from "./initWithPlayer";
import { getMockedPlayerParams } from "@music-ui/core";

import { Player } from "@music-ui/core";

describe("initPianoWithPlayer", () => {
  // #TODO allow remote control for mocked Part
  it("initializes pianos with players on selection", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
        <main>
          <div
            data-piano
            data-notes="C4 E4 G4 B4"
            data-note-labels="1 3 5 7"
            data-octaves="5"
            data-id="piano-1"
          >
            <div class="piano"></div>
            <div class="controls"></div>
          </div>
          <div
            data-piano
            data-notes="C4 E4 G4 B4"
            data-note-labels="1 3 5 7"
            data-octaves="5"
            data-id="piano-2"
          >
            <div class="piano"></div>
            <div class="controls"></div>
          </div>          
        </main>`;

    const elements = document.querySelectorAll<HTMLElement>("[data-piano]")!;
    const mockedParams = getMockedPlayerParams();
    const player = new Player(mockedParams);

    initPianoWithPlayer({ player });

    const activeElement = elements[0]!;
    const otherElement = elements[1]!;

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

    ["C4", "E4", "G4", "B4"].forEach((note) =>
      expect(
        activeElement
          .querySelector(`.note-with-octave-${note}`)
          ?.classList.contains("key-played"),
      ).toBe(true),
    );

    mockedParams.transport.next();

    expect(otherElement.querySelectorAll(".key-played").length).toBe(0);

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    expect(activeElement.querySelectorAll(".key-played").length).toBe(0);

    mockedParams.reset();

    await user.click(playArpeggioButton);

    expect(playBlockButton.disabled).toBe(true);
    expect(playArpeggioButton.disabled).toBe(true);

    ["C4", "E4", "G4", "B4"].forEach((note) => {
      expect(
        activeElement
          .querySelector(`.note-with-octave-${note}`)
          ?.classList.contains("key-played"),
      ).toBe(true);
      mockedParams.transport.next();
    });

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    expect(activeElement.querySelectorAll(".key-played").length).toBe(0);
  });

  it("Does not create controls if no notes are passed", () => {
    document.body.innerHTML = `
      <main>
          <div
            data-piano
            data-id="piano-1"
          >
            <div class="piano"></div>
            <div class="controls"></div>
          </div>
      </main>`;

    const player = new Player(getMockedPlayerParams());

    initPianoWithPlayer({ player });

    expect(
      document.querySelectorAll("[data-piano] .controls button").length,
    ).toBe(0);
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initPianoWithPlayer({ player: null as unknown as Player });
    }, "You must pass a Player instance");
  });

  it("Throws error if no piano element is found", () => {
    document.body.innerHTML = `
      <main>
          <div
            data-piano
            data-notes="C4 E4 G4 B4"
            data-note-labels="1 3 5 7"
            data-octaves="5"
            data-id="piano-1"
          >
            <div class="controls"></div>
          </div>
      </main>`;
    assert.throws(() => {
      const selection = document.querySelector<HTMLElement>("[data-piano]")!;
      const player = new Player(getMockedPlayerParams());
      initPianoWithPlayer({ selection, player });
    }, "pianoElement not found inside element with id: piano-1");
  });

  it("Throws error if no controls element is found", () => {
    document.body.innerHTML = `
      <main>
          <div
            data-piano
            data-notes="C4 E4 G4 B4"
            data-note-labels="1 3 5 7"
            data-octaves="5"
            data-id="piano-1"
          >
            <div class="piano"></div>
          </div>
      </main>`;
    assert.throws(() => {
      const selection = document.querySelector<HTMLElement>("[data-piano]")!;
      const player = new Player(getMockedPlayerParams());
      initPianoWithPlayer({ selection, player });
    }, "controlsElement not found inside element with id: piano-1");
  });
});
