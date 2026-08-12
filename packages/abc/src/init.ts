import { querySelector, querySelectorAll } from "@music-ui/core";
import { ABCScore, cssClasses, type ABCScoreParams } from "./abcScore";

const DEFAULT_INIT_OPTIONS = {
  element: "[data-abc]",
} as const;

type InitOptions = Omit<ABCScoreParams, "element"> & {
  element?: string | HTMLElement;
};

export function init(initOptions: InitOptions = DEFAULT_INIT_OPTIONS) {
  initOptions = Object.assign({}, DEFAULT_INIT_OPTIONS, initOptions);
  const element = querySelector(initOptions.element!);
  if (!element) {
    throw new Error(`${initOptions.element} not found)`);
  }
  return new ABCScore({
    content: element
      .querySelector(`.${cssClasses.content}`)
      ?.textContent.trim(),
    ...initOptions,
    element: element.querySelector(`.${cssClasses.staff}`)!,
  }).render();
}

const DEFAULT_INIT_ALL_OPTIONS = {
  elements: "[data-abc]",
} as const;

type InitAllOptions<T extends HTMLElement> = {
  elements: string | NodeListOf<T>;
};

export function initAll<T extends HTMLElement>(
  initOptions: InitAllOptions<T> = DEFAULT_INIT_ALL_OPTIONS,
) {
  return Array.from(querySelectorAll<HTMLElement>(initOptions.elements)).map(
    (element) => init({ element }),
  );
}
