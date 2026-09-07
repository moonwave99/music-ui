// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { initChords } from "./initChords";

describe("initChords", () => {
  it("renders the chord diagrams on the passed selection", () => {
    document.body.innerHTML = `
        <main>
            <div data-chord data-input="x32010"></div>
        </main>`;

    initChords();

    const fretboard = document.querySelector("[data-chord] svg");
    expect(fretboard).not.toBeNull();

    expect(document.querySelector(".position-id-s5-f3")).not.toBeNull();
    expect(document.querySelector(".position-id-s4-f2")).not.toBeNull();
    expect(document.querySelector(".position-id-s2-f1")).not.toBeNull();

    expect(
      document.querySelectorAll(
        `.muted-strings .muted-string [data-string="6"]`,
      ),
    ).not.toBeNull();
  });

  it("renders the open strings positions if showOpenStrings is true", () => {
    document.body.innerHTML = `
        <main>
            <div data-chord data-input="x32010" data-show-open-strings></div>
        </main>`;

    initChords();

    const fretboard = document.querySelector("[data-chord] svg");
    expect(fretboard).not.toBeNull();

    expect(document.querySelector(".position-id-s5-f3")).not.toBeNull();
    expect(document.querySelector(".position-id-s4-f2")).not.toBeNull();
    expect(document.querySelector(".position-id-s3-f0")).not.toBeNull();
    expect(document.querySelector(".position-id-s2-f1")).not.toBeNull();
    expect(document.querySelector(".position-id-s1-f0")).not.toBeNull();

    expect(
      document.querySelectorAll(
        `.muted-strings .muted-string [data-string="6"]`,
      ),
    ).not.toBeNull();
  });

  it("shows the note names is showNoteNames is true", () => {
    document.body.innerHTML = `
        <main>
            <div data-chord
              data-input="x32010"
              data-chord-name="C major"
              data-show-note-names
              data-show-open-strings></div>
        </main>`;

    initChords();

    const fretboard = document.querySelector("[data-chord] svg");
    expect(fretboard).not.toBeNull();
    expect(document.querySelector(".position-id-s5-f3")?.textContent).toBe("C");
    expect(document.querySelector(".position-id-s4-f2")?.textContent).toBe("E");
    expect(document.querySelector(".position-id-s3-f0")?.textContent).toBe("G");
    expect(document.querySelector(".position-id-s2-f1")?.textContent).toBe("C");
    expect(document.querySelector(".position-id-s1-f0")?.textContent).toBe("E");
  });
});
