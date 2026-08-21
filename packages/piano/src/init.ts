import {
  ensureSelection,
  extractElementOptions,
  type ElementOrSelector,
} from "@music-ui/core";
import { DEFAULT_PIANO_OPTIONS, Piano, type PianoOptions } from "./Piano";

export type InitPianoParams<T extends HTMLElement> = {
  selection?: ElementOrSelector<T>;
};

export const DEFAULT_OPTIONS = {
  selection: "[data-piano]",
} as const;

export function initPiano<T extends HTMLElement>(
  params: Partial<InitPianoParams<T>> = {},
) {
  const { selection } = { ...DEFAULT_OPTIONS, ...params };
  return ensureSelection(selection).map((element) => {
    const options = extractElementOptions(
      element,
      DEFAULT_PIANO_OPTIONS as Omit<PianoOptions, "element">,
    );
    const piano = new Piano({ ...options, element });
    piano.render();
    const { notes, noteLabels } = element.dataset;
    if (notes) {
      piano.setNotes(notes, noteLabels);
    }
    return piano;
  });
}
