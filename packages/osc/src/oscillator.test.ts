// @vitest-environment jsdom
import { vi, test, describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/dom";
import { Oscillator } from "./oscillator";
import { OscPlayer } from "./OscPlayer";
import { getOscPlayerDependencies } from "./test/mocks";

test.beforeEach(() => {
  document.body.innerHTML = `
    <div class="oscillator"></div>  
  `;
});

test.afterEach(() => {
  document.body.innerHTML = "";
});

describe("Oscillator - constructor", () => {
  it("Does not render until render() is called", () => {
    new Oscillator({
      id: "osc-1",
      element: document.querySelector(".oscillator")!,
      player: new OscPlayer(getOscPlayerDependencies()),
    });
    expect(document.querySelector(".value")).toBeNull();
  });
  it("Throws error if selected element is not found", () => {
    assert.throws(() => {
      new Oscillator({
        id: "osc-1",
        element: document.querySelector<HTMLElement>("#does-not-exist")!,
        player: new OscPlayer(getOscPlayerDependencies()),
      });
    }, "Element not found");
  });
});

describe("Oscillator - render", () => {
  it("Renders with default options", () => {
    const oscillator = new Oscillator({
      id: "osc-1",
      element: document.querySelector(".oscillator")!,
      player: new OscPlayer(getOscPlayerDependencies()),
      frequency: 220,
    });
    oscillator.render();
    expect(document.querySelector(".value")?.textContent).toBe("220");
  });

  it("Renders with passed options", () => {
    const oscillator = new Oscillator({
      id: "osc-1",
      element: document.querySelector(".oscillator")!,
      player: new OscPlayer(getOscPlayerDependencies()),
      frequency: 660,
      label: "E5",
      playbackLabel: "Play!",
    });
    oscillator.render();
    expect(document.querySelector(".value")?.textContent).toBe("660 - E5");
    expect(document.querySelector(".controls button")?.textContent).toBe(
      "Play!",
    );
  });
});

describe("Oscillator - setFrequency", () => {
  it("sets the oscillator frequency", () => {
    const oscillator = new Oscillator({
      id: "osc-1",
      element: document.querySelector(".oscillator")!,
      player: new OscPlayer(getOscPlayerDependencies()),
    });
    expect(oscillator.getFrequency()).toBe(440);
    expect(oscillator.setFrequency(660));
    expect(oscillator.getFrequency()).toBe(660);
  });

  it("clamps the values between the hearing bounds", () => {
    const oscillator = new Oscillator({
      id: "osc-1",
      element: document.querySelector(".oscillator")!,
      player: new OscPlayer(getOscPlayerDependencies()),
    });
    expect(oscillator.getFrequency()).toBe(440);
    expect(oscillator.setFrequency(0));
    expect(oscillator.getFrequency()).toBe(20);
    expect(oscillator.setFrequency(30000));
    expect(oscillator.getFrequency()).toBe(20000);
  });
});

describe("Oscillator - play", () => {
  it("it updates the UI", async () => {
    const user = userEvent.setup();
    const player = new OscPlayer(getOscPlayerDependencies());
    const element = document.querySelector<HTMLElement>(".oscillator")!;
    const oscillator = new Oscillator({
      id: "osc-1",
      element,
      player,
    });
    oscillator.render();
    const playbackButton = screen.getByText<HTMLButtonElement>("Play");
    await user.click(playbackButton);
    expect(playbackButton.disabled).toBe(true);

    await vi.waitFor(
      () => {
        return expect(playbackButton.disabled).toBe(false);
      },
      { timeout: 5000 },
    );
  });
});
