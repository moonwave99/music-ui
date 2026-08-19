// @vitest-environment jsdom
import { describe, it, expect, vi, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { initABCScore, initABCScoreWithPlayer } from "./init";

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

describe("initABCScore - single element", () => {
  it("renders an abc score on the selected element", () => {
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

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(element).toBeTruthy();

    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
    expect(element!.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("renders an empty score if no content if present", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(element).toBeTruthy();
    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
  });

  it("does not display the time signature if showTimeSignature is false", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-show-time-signature="false">
          <div class="content">
            M:4/4
            L:1
            CEG
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(
      window.getComputedStyle(
        element!.querySelector<HTMLElement>(".abcjs-time-signature")!,
      ).display,
    ).toBe("none");
  });

  it("does not display the time signature if it's x/1", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            M:1/1
            L:1
            CEG
          </div>
          <div class="staff"></div>
          <div class="audio-controls"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(
      window.getComputedStyle(
        element!.querySelector<HTMLElement>(".abcjs-time-signature")!,
      ).display,
    ).toBe("none");
  });
});

describe("initABCScore - multiple elements", () => {
  it("renders an abc score on all elements - by selector", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore();

    const elements = document.querySelectorAll("[data-abc-score]");
    expect(elements.length).toBe(2);
    elements.forEach((element, index) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        `Test Song ${index + 1}`,
      );
    });
  });

  it("renders an abc score on all elements - by NodeList", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore(document.querySelectorAll<HTMLElement>("[data-abc-score]"));

    const elements = document.querySelectorAll("[data-abc-score]");
    expect(elements.length).toBe(2);
    elements.forEach((element, index) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        `Test Song ${index + 1}`,
      );
    });
  });
});

describe("initABCScore - abcOptions", () => {
  it("renders an abc score on all elements with the passed abcOptions", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore("[data-abc-score]", { paddingleft: 30 });

    const elements = document.querySelectorAll("[data-abc-score]");

    elements.forEach((element) => {
      expect(
        element
          .querySelector(".abcjs-staff path")
          ?.getAttribute("d")
          ?.startsWith("M 30"),
      ).toBe(true);
    });
  });
});

describe("initABCScoreWithPlayer", () => {
  it("renders an abc score with player on all elements", async () => {
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
    }, "controlsElement not found for score with id: 0");
  });
});
