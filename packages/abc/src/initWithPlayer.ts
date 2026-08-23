import {
  ensureSelection,
  extractElementOptions,
  Player,
  getAbcScore,
  type ElementOrSelector,
  joinVoices,
  ensureElements,
} from "@music-ui/core";
import { Piano } from "@music-ui/piano";
import { ABCScore, cssClasses, DEFAULT_ABC_SCORE_OPTIONS } from "./abcScore";
import { DEFAULT_OPTIONS, type InitABCScoreParams } from "./init";
import { initControls } from "./controls";

const DEFAULT_PIANO_OCTAVES = 5;

const DEFAULT_ABC_SCORE_WITH_PLAYER_OPTIONS = {
  ...DEFAULT_ABC_SCORE_OPTIONS,
  showPiano: false,
  highlightBars: false,
} as const;

type InitABCScoreWithPlayerParams<T extends HTMLElement> =
  InitABCScoreParams<T> & {
    player: Player;
  };

export function initABCScoreWithPlayer<T extends HTMLElement>(
  params: Partial<InitABCScoreWithPlayerParams<T>> = {},
) {
  const { selection, player, abcOptions } = { ...DEFAULT_OPTIONS, ...params };

  if (!(player instanceof Player)) {
    throw new Error("You must pass a Player instance");
  }

  return ensureSelection(selection as ElementOrSelector<T>).map(
    (element, index) => {
      const id = element.dataset.id || `${index + 1}`;

      const { staffElement, contentElement, controlsElement } = ensureElements({
        id,
        parentElement: element,
        elements: {
          staffElement: `.${cssClasses.staff}`,
          contentElement: `.${cssClasses.content}`,
          controlsElement: `.${cssClasses.controls}`,
        },
      });

      const content = contentElement?.textContent || "";
      const options = extractElementOptions(
        element,
        DEFAULT_ABC_SCORE_WITH_PLAYER_OPTIONS,
      );
      const score = getAbcScore({ id, options, input: content });

      const { resetButtons } = initControls({
        score,
        player,
        element: controlsElement!,
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
        if (options.highlightBars) {
          abcScore.highlightBar(position);
        }
        piano?.setNotes(joinVoices(playedNotes));
      });

      const abcScore = new ABCScore({
        content: score.content,
        element: staffElement!,
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
    },
  );
}
