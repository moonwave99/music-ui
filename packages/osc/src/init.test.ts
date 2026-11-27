// @vitest-environment jsdom
import { expect, assert, describe, it } from "vitest";
import { initOscillator } from "./init";
import { OscPlayer } from "./OscPlayer";
import { getOscPlayerDependencies } from "./test/mocks";

describe("initOscillator", () => {
  it("renders an oscillator on selection", async () => {
    document.body.innerHTML = `
      <main>
        <div data-oscillator></div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-oscillator]")!;

    initOscillator({
      selection: element,
      player: new OscPlayer(getOscPlayerDependencies()),
    });

    expect(element.querySelector(".value")?.textContent).toBe("440");
    expect(element.querySelector("button")?.textContent).toBe("Play");
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initOscillator({ player: null as unknown as OscPlayer });
    }, "You must pass an OscPlayer instance");
  });
});
