// @vitest-environment jsdom
import { describe, it, expect, vi, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { initPianoWithPlayer } from "./initWithPlayer";

//@ts-expect-error Hard to mock the whole thing without having vi.mock to complain
vi.mock(import("@music-ui/core"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Player: vi.fn(
      class {
        private handlers = {} as Record<
          string,
          ((...params: unknown[]) => void)[]
        >;
        private score: Score | null = null;
        on = (eventName: string, handler: (...params: unknown[]) => void) => {
          if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
          }
          this.handlers[eventName].push(handler);
        };
        play = () => {
          this.handlers.progress!.forEach((handler) =>
            handler({
              activeId: this.score?.id,
              playedNotes: this.score?.content.endsWith("]6")
                ? [["C4", "E4", "G4", "B4"]]
                : [["C4"]],
            }),
          );
          setTimeout(() => {
            this.handlers.finished!.forEach((handler) => handler());
          }, 100);
        };
        setScore = (score: Score) => (this.score = score);
        pause = vi.fn();
        stop = vi.fn();
      },
    ),
  };
});

import { Player, Score } from "@music-ui/core";

describe("initPianoWithPlayer", () => {
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
    const player = new Player();

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

    expect(otherElement.querySelectorAll(".key-played").length).toBe(0);

    await wait();

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    expect(activeElement.querySelectorAll(".key-played").length).toBe(0);

    await user.click(playArpeggioButton);

    expect(playBlockButton.disabled).toBe(true);
    expect(playArpeggioButton.disabled).toBe(true);

    ["C4"].forEach((note) =>
      expect(
        activeElement
          .querySelector(`.note-with-octave-${note}`)
          ?.classList.contains("key-played"),
      ).toBe(true),
    );

    await wait();

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

    const player = new Player();

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
      const player = new Player();
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
      const player = new Player();
      initPianoWithPlayer({ selection, player });
    }, "controlsElement not found inside element with id: piano-1");
  });
});

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
