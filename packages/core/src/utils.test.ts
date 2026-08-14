import { describe, it, expect, test } from "vitest";
import {
  getAbcScore,
  getPianoScore,
  toAbcNotation,
  ensureSelection,
} from "./utils";

describe("toAbcNotation", () => {
  it("converts the input from scientific to abc notation", () => {
    expect(toAbcNotation(["C3", "E3", "G3"])).toBe("C, E, G,");
    expect(toAbcNotation("C3 E3 G3")).toBe("C, E, G,");
  });
});

describe("getPianoScore", () => {
  it("returns the score for the given notes - block", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "block" });
    expect(score).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });

    const scoreWithDefaultPlaybackMode = getPianoScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });
  });

  it("returns the score for the given notes - arpeggio", () => {
    const input = "C3 E3 G3 B3";
    const score = getPianoScore({ id: "1", input, playbackMode: "arpeggio" });
    expect(score).toEqual({
      id: "1",
      hash: "2df5ea19f579b803d9efd1f62db18d9b",
      info: { bpm: 120 },
      content: "%%printtempo 0\nQ:120\nC, E, G, B,",
    });
  });
});

describe("getAbcScore", () => {
  it("returns the score for the given content", () => {
    const abcScore = getAbcScore({ id: "1", input: "C E G" });
    expect(abcScore).toEqual({
      id: "1",
      info: {
        title: "",
        composer: "",
        key: "C",
        meter: "4/4",
        unitNoteLength: "1/4",
        bpm: 120,
      },
      content: "T:\nC:\nK:C\nM:4/4\nL:1/4\nQ:120\nC E G",
      hash: "cf0770b9c505737f4a593df9c813ea5d",
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
