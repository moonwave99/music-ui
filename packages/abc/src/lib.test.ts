// @vitest-environment jsdom
import { test, describe, it, expect } from "vitest";
import { getCurrentNote, getNoteDuration } from "./lib";

test.afterEach(() => {
  document.body.innerHTML = "";
});

describe("getCurrentNote", () => {
  it("returns the position of the note inside the passed bar", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-mm0 abcjs-n1 abcjs-d1"/>
      <g class="abcjs-mm1 abcjs-n1 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n2 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n3 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n4 abcjs-d0.25"/>
    </svg>`;

    const barNotes = document.querySelectorAll<SVGGElement>(".abcjs-mm1");
    const currentNote = getCurrentNote(barNotes, "1:2:0");
    expect(currentNote?.classList.contains("abcjs-n3")).toBe(true);
  });

  it("returns null if the position exceeds the passed bar", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-mm0 abcjs-n1 abcjs-d1"/>
      <g class="abcjs-mm1 abcjs-n1 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n2 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n3 abcjs-d0.25"/>
      <g class="abcjs-mm1 abcjs-n4 abcjs-d0.25"/>
    </svg>`;

    const barNotes = document.querySelectorAll<SVGGElement>(".abcjs-mm1");
    const currentNote = getCurrentNote(barNotes, "1:5:0");
    expect(currentNote).toBe(null);
  });
});

describe("getNoteDuration", () => {
  it("returns the note duration", () => {
    document.body.innerHTML = `<svg>
      <g class="abcjs-d0.25"/>
      <g class="abcjs-d0.5"/>
      <g class="abcjs-d1"/>
    </svg>`;

    const elements = document.querySelectorAll<SVGGElement>("g");
    expect(getNoteDuration(elements[0]!)).toBe(0.25);
    expect(getNoteDuration(elements[1]!)).toBe(0.5);
    expect(getNoteDuration(elements[2]!)).toBe(1);
  });
});
