import {
  ensureSelection,
  extractElementOptions,
  Player,
  ensureElements,
} from "@music-ui/core";
import {
  DEFAULT_PIANO_OPTIONS,
  Piano,
  cssClasses,
  type PianoOptions,
} from "./Piano";
import { DEFAULT_OPTIONS, type InitPianoParams } from "./init";
import { initControls } from "./controls";

/**
 * The params expected by the `initPianoWithPlayer` function.
 * @property player A `Player` instance.
 */
type InitPianoWithPlayerParams<T extends HTMLElement> = InitPianoParams<T> & {
  player: Player;
};

/**
 * Initializes pianos with player on the passed selection.
 * @param params The initialization params.
 */
export function initPianoWithPlayer<T extends HTMLElement>(
  params: Partial<InitPianoWithPlayerParams<T>> = {},
) {
  const { selection, player } = { ...DEFAULT_OPTIONS, ...params };

  if (!(player instanceof Player)) {
    throw new Error("You must pass a Player instance");
  }

  ensureSelection(selection).forEach((element, index) => {
    const id = element.dataset.id || `${index + 1}`;

    const { pianoElement, controlsElement } = ensureElements({
      id,
      parentElement: element,
      elements: {
        pianoElement: `.${cssClasses.piano}`,
        controlsElement: `.${cssClasses.controls}`,
      },
    });

    const options = extractElementOptions(
      element,
      DEFAULT_PIANO_OPTIONS as Omit<PianoOptions, "element">,
    );

    const piano = new Piano({ ...options, element: pianoElement! });
    const { notes, noteLabels } = element.dataset;

    if (!notes) {
      console.warn(`Piano with player ${id} has no notes to play`);
      return;
    }

    const { disableButtons, resetButtons } = initControls({
      element: controlsElement!,
      notes,
      player,
      id,
    });

    player.on("finished", () => {
      resetButtons();
      piano.setPlayedNotes([]);
    });
    player.on("progress", ({ activeId, playedNotes }) => {
      disableButtons();
      if (activeId !== id || !playedNotes.length) {
        return;
      }
      piano.setPlayedNotes(playedNotes.at(0)!);
    });

    piano.render();
    piano.setNotes(notes, noteLabels);
  });
}
