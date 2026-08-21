// @vitest-environment jsdom
import { describe, it, expect, test } from "vitest";
import {
  getAbcScore,
  getPianoScore,
  toAbcNotation,
  ensureSelection,
  extractElementOptions,
  joinVoices,
  extractIndentedInput,
  parseTimeSignature,
  tonePositionToNormalizedPosition,
  normalizedPositionToTonePosition,
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
        timeSignature: "4/4",
        unitNoteLength: "1/8",
        bpm: 120,
      },
      content: "T:\nC:\nK:C\nM:4/4\nL:1/8\nQ:120\nC E G",
      hash: "fed79ed7114e3682105a1f6865d2d4eb",
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

describe("joinVoices", () => {
  it("joins an array of voices to a comma separated string in reverse order", () => {
    expect(
      joinVoices([
        ["G3", "B3"],
        ["C3", "E3"],
      ]),
    ).toBe("C3 E3,G3 B3");
  });
});

describe("extractIndentedInput", () => {
  it("extracts and cleans the content embedded in the selected element", () => {
    const content = `
        T: My Song
        CDE
    `;
    expect(extractIndentedInput(content)).toBe("T: My Song\nCDE");
  });
});

describe("parseTimeSignature", () => {
  it("parses the passed time signature", () => {
    expect(parseTimeSignature()).toEqual([4, 4]);
    expect(parseTimeSignature("A/B")).toEqual([4, 4]);
    expect(parseTimeSignature("4/4")).toEqual([4, 4]);
    expect(parseTimeSignature("6/8")).toEqual([6, 8]);
    expect(parseTimeSignature("12/8")).toEqual([12, 8]);
  });
});

describe("tonePositionToNormalizedPosition", () => {
  it("returns the same position for simple time signatures", () => {
    [2, 3, 4].forEach((n) =>
      expect(tonePositionToNormalizedPosition("1:2:3", [n, 4])).toBe("1:2:3"),
    );
  });

  it("converts the position for compound time signatures", () => {
    expect(tonePositionToNormalizedPosition("1:0:0", [6, 8])).toBe("0:3:0");
    expect(tonePositionToNormalizedPosition("1:2:0", [6, 8])).toBe("0:5:0");
    expect(tonePositionToNormalizedPosition("1:2:1", [6, 8])).toBe("0:5:0.5");
    expect(tonePositionToNormalizedPosition("2:0:0", [6, 8])).toBe("1:0:0");

    expect(tonePositionToNormalizedPosition("3:0:0", [9, 8])).toBe("1:0:0");
    expect(tonePositionToNormalizedPosition("4:0:0", [12, 8])).toBe("1:0:0");
  });
});

describe("normalizedPositionToTonePosition", () => {
  it("returns the same position for simple time signatures", () => {
    [2, 3, 4].forEach((n) =>
      expect(normalizedPositionToTonePosition("1:2:3", [n, 4])).toBe("1:2:3"),
    );
  });

  it("converts the position for compound time signatures", () => {
    expect(normalizedPositionToTonePosition("0:3:0", [6, 8])).toBe("1:0:0");
    expect(normalizedPositionToTonePosition("0:5:0", [6, 8])).toBe("1:2:0");
    expect(normalizedPositionToTonePosition("0:5:0.5", [6, 8])).toBe("1:2:1");
    expect(normalizedPositionToTonePosition("1:0:0", [6, 8])).toBe("2:0:0");

    expect(normalizedPositionToTonePosition("1:0:0", [9, 8])).toBe("3:0:0");
    expect(normalizedPositionToTonePosition("1:0:0", [12, 8])).toBe("4:0:0");
  });
});
