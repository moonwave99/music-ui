// @vitest-environment jsdom
import { describe, it, expect, test, assert, vi } from "vitest";
import {
  createControls,
  ensureSelection,
  ensureElements,
  extractElementOptions,
} from "./dom";

describe("createControls", () => {
  it("creates buttons with the given configuration", () => {
    document.body.innerHTML = `
      <div class="controls"></div>
    `;
    const parentElement = document.querySelector<HTMLElement>(".controls")!;

    const controls = createControls(parentElement, {
      play: vi.fn(),
      stop: vi.fn(),
    });

    const playButton = document.querySelector(".play-button");
    const stopButton = document.querySelector(".stop-button");

    expect(controls).toEqual({
      play: playButton,
      stop: stopButton,
    });
  });
});

describe("ensureSelection", () => {
  test.beforeEach(() => {
    document.body.innerHTML = `
      <div data-ensure>a</div>
      <div data-ensure></div>
      <div data-ensure></div>
    `;
  });

  test.afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the selected elements by string selector", () => {
    const selection = ensureSelection("[data-ensure]");
    expect(selection.length).toBe(3);
  });

  it("returns an array of the passed elements if a NodeList is passed", () => {
    const nodeList = document.querySelectorAll<HTMLElement>("[data-ensure]");
    const selection = ensureSelection(nodeList);
    expect(Array.isArray(selection)).toBe(true);
    expect(selection.length).toBe(3);
  });

  it("returns an array with the passed element if it is single", () => {
    const element = document.querySelector<HTMLElement>("[data-ensure]");
    const selection = ensureSelection(element!);
    expect(Array.isArray(selection)).toBe(true);
    expect(selection.length).toBe(1);
    expect(selection[0]?.textContent).toBe("a");
  });
});

describe("ensureElements", () => {
  it("returns a key-value list of elements", () => {
    document.body.innerHTML = `
      <div class="parent">
        <div class="piano"></div>
        <div class="controls"></div>
      </div>
    `;

    const parentElement = document.querySelector<HTMLElement>(".parent")!;

    const elements = ensureElements({
      id: "1",
      parentElement,
      elements: {
        pianoElement: ".piano",
        controlsElement: ".controls",
      },
    });

    expect(elements).toEqual({
      pianoElement: parentElement.querySelector(".piano"),
      controlsElement: parentElement.querySelector(".controls"),
    });
  });

  it("throws error if any element is not found", () => {
    document.body.innerHTML = `
      <div class="parent">
        <div class="controls"></div>
      </div>
    `;

    const parentElement = document.querySelector<HTMLElement>(".parent")!;

    assert.throws(() => {
      ensureElements({
        id: "1",
        parentElement,
        elements: {
          pianoElement: ".piano",
          controlsElement: ".controls",
        },
      });
    }, "pianoElement not found inside element with id: 1");
  });
});

describe("extractElementOptions", () => {
  test.afterEach(() => {
    document.body.innerHTML = "";
  });
  it("extracts the options from the element dataset", () => {
    document.body.innerHTML = `
      <div
        data-a="abc"
        data-b=""
        data-c="123"
        data-d
        data-e="false"
        data-f="true"
        data-g></div>
    `;
    const options = extractElementOptions(document.querySelector("div")!, {
      a: "",
      b: "",
      c: 0,
      d: 0,
      e: true,
      f: true,
      g: true,
      h: true,
    });
    expect(options).toEqual({ a: "abc", c: 123, e: false, f: true, g: true });
  });
});
