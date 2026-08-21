// @vitest-environment jsdom
import { describe, it, expect, vi, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { initABCScoreWithPlayer } from "./initWithPlayer";

//@ts-expect-error Hard to mock the whole thing without having vi.mock to complain
vi.mock(import("@music-ui/core"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Player: vi.fn(
      class {
        on = vi.fn();
        play = vi.fn();
        pause = vi.fn();
        stop = vi.fn();
        setScore = vi.fn();
      },
    ),
  };
});

import { Player } from "@music-ui/core";

describe("initABCScoreWithPlayer", () => {
  it("renders an abc score with player on selection", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
    const player = new Player();

    initABCScoreWithPlayer({
      selection: element,
      player,
    });

    expect(element.querySelectorAll(".controls button").length).toBe(3);

    const playButton =
      element.querySelector<HTMLButtonElement>(".play-button")!;
    const pauseButton =
      element.querySelector<HTMLButtonElement>(".pause-button")!;
    const stopButton =
      element.querySelector<HTMLButtonElement>(".stop-button")!;

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeTruthy();

    await user.click(playButton);

    expect(playButton.disabled).toBeTruthy();
    expect(pauseButton.disabled).toBeFalsy();
    expect(stopButton.disabled).toBeFalsy();

    await user.click(pauseButton);

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeFalsy();

    await user.click(playButton);
    await user.click(stopButton);

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeTruthy();
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initABCScoreWithPlayer({ player: null as unknown as Player });
    }, "You must pass a Player instance");
  });

  it("Throws error if no staff element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="controls"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player();
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "staffElement not found inside element with id: 1");
  });

  it("Throws error if no content element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player();
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "contentElement not found inside element with id: 1");
  });

  it("Throws error if no controls element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player();
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "controlsElement not found inside element with id: 1");
  });
});
