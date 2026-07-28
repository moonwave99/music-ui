import { test, describe, it, expect } from "vitest";
import init from "./init";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import browserEnv from "browser-env";

test.beforeEach(() => {
  browserEnv();
});

test.afterEach(() => {
  browserEnv();
  document.body.innerHTML = "";
});

describe("init", () => {
  it("initializes Piano instances on all affected elements", () => {
    document.body.innerHTML = `
        <main>
            <div data-piano></div>
            <div data-piano
                data-octaves="1"
                data-with-final-C="false"></div>
        </main>`;

    init();

    const pianos = document.querySelectorAll(".piano");

    expect(pianos.length).toBe(2);
    expect(pianos[1]!.querySelectorAll(".key").length).toBe(12);
    expect(
      pianos[1]!.querySelector<HTMLElement>(".key:last-child")!.dataset.note,
    ).toBe("B");
  });

  it("initializes Piano instances with passed notes", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes="Fb Gb Abb Cb" data-octaves="3"></div>
        </main>`;

    init();

    const wrapper = document.querySelector(".piano");

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

  it("initializes Piano instances with the enharmonic equivalents of the passed notes", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes="C3 G3 Eb4 Bb4" data-octaves="3"></div>
        </main>`;

    init();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll(".key-on")].map((el) => ({
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

  it("initializes Piano instances with the separate hands information", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes-hands="C3 G3, Eb4 Bb4" data-octaves="3"></div>
        </main>`;

    init();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll(".left")].map((el) => ({
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
      [...wrapper!.querySelectorAll(".right")].map((el) => ({
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

  it("initializes Piano instances with SATB information", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes-satb="C3, G3, Eb4, Bb4" data-octaves="3"></div>
        </main>`;

    init();

    const wrapper = document.querySelector(".piano");

    expect(
      ["soprano", "alto", "tenor", "bass"].map((x) => ({
        ...(wrapper!.querySelector(`.${x}`) as HTMLElement).dataset,
      })),
    ).toEqual([
      {
        chroma: "10",
        color: "black",
        midi: "70",
        note: "A#",
        noteWithOctave: "A#4",
        octave: "4",
      },
      {
        chroma: "3",
        color: "black",
        midi: "63",
        note: "D#",
        noteWithOctave: "D#4",
        octave: "4",
      },
      {
        chroma: "7",
        color: "white",
        midi: "55",
        note: "G",
        noteWithOctave: "G3",
        octave: "3",
      },
      {
        chroma: "0",
        color: "white",
        midi: "48",
        note: "C",
        noteWithOctave: "C3",
        octave: "3",
      },
    ]);
  });

  it("initializes Piano instances with custom note", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes-custom="C3 G3"></div>
        </main>`;

    init();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll(".custom")].map((el) => ({
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
  });
});
