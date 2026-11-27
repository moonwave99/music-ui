// @vitest-environment jsdom
import { expect, assert, describe, it, beforeAll, vi } from "vitest";
import { initOscillatorWithOscilloscope } from "./initWithOscilloscope";
import { OscPlayer } from "./OscPlayer";
import { getOscPlayerDependencies } from "./test/mocks";

beforeAll(() => {
  const ResizeObserverMock = vi.fn(
    class {
      disconnect = vi.fn();
      observe = vi.fn();
    },
  );
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("initOscillatorWithOscilloscope", () => {
  it("renders an oscillator on selection", async () => {
    document.body.innerHTML = `
      <main>
        <div data-oscillator>
          <div class="oscillators">
            <div class="oscillator" data-frequency="220"></div>
            <div class="oscillator" data-frequency="330"></div>
          </div>
          <div class="oscilloscope"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-oscillator]")!;

    initOscillatorWithOscilloscope({
      selection: element,
      player: new OscPlayer(getOscPlayerDependencies()),
    });

    element.querySelectorAll<HTMLElement>(".oscillator").forEach((osc) => {
      expect(osc.querySelector(".value")?.textContent).toBe(
        osc.dataset.frequency,
      );
      expect(osc.querySelector("button")?.textContent).toBe("Play");
    });
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initOscillatorWithOscilloscope({
        player: null as unknown as OscPlayer,
      });
    }, "You must pass an OscPlayer instance");
  });
});
