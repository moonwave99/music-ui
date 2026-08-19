import {
  ensureSelection,
  extractElementOptions,
  extractIndentedInput,
  type ElementOrSelector,
} from "@music-ui/core";
import {
  ABCScore,
  cssClasses,
  DEFAULT_ABC_SCORE_OPTIONS,
  type ABCScoreParams,
} from "./abcScore";

export const DEFAULT_SELECTOR = "[data-abc-score]";

export function initABCScore<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T> = DEFAULT_SELECTOR,
  abcOptions?: ABCScoreParams["abcOptions"],
) {
  return ensureSelection(elementOrSelector).map((element) => {
    const contentElement = element.querySelector<HTMLElement>(
      `.${cssClasses.content}`,
    );
    new ABCScore({
      content: contentElement ? extractIndentedInput(contentElement) : "",
      element: element.querySelector(`.${cssClasses.staff}`)!,
      abcOptions,
      ...extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS),
    }).render();
  });
}
