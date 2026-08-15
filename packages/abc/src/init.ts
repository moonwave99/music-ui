import {
  ensureSelection,
  extractElementOptions,
  type ElementOrSelector,
} from "@music-ui/core";
import {
  ABCScore,
  cssClasses,
  DEFAULT_ABC_SCORE_OPTIONS,
  type ABCScoreParams,
} from "./abcScore";

const DEFAULT_SELECTOR = "[data-abc-score]";

export function initABCScore<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T> = DEFAULT_SELECTOR,
  abcOptions?: ABCScoreParams["abcOptions"],
) {
  return ensureSelection(elementOrSelector).map((element) =>
    new ABCScore({
      content: element
        .querySelector(`.${cssClasses.content}`)
        ?.textContent.trim(),
      element: element.querySelector(`.${cssClasses.staff}`)!,
      abcOptions,
      ...extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS),
    }).render(),
  );
}
