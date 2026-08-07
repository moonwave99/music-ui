// @vitest-environment jsdom
import { test, describe, it, expect, assert } from "vitest";
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

  it("Ignores non existing notes", () => {
    const piano = new Piano();

    piano.render().setNotes(["C4", "E4", "C9"]);

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
    ]);
  });
});

describe("Piano - setNotes with labels", () => {
  it("Displays the passed notes with label information as string", () => {
    const piano = new Piano();

    const notes = [
      ["C3", "1"],
      ["E3", "3"],
      ["G3", "5"],
    ];

    piano
      .render()
      .setNotes(
        notes.map((x) => x[0]).join(" "),
        notes.map((x) => x[1]).join(" "),
      );

    const wrapper = document.querySelector("#piano");
    notes.forEach(([note, label]) => {
      expect(
        wrapper?.querySelector(`.note-with-octave-${note}`)?.innerHTML,
      ).toBe(label);
    });
  });

  it("Displays the passed notes with label information as array", () => {
    const piano = new Piano();

    const notes = [
      ["C3", "1"],
      ["E3", "3"],
      ["G3", "5"],
    ] as const;

    piano.render().setNotes(
      notes.map((x) => x[0]).join(" "),
      notes.map((x) => x[1]),
    );

    const wrapper = document.querySelector("#piano");
    notes.forEach(([note, label]) => {
      expect(
        wrapper?.querySelector(`.note-with-octave-${note}`)?.innerHTML,
      ).toBe(label);
    });
  });

  it("Throws error if notes and label mismatch", () => {
    assert.throws(() => {
      const piano = new Piano();
      piano.render().setNotes("C3 E3 G3", "1 3");
    }, "input and noteLabels length do not match");
  });
});

describe("Piano - setPlayedNotes", () => {
  it("Marks the passed notes as played", () => {
    const piano = new Piano();
    piano.render().setNotes(["C4", "E4", "G4"]).setPlayedNotes(["C4", "G4"]);

    const wrapper = document.querySelector("#piano");
    expect(wrapper?.querySelector(".note-with-octave-C4")?.classList).toContain(
      "key-played",
    );
    expect(
      wrapper?.querySelector(".note-with-octave-E4")?.classList,
    ).not.toContain("key-played");
    expect(wrapper?.querySelector(".note-with-octave-G4")?.classList).toContain(
      "key-played",
    );
  });
});

describe("Piano - clearNotes", () => {
  it("Removes all note indications", () => {
    const piano = new Piano();

    piano
      .render()
      .setNotes(["C4", "E4", "G4"])
      .setPlayedNotes(["C4"])
      .clearNotes();

    const wrapper = document.querySelector("#piano");
    expect(wrapper?.querySelectorAll(".key-on").length).toBe(0);
    expect(wrapper?.querySelectorAll(".key-played").length).toBe(0);
  });
});

describe("Piano - clearPlayedNotes", () => {
  it("Clears all played notes", () => {
    const piano = new Piano();
    piano.render().setNotes(["C4", "E4", "G4"]).setPlayedNotes(["C4"]);

    const wrapper = document.querySelector("#piano");
    expect(wrapper?.querySelector(".note-with-octave-C4")?.classList).toContain(
      "key-played",
    );
    piano.clearPlayedNotes();
    expect(
      wrapper?.querySelector(".note-with-octave-C4")?.classList,
    ).not.toContain("key-played");
  });
});

describe("Piano - destroy", () => {
  it("Removes the element from the dom", () => {
    const piano = new Piano();

    piano.render();

    piano.destroy();
    const wrapper = document.querySelector("#piano");
    expect(wrapper).toBeFalsy();
  });
});
