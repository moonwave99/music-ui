// @vitest-environment jsdom
import { test, describe, it, expect } from "vitest";
import { getCurrentNote, getNoteDuration } from "./lib";

test.afterEach(() => {
  document.body.innerHTML = "";
});

describe("getCurrentNote", () => {
  it("returns the position of the note inside the passed bar - 4/4", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-mm0 abcjs-n1 abcjs-d1"/>
      <g class="abcjs-mm1 abcjs-n1 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n2 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n3 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n4 abcjs-d0-25"/>
    </svg>`;

    const barNotes = document.querySelectorAll<SVGGElement>(".abcjs-mm1");
    const currentNote = getCurrentNote(barNotes, "1:2:0", [4, 4]);
    expect(currentNote?.classList.contains("abcjs-n3")).toBe(true);
  });

  it("returns null if the position exceeds the passed bar - 4/4", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-mm0 abcjs-n1 abcjs-d1"/>
      <g class="abcjs-mm1 abcjs-n1 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n2 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n3 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n4 abcjs-d0-25"/>
    </svg>`;

    const barNotes = document.querySelectorAll<SVGGElement>(".abcjs-mm1");
    const currentNote = getCurrentNote(barNotes, "1:5:0", [4, 4]);
    expect(currentNote).toBe(null);
  });

  it("returns the position of the note inside the passed bar - 6/8", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-mm0 abcjs-n1 abcjs-d0-25"/>
      <g class="abcjs-mm0 abcjs-n2 abcjs-d0-25"/>
      <g class="abcjs-mm0 abcjs-n3 abcjs-d0-25"/>
      <g class="abcjs-mm1 abcjs-n1 abcjs-d0-125"/>
      <g class="abcjs-mm1 abcjs-n2 abcjs-d0-125"/>
      <g class="abcjs-mm1 abcjs-n3 abcjs-d0-125"/>
      <g class="abcjs-mm1 abcjs-n4 abcjs-d0-125"/>
      <g class="abcjs-mm1 abcjs-n5 abcjs-d0-125"/>
      <g class="abcjs-mm1 abcjs-n6 abcjs-d0-125"/>
    </svg>`;

    expect(
      getCurrentNote(
        document.querySelectorAll<SVGGElement>(".abcjs-mm0"),
        "0:2:0",
        [6, 8],
      )?.classList.contains("abcjs-n2"),
    ).toBe(true);

    expect(
      getCurrentNote(
        document.querySelectorAll<SVGGElement>(".abcjs-mm1"),
        "1:1:0",
        [6, 8],
      )?.classList.contains("abcjs-n2"),
    ).toBe(true);
  });
});

describe("getNoteDuration", () => {
  it("returns the note duration", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-d0-031"/>
      <g class="abcjs-d0-063"/>
      <g class="abcjs-d0-125"/>
      <g class="abcjs-d0-25"/>
      <g class="abcjs-d0-5"/>
      <g class="abcjs-d1"/>
    </svg>`;

    const elements = document.querySelectorAll<SVGGElement>("g");
    const expectedValues = [32, 16, 8, 4, 2, 1].map((x) => 1 / x);
    expectedValues.forEach((value, index) =>
      expect(getNoteDuration(elements[index]!)).toBe(value),
    );
  });
});
