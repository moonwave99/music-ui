import { test, expect, assert } from "vitest";

import { getBox } from "./systems";
import { findPositionInArray } from "../FretboardSystem";

test("pentatonic system", () => {
  const positions = getBox({
    system: "pentatonic",
    root: "E",
    box: 1,
  });
  expect(findPositionInArray({ string: 6, fret: 3 }, positions)).toBeTruthy();
  expect(findPositionInArray({ string: 6, fret: 4 }, positions)).toBeFalsy();
});

test("pentatonic system - major pentatonic", () => {
  const positions = getBox({
    system: "pentatonic",
    root: "G",
    box: 1,
    mode: "major",
  });
  expect(findPositionInArray({ string: 6, fret: 3 }, positions)).toBeTruthy();
  expect(findPositionInArray({ string: 6, fret: 5 }, positions)).toBeTruthy();
});

test("CAGED system", () => {
  const positions = getBox({
    system: "CAGED",
    root: "C",
    box: "A",
  });
  expect(findPositionInArray({ string: 6, fret: 3 }, positions)).toBeTruthy();
  expect(findPositionInArray({ string: 2, fret: 1 }, positions)).toBeFalsy();
});

test("CAGED system - box not found", () => {
  assert.throws(
    () =>
      getBox({
        system: "CAGED",
        root: "E",
        box: "H",
      }),
    "Cannot find box H in the CAGED scale system",
  );
});

test("pentatonic system - box not found", () => {
  assert.throws(
    () =>
      getBox({
        system: "pentatonic",
        root: "E",
        box: 6,
      }),
    "Cannot find box 6 in the pentatonic scale system",
  );
});

test("three notes per string system - box not found", () => {
  assert.throws(
    () =>
      getBox({
        system: "TNPS",
        root: "E",
        box: 8,
      }),
    "Cannot find box 8 in the TNPS scale system",
  );
});
