// @vitest-environment jsdom
import { test, describe, it, expect } from "vitest";
import { Piano } from "./Piano";

test.beforeEach(() => {
  document.body.innerHTML = '<div id="piano"></div>';
});

test.afterEach(() => {
  document.body.innerHTML = "";
});

describe("Piano - constructor", () => {
  it("Renders with default options", () => {
    const piano = new Piano();
    piano.render();
    const wrapper = document.querySelector("#piano");
    expect(wrapper).toBeTruthy();
    expect(wrapper!.querySelectorAll(".key.color-white").length).toBe(
      7 + 7 + 1,
    );
    expect(wrapper!.querySelectorAll(".key.color-black").length).toBe(5 + 5);
  });

  it("Renders with options", () => {
    const piano = new Piano({
      octaves: 3,
      withFinalC: false,
    });
    piano.render();

    const wrapper = document.querySelector("#piano");

    expect(wrapper).toBeTruthy();
    expect(wrapper!.querySelectorAll(".key.color-white").length).toBe(
      7 + 7 + 7,
    );
    expect(wrapper!.querySelectorAll(".key.color-black").length).toBe(
      5 + 5 + 5,
    );
  });
});

describe("Piano - setNotes", () => {
  it("Displays the passed notes", () => {
    const piano = new Piano();

    piano.render().setNotes(["C4", "E4", "G4"]);

    const wrapper = document.querySelector("#piano");
    expect(
      [...wrapper!.querySelectorAll(".key-on")].map((el) => ({
        ...(el as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "0",
        color: "white",
        midi: "60",
        note: "C",
        noteWithOctave: "C4",
        octave: "4",
      },
      {
        chroma: "4",
        color: "white",
        midi: "64",
        note: "E",
        noteWithOctave: "E4",
        octave: "4",
      },
      {
        chroma: "7",
        color: "white",
        midi: "67",
        note: "G",
        noteWithOctave: "G4",
        octave: "4",
      },
    ]);
  });

  it("Displays the enharmonic equivalents of the passed notes", () => {
    const piano = new Piano();

    piano.render().setNotes(["Fb", "Gb", "Abb", "Cb"]);

    const wrapper = document.querySelector("#piano");
    expect(
      [...wrapper!.querySelectorAll(".key-on")].map((el) => ({
        ...(el as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "4",
        color: "white",
        midi: "64",
        note: "E",
        noteWithOctave: "E4",
        octave: "4",
      },
      {
        chroma: "6",
        color: "black",
        midi: "66",
        note: "F#",
        noteWithOctave: "F#4",
        octave: "4",
      },
      {
        chroma: "7",
        color: "white",
        midi: "67",
        note: "G",
        noteWithOctave: "G4",
        octave: "4",
      },
      {
        chroma: "11",
        color: "white",
        midi: "71",
        note: "B",
        noteWithOctave: "B4",
        octave: "4",
      },
    ]);
  });

  it("Displays the passed notes on a default octave if no octave is passed", () => {
    const piano = new Piano();

    piano.render().setNotes(["C", "E", "G"]);

    const wrapper = document.querySelector("#piano");
    expect(
      [...wrapper!.querySelectorAll(".key-on")].map((el) => ({
        ...(el as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "0",
        color: "white",
        midi: "60",
        note: "C",
        noteWithOctave: "C4",
        octave: "4",
      },
      {
        chroma: "4",
        color: "white",
        midi: "64",
        note: "E",
        noteWithOctave: "E4",
        octave: "4",
      },
      {
        chroma: "7",
        color: "white",
        midi: "67",
        note: "G",
        noteWithOctave: "G4",
        octave: "4",
      },
    ]);
  });

  it("Displays the passed notes on separate hands", () => {
    const piano = new Piano();

    piano.render().setNotes("Eb4 Bb4, C3 G3");

    const wrapper = document.querySelector("#piano");

    ["group-1", "group-2"].forEach((hand) =>
      expect(wrapper?.querySelectorAll(`.${hand}`).length).toBe(2),
    );

    expect(
      [...wrapper!.querySelectorAll(".group-2")].map((el) => ({
        ...(el as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "0",
        color: "white",
        midi: "48",
        note: "C",
        noteWithOctave: "C3",
        octave: "3",
      },
      {
        chroma: "7",
        color: "white",
        midi: "55",
        note: "G",
        noteWithOctave: "G3",
        octave: "3",
      },
    ]);

    expect(
      [...wrapper!.querySelectorAll(".group-1")].map((el) => ({
        ...(el as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "3",
        color: "black",
        midi: "63",
        note: "D#",
        noteWithOctave: "D#4",
        octave: "4",
      },
      {
        chroma: "10",
        color: "black",
        midi: "70",
        note: "A#",
        noteWithOctave: "A#4",
        octave: "4",
      },
    ]);
  });
});

describe("Piano - setActiveNotes", () => {
  it("Marks the passed notes as active", () => {
    const piano = new Piano();
    piano.render().setNotes(["C4", "E4", "G4"]).setActiveNotes(["C4", "G4"]);

    const wrapper = document.querySelector("#piano");
    expect(wrapper?.querySelector(".note-with-octave-C4")?.classList).toContain(
      "active",
    );
    expect(
      wrapper?.querySelector(".note-with-octave-E4")?.classList,
    ).not.toContain("active");
    expect(wrapper?.querySelector(".note-with-octave-G4")?.classList).toContain(
      "active",
    );
  });
});

describe("Piano - clearActiveNotes", () => {
  it("Clears all active notes", () => {
    const piano = new Piano();
    piano.render().setNotes(["C4", "E4", "G4"]).setActiveNotes(["C4"]);

    const wrapper = document.querySelector("#piano");
    expect(wrapper?.querySelector(".note-with-octave-C4")?.classList).toContain(
      "active",
    );
    piano.clearActiveNotes();
    expect(
      wrapper?.querySelector(".note-with-octave-C4")?.classList,
    ).not.toContain("active");
  });
});
