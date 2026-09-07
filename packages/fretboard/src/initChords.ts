import {
  ElementOrSelector,
  ensureSelection,
  extractElementOptions,
} from "@music-ui/core";

import { Fretboard } from "./fretboard/Fretboard";

type InitChordsParams<T extends HTMLElement> = {
  selection?: ElementOrSelector<T>;
};

export const DEFAULT_OPTIONS = {
  selection: "[data-chord]",
} as const;

const DEFAULT_CHORD_OPTIONS = {
  input: "",
  chordName: "",
  showOpenStrings: false,
  barres: "",
  crop: true,
  showFretNumbers: false,
  showNoteNames: false,
} as const;

/**
 * Renders chord diagrams on the passed selection.
 * @param params The initialization params.
 */

export function initChords<T extends HTMLElement>(
  params: Partial<InitChordsParams<T>> = {},
) {
  const { selection } = { ...DEFAULT_OPTIONS, ...params };
  ensureSelection(selection).forEach((element) => {
    const options = extractElementOptions(element, DEFAULT_CHORD_OPTIONS);
    const fretboard = new Fretboard({ element, fretCount: 5, ...options });
    fretboard.renderChord({ ...options, barres: parseBarres(options.barres) });
    if (options.showNoteNames && options.chordName) {
      fretboard.style({ text: (x) => x.note! });
    }
  });
}

function parseBarres(input = "") {
  return input.split(",").map((barre) => {
    const tokens = barre.trim().split(":");
    return {
      fret: Number(tokens[0]),
      stringFrom: Number(tokens[0]),
      stringTo: Number(tokens[0]),
    };
  });
}
