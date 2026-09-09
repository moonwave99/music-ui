import {
  ElementOrSelector,
  ensureSelection,
  extractElementOptions,
} from "@music-ui/core";

import { Fretboard, FretboardPosition } from "./fretboard/Fretboard";
import { getChordFretSpan, parseBarres } from "./chords/chords";
import { DEFAULT_DIMENSIONS } from "./constants";

export const DEFAULT_OPTIONS = {
  selection: "[data-chord]",
} as const;

export const DEFAULT_CHORD_OPTIONS = {
  input: "",
  chordName: "",
  includeOpenStrings: false,
  barres: "",
  crop: true,
  showFretNumbers: false,
  showNoteNames: false,
  width: DEFAULT_DIMENSIONS.chord,
} as const;

/**
 * The params expected by the `initChords` function.
 * @property selection The elements to be initialized.
 */
export type InitChordsParams<T extends HTMLElement> = {
  selection?: ElementOrSelector<T>;
};

/**
 * Renders chord diagrams on the passed selection.
 * @param params The initialization params.
 */
export function initChords<T extends HTMLElement>(
  params: Partial<InitChordsParams<T>> = {},
): InitChord[] {
  const { selection } = { ...DEFAULT_OPTIONS, ...params };
  return ensureSelection(selection).map(initChord);
}

/**
 * @property fretboard The `Fretboard` instance
 * @property options The options parsed from the element dataset
 * @property positions The rendered fretboard positions
 */
type InitChord = {
  fretboard: Fretboard;
  options: typeof DEFAULT_CHORD_OPTIONS;
  positions: FretboardPosition[];
};

/**
 * Renders a chord inside the passed element.
 * @param element The element where to render the chord
 * @returns { InitChord } The exposed properties
 */
export function initChord(element: HTMLElement): InitChord {
  const options = {
    ...DEFAULT_CHORD_OPTIONS,
    ...extractElementOptions(element, DEFAULT_CHORD_OPTIONS),
  };
  const fretboard = new Fretboard({
    element,
    fretCount: getChordFretSpan(options.input),
    ...options,
  }).renderChord({
    ...options,
    barres: parseBarres(options.barres),
  });
  if (options.showNoteNames && options.chordName) {
    fretboard.style({ text: ({ note }) => note! });
  }
  return {
    fretboard,
    options,
    positions: fretboard.getChordPositions(options),
  };
}
