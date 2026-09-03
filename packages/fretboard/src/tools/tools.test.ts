import { test, expect } from "vitest";
import { sliceBox, disablePositions, disableStrings } from "./tools";
import { Systems, getBox } from "../fretboardSystem/systems/systems";

const box = getBox({
  mode: "major",
  root: "C",
  box: "C",
  system: "CAGED",
});

test("disableStrings", () => {
  const output = disableStrings({
    box,
    strings: [1],
  });
  expect(
    output
      .filter(({ string }) => string === 1)
      .every(({ disabled }) => disabled),
  ).toBe(true);
});

test("sliceBox", () => {
  const slicedBox = sliceBox({
    box,
    from: { string: 6, fret: 1 },
    to: { string: 5, fret: 2 },
  });
  expect(slicedBox.length).toBe(3);
});

test("sliceBox with default arguments", () => {
  const slicedBox = sliceBox({ box });
  expect(slicedBox.length).toBe(box.length);
});

test("sliceBox with wrong lower bound", () => {
  const slicedBox = sliceBox({
    box,
    from: { string: 6, fret: 2 },
    to: { string: 5, fret: 2 },
  });
  expect(slicedBox.length).toBe(4);
});

test("sliceBox with wrong upper bound", () => {
  const slicedBox = sliceBox({
    box,
    from: { string: 6, fret: 0 },
    to: { string: 0, fret: 0 },
  });
  expect(slicedBox.length).toBe(box.length);
});

test("disablePositions", () => {
  const disabledBox = disablePositions({
    box,
    from: { string: 6, fret: 0 },
    to: { string: 6, fret: 2 },
  });
  expect(disabledBox.filter(({ disabled }) => disabled).length).toBe(2);
});

test("disablePositions with default arguments", () => {
  const disabledBox = disablePositions({ box });
  expect(disabledBox.filter(({ disabled }) => disabled).length).toBe(
    box.length,
  );
});

test("disablePositions just one string", () => {
  const disabledBox = disablePositions({
    box,
    from: { string: 4, fret: 0 },
    to: { string: 4, fret: 3 },
  });
  expect(disabledBox.filter(({ disabled }) => disabled).length).toBe(
    box.filter(({ string }) => string === 4).length,
  );
});
