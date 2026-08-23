import {
  ensureSelection,
  extractElementOptions,
  Player,
  getPianoScore,
  createControls,
  ensureElements,
} from "@music-ui/core";
import {
  DEFAULT_PIANO_OPTIONS,
  Piano,
  cssClasses,
  type PianoOptions,
} from "./Piano";
import { DEFAULT_OPTIONS, type InitPianoParams } from "./init";

type InitPianoWithPlayerParams<T extends HTMLElement> = InitPianoParams<T> & {
  player: Player;
};

export function initPianoWithPlayer<T extends HTMLElement>(
  params: Partial<InitPianoWithPlayerParams<T>> = {},
) {
  const { selection, player } = { ...DEFAULT_OPTIONS, ...params };

  if (!(player instanceof Player)) {
    throw new Error("You must pass a Player instance");
  }

  return ensureSelection(selection).map((element, index) => {
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

type InitControlsParams = {
  id: string;
  element: HTMLElement;
  notes: string;
  player: Player;
};

type InitControls = {
  resetButtons: () => void;
  disableButtons: () => void;
};

function initControls({
  id,
  element,
  notes,
  player,
}: InitControlsParams): InitControls {
  const blockScore = getPianoScore({ id, input: notes, playbackMode: "block" });
  const arpeggioScore = getPianoScore({
    id,
    input: notes,
    playbackMode: "arpeggio",
  });
  const { playBlock, playArpeggio } = createControls(element, {
    playBlock: () => {
      player.setScore(blockScore);
      player.play();
    },
    playArpeggio: () => {
      player.setScore(arpeggioScore);
      player.play();
    },
  }) as {
    playBlock: HTMLButtonElement;
    playArpeggio: HTMLButtonElement;
  };

  function disableButtons() {
    playBlock.disabled = true;
    playArpeggio.disabled = true;
  }

  function resetButtons() {
    playBlock.disabled = false;
    playArpeggio.disabled = false;
  }

  playBlock.textContent = "Play";
  playArpeggio.textContent = "Arpeggio";

  return { disableButtons, resetButtons };
}
