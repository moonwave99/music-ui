import { Piano, DEFAULT_PIANO_OPTIONS, type PianoOptions } from "./Piano";

const DEFAULT_INIT_OPTIONS = {
  elements: "[data-piano]",
};

type InitOptions = {
  elements: string | NodeList;
};

export function init(options: InitOptions = DEFAULT_INIT_OPTIONS): void {
  options = Object.assign({}, DEFAULT_INIT_OPTIONS, options);
  const elements =
    typeof options.elements === "string"
      ? document.querySelectorAll(options.elements)
      : options.elements;

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const options = parseOptions(element);
    const piano = new Piano({ ...options, el });
    piano.render();
    const { notes } = element.dataset;
    if (!notes) {
      return;
    }
    piano.setNotes(notes);
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
        if (value) {
          options[key] = value !== "false";
        }
        break;
    }
  });

  return options as PianoOptions;
}
