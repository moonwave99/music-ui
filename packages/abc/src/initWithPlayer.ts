import {
  ensureSelection,
  extractElementOptions,
  Player,
  extractIndentedInput,
  getAbcScore,
  type ElementOrSelector,
  joinVoices,
} from "@music-ui/core";
import { Piano } from "@music-ui/piano";
import {
  ABCScore,
  cssClasses,
  DEFAULT_ABC_SCORE_OPTIONS,
  type ABCScoreParams,
} from "./abcScore";
import { DEFAULT_SELECTOR } from "./init";
import { initControls } from "./controls";

const DEFAULT_PIANO_OCTAVES = 5;

type InitABCScoreWithPlayerParams<T extends HTMLElement> = {
  selection?: ElementOrSelector<T>;
  abcOptions?: ABCScoreParams["abcOptions"];
  player: Player;
};

export function initABCScoreWithPlayer<T extends HTMLElement>({
  selection = DEFAULT_SELECTOR,
  abcOptions = {},
  player,
}: InitABCScoreWithPlayerParams<T>) {
  return ensureSelection(selection).map((element, index) => {
    const id = element.dataset.id || `${index + 1}`;
    const staffElement = element.querySelector<HTMLElement>(
      `.${cssClasses.staff}`,
    );
    if (!staffElement) {
      throw new Error(`staffElement not found for score with id: ${id}`);
    }
    const contentElement = element.querySelector<HTMLElement>(
      `.${cssClasses.content}`,
    );
    if (!contentElement) {
      throw new Error(`contentElement not found for score with id: ${id}`);
    }
    const controlsElement = element.querySelector<HTMLElement>(
      `.${cssClasses.controls}`,
    );
    if (!controlsElement) {
      throw new Error(`controlsElement not found for score with id: ${id}`);
    }

    const content = extractIndentedInput(contentElement) || "";
    const options = extractElementOptions(element, DEFAULT_ABC_SCORE_OPTIONS);
    const score = getAbcScore({ id, options, input: content });

    const { resetButtons } = initControls({
      score,
      player,
      element: controlsElement,
    });

    let piano: Piano;

    player.on("finished", resetButtons);
    player.on("progress", ({ activeId, position, playedNotes }) => {
      if (activeId !== id) {
        resetButtons();
        return;
      }
      abcScore.clearSelection();
      abcScore.updatePosition(position);

      piano?.setNotes(joinVoices(playedNotes));
    });

    const abcScore = new ABCScore({
      content: score.content,
      element: staffElement,
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

    if (options.showPiano) {
      const pianoElement = document.createElement("div");
      const { pianoOctaves } = element.dataset;
      const octaves = pianoOctaves
        ? Number(pianoOctaves)
        : DEFAULT_PIANO_OCTAVES;

      piano = new Piano({ element: pianoElement, octaves });
      element.append(pianoElement);
      piano.render();
    }
  });
}
