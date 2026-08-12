import { Piano } from "./Piano";
import { querySelector, querySelectorAll } from "@music-ui/core";
import { parseOptions } from "./lib";

const DEFAULT_INIT_OPTIONS = {
  element: "#piano",
};

type InitOptions<T extends HTMLElement> = {
  element: string | T;
};

export function init<T extends HTMLElement>(
  initOptions: InitOptions<T> = DEFAULT_INIT_OPTIONS,
) {
  initOptions = Object.assign({}, DEFAULT_INIT_OPTIONS, initOptions);
  const element = querySelector(initOptions.element);
  if (!element) {
    throw new Error(`${initOptions.element} not found)`);
  }
  const options = parseOptions(element);
  const piano = new Piano({ ...options, element });
  piano.render();

  const { notes, noteLabels } = element.dataset;
  if (notes) {
    piano.setNotes(notes, noteLabels);
  }
  return piano;
}

const DEFAULT_INIT_ALL_OPTIONS = {
  elements: "[data-piano]",
};

type InitAllOptions<T extends HTMLElement> = {
  elements: string | NodeListOf<T>;
};

export function initAll<T extends HTMLElement>(
  initOptions: InitAllOptions<T> = DEFAULT_INIT_ALL_OPTIONS,
): Piano[] {
  initOptions = Object.assign({}, DEFAULT_INIT_ALL_OPTIONS, initOptions);
  return Array.from(querySelectorAll(initOptions.elements)).map((element) =>
    init({ element }),
  );
}
