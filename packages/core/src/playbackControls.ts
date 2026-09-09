import { type Player } from "./player";
import { type NoteInput } from "./types";
import { getPlaybackScore, createControls } from "./utils";

type InitPlaybackControlsParams = {
  id: string;
  element: HTMLElement;
  notes: NoteInput;
  player: Player;
};

type InitPlaybackControls = {
  resetButtons: () => void;
  disableButtons: () => void;
};

export function initPlaybackControls({
  id,
  element,
  notes,
  player,
}: InitPlaybackControlsParams): InitPlaybackControls {
  const blockScore = getPlaybackScore({
    id,
    input: notes,
    playbackMode: "block",
  });
  const arpeggioScore = getPlaybackScore({
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
