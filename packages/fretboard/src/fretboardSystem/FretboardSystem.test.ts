import { test, expect, assert } from "vitest";

import { FretboardSystem } from "./FretboardSystem";
import { GUITAR_TUNINGS, DEFAULT_FRET_COUNT } from "../constants";

test("FretboardSystem - constructor with default options", () => {
  const system = new FretboardSystem();
  expect(system instanceof FretboardSystem).toBe(true);
  expect(system.getTuning()).toBe(GUITAR_TUNINGS.default);
  expect(system.getFretCount()).toBe(DEFAULT_FRET_COUNT);
});

test("FretboardSystem - constructor with custom options", () => {
  const customParams = {
    tuning: ["G2", "B2", "D3", "G3", "B3", "D4"],
    fretCount: 18,
  };
  const system = new FretboardSystem(customParams);
  expect(system instanceof FretboardSystem).toBe(true);
  expect(system.getTuning()).toBe(customParams.tuning);
  expect(system.getFretCount()).toBe(customParams.fretCount);
});

test("FretboardSystem - constructor with shorter fretCount", () => {
  const customParams = {
    fretCount: 5,
  };
  const system = new FretboardSystem(customParams);
  expect(system instanceof FretboardSystem).toBe(true);
  expect(system.getFretCount()).toBe(12);
});

test("FretboardSystem - getScale()", () => {
  const system = new FretboardSystem();
  const scale = system.getScale({
    type: "minor pentatonic",
    root: "E",
  });
  expect(scale).toMatchSnapshot();
});

test("FretboardSystem - getScale() - pickDegrees", () => {
  const system = new FretboardSystem();
  const scale = system.getScale({
    type: "major",
    root: "C",
    pickDegrees: [1, 3, 5],
  });
  expect(scale).toMatchSnapshot();
});

test("FretboardSystem - getScale() - scale not found", () => {
  const system = new FretboardSystem();
  assert.throws(() => {
    system.getScale({
      type: "augmented pentatronic",
      root: "H",
    });
  }, "Cannot find scale: H augmented pentatronic");
});

test("FretboardSystem - getScale() with system", () => {
  const system = new FretboardSystem();
  const scale = system.getScale({
    type: "minor pentatonic",
    root: "E",
    box: {
      system: "pentatonic",
      box: 1,
    },
  });
  expect(scale).toMatchSnapshot();
});

test("FretboardSystem - getScale() with system - upper octave", () => {
  const system = new FretboardSystem();
  const scale = system.getScale({
    type: "minor pentatonic",
    root: "E3",
    box: {
      system: "pentatonic",
      box: 1,
    },
  });
  expect(scale).toMatchSnapshot();
});

test("FretboardSystem - getScale() - B#", () => {
  const system = new FretboardSystem({ fretCount: 12 });
  const scale = system.getScale({ root: "B#", type: "major" });
  scale
    .map(({ note, octave }, index) =>
      note === "B#" ? { octave, index } : null,
    )
    .filter((x) => !!x)
    .forEach(({ octave, index }) => {
      const { octave: nextOctave, fret } = scale[index + 1]!;
      if (!nextOctave || fret === 0 || fret === 12) {
        return;
      }
      expect(octave).toBe((nextOctave as number) - 1);
    });
});

test("FretboardSystem - getScale() - Cb", () => {
  const system = new FretboardSystem({ fretCount: 12 });
  const scale = system.getScale({ root: "Cb", type: "major" });
  scale
    .map(({ note, octave }, index) =>
      note === "Cb" ? { octave, index } : null,
    )
    .filter((x) => !!x)
    .forEach(({ octave, index }) => {
      const { octave: prevOctave, fret } = scale[index - 1]!;
      if (!prevOctave || fret === 0 || fret === 12) {
        return;
      }
      expect(octave).toBe((prevOctave as number) + 1);
    });
});
