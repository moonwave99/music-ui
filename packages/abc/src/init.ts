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

/**
 * The params expected by the `initABCScore` function.
 * @property selection The elements to be initialized.
 * @property abcOptions The options that will be passed to the abc.js renderer.
 */
export type InitABCScoreParams<T extends HTMLElement> = {
  selection: ElementOrSelector<T>;
  abcOptions?: ABCScoreParams["abcOptions"];
};

export const DEFAULT_OPTIONS = {
  selection: "[data-abc-score]",
} as const;

/**
 * Initializes scores on the passed selection.
 * @param params The initialization params.
 */
export function initABCScore<T extends HTMLElement>(
  params: Partial<InitABCScoreParams<T>> = {},
) {
  const { selection, abcOptions } = { ...DEFAULT_OPTIONS, ...params };
  ensureSelection(selection).forEach((element) => {
    const contentElement = element.querySelector<HTMLElement>(
      `.${cssClasses.content}`,
    );
    new ABCScore({
      content: contentElement?.textContent || "",
      element: element.querySelector(`.${cssClasses.staff}`)!,
      abcOptions,
      ...extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS),
    }).render();
  });
}
