import { describe, it, expect } from "vitest";
import {
  getAbcScore,
  getPlaybackScore,
  toAbcNotation,
  joinVoices,
  extractIndentedInput,
  parseTimeSignature,
  isTimeSignatureUnary,
  tonePositionToNormalizedPosition,
  normalizedPositionToTonePosition,
} from "./common";

describe("toAbcNotation", () => {
  it("converts the input from scientific to abc notation", () => {
    expect(toAbcNotation(["C3", "E3", "G3"])).toBe("C, E, G,");
    expect(toAbcNotation("C3 E3 G3")).toBe("C, E, G,");
  });
});

describe("getPlaybackScore", () => {
  it("returns the score for the given notes - block", () => {
    const input = "C3 E3 G3 B3";
    const score = getPlaybackScore({ id: "1", input, playbackMode: "block" });
    expect(score).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120, timeSignature: [4, 4] },
      instrument: "acoustic_grand_piano",
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });

    const scoreWithDefaultPlaybackMode = getPlaybackScore({ id: "1", input });
    expect(scoreWithDefaultPlaybackMode).toEqual({
      id: "1",
      hash: "45da33dd1f4ee3b97bd1706c80aaba32",
      info: { bpm: 120, timeSignature: [4, 4] },
      instrument: "acoustic_grand_piano",
      content: "%%printtempo 0\nQ:120\n[C, E, G, B,]6",
    });
  });

  it("returns the score for the given notes - arpeggio", () => {
    const input = "C3 E3 G3 B3";
    const score = getPlaybackScore({
      id: "1",
      input,
      playbackMode: "arpeggio",
    });
    expect(score).toEqual({
      id: "1",
      hash: "2df5ea19f579b803d9efd1f62db18d9b",
      info: { bpm: 120, timeSignature: [4, 4] },
      instrument: "acoustic_grand_piano",
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
        timeSignature: [4, 4],
        unitNoteLength: "1/8",
        bpm: 120,
      },
      instrument: "acoustic_grand_piano",
      content: "T:\nC:\nK:C\nM:4/4\nL:1/8\nQ:120\nC E G",
      hash: "fed79ed7114e3682105a1f6865d2d4eb",
    });
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

describe("isTimeSignatureUnary", () => {
  it("checks if the passed time signature is unary", () => {
    expect(isTimeSignatureUnary([1, 1])).toBe(true);
    expect(isTimeSignatureUnary([4, 4])).toBe(false);
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
