import type { NoteInput } from "@music-ui/core";
import {
  DEFAULT_PIANO_OPTIONS,
  type ScaleNote,
  PianoOptions,
  GroupedInput,
} from "./Piano";

export const CHROMATIC_SCALE: ScaleNote[] = [
  {
    chroma: 0,
    color: "white",
    note: "C",
  },
  {
    chroma: 1,
    color: "black",
    note: "C#",
  },
  {
    chroma: 2,
    color: "white",
    note: "D",
  },
  {
    chroma: 3,
    color: "black",
    note: "D#",
  },
  {
    chroma: 4,
    color: "white",
    note: "E",
  },
  {
    chroma: 5,
    color: "white",
    note: "F",
  },
  {
    chroma: 6,
    color: "black",
    note: "F#",
  },
  {
    chroma: 7,
    color: "white",
    note: "G",
  },
  {
    chroma: 8,
    color: "black",
    note: "G#",
  },
  {
    chroma: 9,
    color: "white",
    note: "A",
  },
  {
    chroma: 10,
    color: "black",
    note: "A#",
  },
  {
    chroma: 11,
    color: "white",
    note: "B",
  },
] as const;

export function parseOptions(el: HTMLElement): PianoOptions {
  const options = {} as Record<string, string | number | boolean>;
  Object.entries(DEFAULT_PIANO_OPTIONS).forEach(([key, sample]) => {
    const value = el.dataset[key];
    switch (typeof sample) {
      case "number":
        if (value) {
          options[key] = +value;
        }
        break;
      case "boolean":
        if (value) {
          options[key] = value !== "false";
        }
        break;
    }
  });
  return options as PianoOptions;
}

export function parseNoteInput(
  input: NoteInput,
  noteLabels?: NoteInput,
): GroupedInput {
  const groups = Array.isArray(input)
    ? [input]
    : input
        .split(",")
        .filter(Boolean)
        .map((x) => x.split(" ").filter(Boolean));
  const output = groups.flatMap((group, index) =>
    group.map((note) => ({ note, group: index })),
  );
  if (!noteLabels) {
    return output;
  }
  const normalizedNoteLabels = normalizeInput(noteLabels);
  if (normalizedNoteLabels.length !== output.length) {
    throw new Error("input and noteLabels length do not match");
  }
  return output.map((note, index) => ({
    ...note,
    label: normalizedNoteLabels[index],
  }));
}

export function normalizeInput(input: NoteInput) {
  return Array.isArray(input)
    ? input
    : input.replaceAll(",", "").split(" ").filter(Boolean);
}
