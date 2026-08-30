import { Player, getPianoScore, createControls } from "@music-ui/core";

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

export function initControls({
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
