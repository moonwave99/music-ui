import { ensureSelection, type ElementOrSelector } from "@music-ui/core";
import { DEFAULT_PIANO_OPTIONS, Piano, type PianoOptions } from "./Piano";

const DEFAULT_SELECTOR = "[data-piano]";

export function initPiano<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T> = DEFAULT_SELECTOR,
) {
  return ensureSelection(elementOrSelector).map((element) => {
    const options = parseOptions(element);
    const piano = new Piano({ ...options, element });
    piano.render();
    const { notes, noteLabels } = element.dataset;
    if (notes) {
      piano.setNotes(notes, noteLabels);
    }
    return piano;
  });
}

function parseOptions(el: HTMLElement): PianoOptions {
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
        if (typeof value !== "undefined") {
          options[key] = value !== "false";
        }
        break;
    }
  });
  return options as PianoOptions;
}
