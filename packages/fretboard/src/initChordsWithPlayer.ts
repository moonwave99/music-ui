import {
  areNotesEquivalent,
  ensureElements,
  ensureSelection,
  initPlaybackControls,
  Player,
} from "@music-ui/core";

import {
  initChord,
  DEFAULT_OPTIONS,
  type InitChordsParams,
} from "./initChords";

import { cssClasses } from "./fretboard/Fretboard";

import { DEFAULT_COLORS } from "./constants";

/**
 * The params expected by the `initPianoWithPlayer` function.
 * @property player A `Player` instance.
 * @property playedNoteColor The played note color
 */
type InitChordsWithPlayerParams<T extends HTMLElement> = InitChordsParams<T> & {
  player: Player;
  playedNoteColor?: string;
};

/**
 * Renders chord diagrams with player on the passed selection.
 * @param params The initialization params.
 */
export function initChordsWithPlayer<T extends HTMLElement>(
  params: Partial<InitChordsWithPlayerParams<T>> = {},
) {
  const { selection, player, playedNoteColor } = {
    ...DEFAULT_OPTIONS,
    playedNoteColor: DEFAULT_COLORS.highlight,
    ...params,
  };
  if (!(player instanceof Player)) {
    throw new Error("You must pass a Player instance");
  }
  ensureSelection(selection).map((element, index) => {
    const id = element.dataset.id || `chord-${index + 1}`;

    const { fretboardElement, controlsElement } = ensureElements({
      id,
      parentElement: element,
      elements: {
        fretboardElement: `.${cssClasses.fretboard}`,
        controlsElement: `.${cssClasses.controls}`,
      },
    });

    const { fretboard, positions } = initChord(fretboardElement!);

    const { disableButtons, resetButtons } = initPlaybackControls({
      element: controlsElement!,
      notes: positions
        .toReversed()
        .map(({ noteWithOctave }) => noteWithOctave!),
      instrument: element.dataset.instrument || "acoustic_guitar_nylon",
      player,
      id,
    });

    player.on("finished", () => {
      resetButtons();
      fretboard.style({
        fill: DEFAULT_COLORS.positionFillColor,
      });
    });
    player.on("progress", ({ activeId, playedNotes }) => {
      disableButtons();
      if (activeId !== id || !playedNotes.length) {
        return;
      }
      fretboard.style({
        fill: ({ noteWithOctave }) =>
          playedNotes.at(0)!.length > 1
            ? playedNoteColor
            : areNotesEquivalent(noteWithOctave!, playedNotes.at(0)!.at(0)!)
              ? playedNoteColor
              : DEFAULT_COLORS.positionFillColor,
      });
    });
  });
}
