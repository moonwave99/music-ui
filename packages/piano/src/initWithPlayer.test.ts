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
        private handlers = {} as Record<string, (...params: unknown[]) => void>;
        on = (eventName: string, handler: (...params: unknown[]) => void) => {
          this.handlers[eventName] = handler;
        };
        play = () => {
          this.handlers.progress!({
            activeId: "piano-1",
            playedNotes: [["C4"]],
          });
          setTimeout(() => {
            this.handlers.finished!();
          }, 100);
        };
        pause = vi.fn();
        stop = vi.fn();
        setScore = vi.fn();
      },
    ),
  };
});

import { Player } from "@music-ui/core";

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
        </main>`;

    const element = document.querySelector<HTMLElement>("[data-piano]")!;
    const player = new Player();

    initPianoWithPlayer({ selection: element, player });

    const playBlockButton =
      element.querySelector<HTMLButtonElement>(".playBlock-button")!;
    const playArpeggioButton = element.querySelector<HTMLButtonElement>(
      ".playArpeggio-button",
    )!;

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    await user.click(playBlockButton);

    expect(playBlockButton.disabled).toBe(true);
    expect(playArpeggioButton.disabled).toBe(true);

    expect(
      element
        .querySelector(".note-with-octave-C4")
        ?.classList.contains("key-played"),
    ).toBe(true);

    await wait(150);

    expect(playBlockButton.disabled).toBe(false);
    expect(playArpeggioButton.disabled).toBe(false);

    expect(element.querySelectorAll(".key-played").length).toBe(0);
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
    }, "pianoElement not found for piano with id: piano-1");
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
    }, "controlsElement not found for piano with id: piano-1");
  });
});

const wait = (ms = 100) => new Promise((r) => setTimeout(r, ms));
