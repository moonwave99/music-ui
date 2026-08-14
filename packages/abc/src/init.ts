import { ensureSelection, type ElementOrSelector } from "@music-ui/core";
import {
  ABCScore,
  cssClasses,
  DEFAULT_ABC_SCORE_OPTIONS,
  type ABCScoreParams,
} from "./ABCScore";

const DEFAULT_SELECTOR = "[data-abc-score]";

export function initABCScore<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T> = DEFAULT_SELECTOR,
) {
  return ensureSelection(elementOrSelector).map((element) => {
    // #TODO: parse options from data attributes
    return new ABCScore({
      content: element
        .querySelector(`.${cssClasses.content}`)
        ?.textContent.trim(),
      element: element.querySelector(`.${cssClasses.staff}`)!,
      ...parseOptions(element),
    }).render();
  });
}

type ABCDisplayParams = Omit<
  ABCScoreParams,
  "content" | "element" | "onClick" | "abcOptions"
>;

function parseOptions(el: HTMLElement): ABCDisplayParams {
  const options = {} as Record<string, string | number | boolean>;
  Object.entries(DEFAULT_ABC_SCORE_OPTIONS).forEach(([key, sample]) => {
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
  return options as ABCDisplayParams;
}
