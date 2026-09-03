import { test, expect, assert } from "vitest";
import { tetrachord } from "./tetrachords";

test("tetrachord with default arguments", () => {
  const tetra = tetrachord();
  expect(tetra).toEqual([
    { string: 6, fret: 0, note: "E" },
    { string: 6, fret: 2, note: "F#" },
    { string: 6, fret: 4, note: "G#" },
    { string: 6, fret: 5, note: "A" },
  ]);
});

test("tetrachord - major linear", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "Linear",
    string: 6,
    fret: 0,
    root: "E",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 0, note: "E" },
    { string: 6, fret: 2, note: "F#" },
    { string: 6, fret: 4, note: "G#" },
    { string: 6, fret: 5, note: "A" },
  ]);
});

test("tetrachord - minor linear", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "Linear",
    string: 6,
    fret: 0,
    root: "E",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 0, note: "E" },
    { string: 6, fret: 2, note: "F#" },
    { string: 6, fret: 3, note: "G" },
    { string: 6, fret: 5, note: "A" },
  ]);
});

test("tetrachord - major ThreePlusOne", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "ThreePlusOne",
    string: 6,
    fret: 0,
    root: "E",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 0, note: "E" },
    { string: 6, fret: 2, note: "F#" },
    { string: 6, fret: 4, note: "G#" },
    { string: 5, fret: 0, note: "A" },
  ]);
});

test("tetrachord - minor ThreePlusOne", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "ThreePlusOne",
    string: 6,
    fret: 0,
    root: "E",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 0, note: "E" },
    { string: 6, fret: 2, note: "F#" },
    { string: 6, fret: 3, note: "G" },
    { string: 5, fret: 0, note: "A" },
  ]);
});

test("tetrachord - major TwoPlusTwo", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "TwoPlusTwo",
    string: 6,
    fret: 3,
    root: "G",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 3, note: "G" },
    { string: 6, fret: 5, note: "A" },
    { string: 5, fret: 2, note: "B" },
    { string: 5, fret: 3, note: "C" },
  ]);
});

test("tetrachord - minor TwoPlusTwo", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "TwoPlusTwo",
    string: 6,
    fret: 3,
    root: "G",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 3, note: "G" },
    { string: 6, fret: 5, note: "A" },
    { string: 5, fret: 1, note: "Bb" },
    { string: 5, fret: 3, note: "C" },
  ]);
});

test("tetrachord - major TwoPlusTwo - 3rd string", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "TwoPlusTwo",
    string: 3,
    fret: 3,
    root: "Bb",
  });
  expect(tetra).toEqual([
    { string: 3, fret: 3, note: "Bb" },
    { string: 3, fret: 5, note: "C" },
    { string: 2, fret: 3, note: "D" },
    { string: 2, fret: 4, note: "Eb" },
  ]);
});

test("tetrachord - minor TwoPlusTwo - 3rd string", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "TwoPlusTwo",
    string: 3,
    fret: 3,
    root: "Bb",
  });
  expect(tetra).toEqual([
    { string: 3, fret: 3, note: "Bb" },
    { string: 3, fret: 5, note: "C" },
    { string: 2, fret: 2, note: "Db" },
    { string: 2, fret: 4, note: "Eb" },
  ]);
});

test("tetrachord - major OnePlusThree", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "OnePlusThree",
    string: 6,
    fret: 5,
    root: "A",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 5, note: "A" },
    { string: 5, fret: 2, note: "B" },
    { string: 5, fret: 4, note: "C#" },
    { string: 5, fret: 5, note: "D" },
  ]);
});

test("tetrachord - minor OnePlusThree", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "OnePlusThree",
    string: 6,
    fret: 5,
    root: "A",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 5, note: "A" },
    { string: 5, fret: 2, note: "B" },
    { string: 5, fret: 3, note: "C" },
    { string: 5, fret: 5, note: "D" },
  ]);
});

test("tetrachord - major OnePlusThree - 3rd string", () => {
  const tetra = tetrachord({
    type: "Major",
    layout: "OnePlusThree",
    string: 3,
    fret: 5,
    root: "C",
  });
  expect(tetra).toEqual([
    { string: 3, fret: 5, note: "C" },
    { string: 2, fret: 3, note: "D" },
    { string: 2, fret: 5, note: "E" },
    { string: 2, fret: 6, note: "F" },
  ]);
});

test("tetrachord - minor OnePlusThree - 3rd string", () => {
  const tetra = tetrachord({
    type: "Minor",
    layout: "OnePlusThree",
    string: 3,
    fret: 5,
    root: "C",
  });
  expect(tetra).toEqual([
    { string: 3, fret: 5, note: "C" },
    { string: 2, fret: 3, note: "D" },
    { string: 2, fret: 4, note: "Eb" },
    { string: 2, fret: 6, note: "F" },
  ]);
});

test("tetrachord - lydian ThreePlusOne", () => {
  const tetra = tetrachord({
    type: "Lydian",
    layout: "ThreePlusOne",
    string: 6,
    fret: 5,
    root: "A",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 5, note: "A" },
    { string: 6, fret: 7, note: "B" },
    { string: 6, fret: 9, note: "C#" },
    { string: 5, fret: 6, note: "D#" },
  ]);
});

test("tetrachord - lydian TwoPlusTwo", () => {
  const tetra = tetrachord({
    type: "Lydian",
    layout: "TwoPlusTwo",
    string: 6,
    fret: 5,
    root: "A",
  });
  expect(tetra).toEqual([
    { string: 6, fret: 5, note: "A" },
    { string: 6, fret: 7, note: "B" },
    { string: 5, fret: 4, note: "C#" },
    { string: 5, fret: 6, note: "D#" },
  ]);
});

test("tetrachord - first string, multiple string layout", () => {
  assert.throws(() => {
    tetrachord({
      type: "Major",
      layout: "ThreePlusOne",
      string: 1,
      fret: 5,
      root: "A",
    });
  }, "Cannot split a tetrachord over two strings if starting on the first one");
});

test("tetrachord - fret out of bounds, multiple string layout", () => {
  assert.throws(() => {
    tetrachord({
      type: "Major",
      layout: "OnePlusThree",
      string: 3,
      fret: 0,
      root: "G",
    });
  }, "Cannot use this layout from this starting fret");
});
