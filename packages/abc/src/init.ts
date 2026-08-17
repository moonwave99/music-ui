import {
  ensureSelection,
  extractElementOptions,
  Player,
  extractIndentedInput,
  type ElementOrSelector,
} from "@music-ui/core";
import {
  ABCScore,
  cssClasses,
  DEFAULT_ABC_SCORE_OPTIONS,
  type ABCScoreParams,
} from "./abcScore";
import { initControls } from "./controls";

const DEFAULT_SELECTOR = "[data-abc-score]";

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

type InitABCScoreWithPlayerParams<T extends HTMLElement> = {
  selection: ElementOrSelector<T>;
  abcOptions?: ABCScoreParams["abcOptions"];
  player: Player;
};

export function initABCScoreWithPlayer<T extends HTMLElement>({
  selection,
  abcOptions = {},
  player,
}: InitABCScoreWithPlayerParams<T>) {
  return ensureSelection(selection).map((element, index) => {
    const id = element.dataset.id || `${index}`;
    const controlsElement = element.querySelector(".controls");
    if (!controlsElement) {
      throw new Error(`controlsElement not found for score with id: ${id}`);
    }
    const content =
      element.querySelector(`.${cssClasses.content}`)?.textContent.trim() || "";

    initControls({
      id,
      player,
      element: element.querySelector(".controls")!,
      input: content,
    });
    new ABCScore({
      content,
      element: element.querySelector(`.${cssClasses.staff}`)!,
      abcOptions,
      ...extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS),
    }).render();
  });
}
