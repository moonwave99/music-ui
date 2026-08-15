import {
  ensureSelection,
  extractElementOptions,
  type ElementOrSelector,
} from "@music-ui/core";
import { DEFAULT_PIANO_OPTIONS, Piano, type PianoOptions } from "./Piano";

const DEFAULT_SELECTOR = "[data-piano]";

export function initPiano<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T> = DEFAULT_SELECTOR,
) {
  return ensureSelection(elementOrSelector).map((element) => {
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
