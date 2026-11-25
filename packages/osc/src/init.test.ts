// @vitest-environment jsdom
import { assert, describe, it, vi } from "vitest";
import { initOscillator } from "./init";
import { OscPlayer } from "./OscPlayer";

const mockedContext = {
  createOscillator: () => ({
    connect: () => vi.fn(),
  }),
  createGain: () => ({
    connect: () => vi.fn(),
  }),
} as unknown as AudioContext;

describe("initOscillator", () => {
  it("renders an oscillator on selection", async () => {
    document.body.innerHTML = `
      <main>
        <div data-oscillator></div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-oscillator]")!;

    initOscillator({
      selection: element,
      player: new OscPlayer({ context: mockedContext }),
    });
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initOscillator({ player: null as unknown as OscPlayer });
    }, "You must pass an OscPlayer instance");
  });
});
