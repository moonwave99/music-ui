import {
  ensureSelection,
  extractElementOptions,
  Player,
  extractIndentedInput,
  getAbcScore,
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

// #TODO add piano option
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

    const options = extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS);

    const content =
      element.querySelector(`.${cssClasses.content}`)?.textContent.trim() || "";

    const score = getAbcScore({
      id,
      input: content,
      options,
    });

    const { resetButtons } = initControls({
      score,
      player,
      element: element.querySelector(".controls")!,
    });

    player.on("finished", resetButtons);
    player.on("progress", ({ activeId, position }) => {
      if (activeId !== id) {
        resetButtons();
        return;
      }
      abcScore.clearSelection();
      abcScore.updatePosition(position);
    });

    const abcScore = new ABCScore({
      content: score.content,
      element: element.querySelector(`.${cssClasses.staff}`)!,
      onClick: ({ position }) => {
        if (player.getScore()?.id !== id) {
          return;
        }
        abcScore.updatePosition(position);
        player.seekTo(position);
      },
      abcOptions,
      ...options,
    }).render();
  });
}
