// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { initPiano } from "./init";

describe("initPiano", () => {
  it("initializes a Piano instance with default options", () => {
    document.body.innerHTML = `
        <main>
            <div data-piano data-notes="C3 E3 G3" data-note-labels="1 3 5"></div>
        </main>`;

    initPiano();

    const piano = document.querySelector(".piano");
    expect(piano!.querySelectorAll(".key").length).toBe(12 + 12 + 1);
    expect(
      [...piano!.querySelectorAll(".key-on")].map((el) => el.innerHTML),
    ).toEqual(["1", "3", "5"]);
  });

  it("initializes a Piano instance with passed options", () => {
    document.body.innerHTML = `
        <main>
            <div id="my-element" data-notes="C3 E3 G3" data-note-labels="1 3 5"></div>
        </main>`;

    initPiano({ selection: "#my-element" });

    const piano = document.querySelector(".piano");
    expect(piano!.querySelectorAll(".key").length).toBe(12 + 12 + 1);
    expect(
      [...piano!.querySelectorAll(".key-on")].map((el) => el.innerHTML),
    ).toEqual(["1", "3", "5"]);
  });

  it("initializes Piano instances on all affected elements", () => {
    document.body.innerHTML = `
        <main>
            <div data-piano></div>
            <div data-piano
                data-octaves="1"
                data-with-final-c="false"></div>
        </main>`;

    initPiano();

    const pianos = document.querySelectorAll(".piano");

    expect(pianos.length).toBe(2);
    expect(pianos[1]!.querySelectorAll(".key").length).toBe(12);
    expect(
      pianos[1]!.querySelector<HTMLElement>(".key:last-child")!.dataset.note,
    ).toBe("B");
  });

  it("initializes Piano instances on user selection", () => {
    document.body.innerHTML = `
        <main>
            <div data-custom></div>
            <div data-custom
                data-octaves="1"
                data-with-final-c="false"></div>
        </main>`;

    const selection = document.querySelectorAll<HTMLElement>("[data-custom]");

    initPiano({ selection });
    const pianos = document.querySelectorAll(".piano");
    expect(pianos.length).toBe(2);
  });

  it("initializes Piano instances with passed notes", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes="Fb Gb Abb Cb" data-octaves="3"></div>
        </main>`;

    initPiano();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll<HTMLElement>(".key-on")].map((el) => ({
        ...el.dataset,
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

  it("initializes Piano instances with passed notes and labels", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes="C3 E3 G3" data-note-labels="1 3 5" data-octaves="3"></div>
        </main>`;

    initPiano();
    const wrapper = document.querySelector(".piano");
    expect(
      [...wrapper!.querySelectorAll(".key-on")].map((el) => el.innerHTML),
    ).toEqual(["1", "3", "5"]);
  });

  it("initializes Piano instances with the enharmonic equivalents of the passed notes", () => {
    document.body.innerHTML = `
        <main>
          <div data-piano data-notes="C3 G3 Eb4 Bb4" data-octaves="3"></div>
        </main>`;

    initPiano();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll<HTMLElement>(".key-on")].map((el) => ({
        ...el.dataset,
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
          <div data-piano data-notes="C3 G3, Eb4 Bb4" data-octaves="3"></div>
        </main>`;

    initPiano();

    const wrapper = document.querySelector(".piano");

    expect(
      [...wrapper!.querySelectorAll<HTMLElement>(".group-1")].map((el) => ({
        ...el.dataset,
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

    expect(
      [...wrapper!.querySelectorAll<HTMLElement>(".group-2")].map((el) => ({
        ...el.dataset,
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
