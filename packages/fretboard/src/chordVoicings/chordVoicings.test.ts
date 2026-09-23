import { test, expect } from "vitest";

import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import {
  getChordVoicing,
  getVoicingTypeStrings,
  type GetChordVoicingParams,
} from "./chordVoicings";

const system = new FretboardSystem();

test("getVoicingTypeStrings", () => {
  expect(getVoicingTypeStrings("drop2")).toEqual([4, 5, 6]);
  expect(getVoicingTypeStrings("drop3")).toEqual([5, 6]);
});

test("getChordVoicing", () => {
  expect(
    getChordVoicing({
      type: "drop100" as GetChordVoicingParams["type"],
      root: "C",
      quality: "maj7",
      system,
      string: 6,
    }),
  ).toBeNull();

  expect(
    getChordVoicing({
      type: "drop3",
      root: "C",
      quality: "maj100" as GetChordVoicingParams["quality"],
      system,
      string: 6,
    }),
  ).toBeNull();

  expect(
    getChordVoicing({
      type: "drop3",
      root: "C",
      quality: "maj7",
      system,
      string: 100 as GetChordVoicingParams["string"],
    }),
  ).toBeNull();

  expect(
    getChordVoicing({
      type: "drop3",
      root: "C",
      quality: "maj7",
      system,
      string: 6,
      inversion: 5 as GetChordVoicingParams["inversion"],
    }),
  ).toBeNull();

  expect(
    getChordVoicing({
      type: "drop3",
      root: "C",
      quality: "maj7",
      system,
      string: 6,
    }),
  ).toMatchSnapshot();

  expect(
    getChordVoicing({
      type: "drop3",
      root: "F",
      quality: "maj7",
      inversion: 1,
      system,
      string: 6,
    }),
  ).toMatchSnapshot();

  expect(
    getChordVoicing({
      type: "drop2",
      root: "G",
      quality: "maj7",
      inversion: 2,
      system,
      string: 6,
    }),
  ).toMatchSnapshot();
});
