import { createControls, Player, type Score } from "@music-ui/core";

type InitControlsParams = {
  score: Score;
  element: HTMLElement;
  player: Player;
};

type InitControls = {
  resetButtons: () => void;
};

export function initControls({
  score,
  element,
  player,
}: InitControlsParams): InitControls {
  const { play, pause, stop } = createControls(element, {
    play: () => {
      player.setScore(score);
      player.play();
      play.disabled = true;
      pause.disabled = false;
      stop.disabled = false;
    },
    pause: () => {
      player.pause();
      play.disabled = false;
      pause.disabled = true;
      stop.disabled = false;
    },
    stop: () => {
      player.stop();
      play.disabled = false;
      pause.disabled = true;
      stop.disabled = true;
    },
  }) as {
    play: HTMLButtonElement;
    pause: HTMLButtonElement;
    stop: HTMLButtonElement;
  };

  pause.disabled = true;
  stop.disabled = true;

  function resetButtons() {
    play.disabled = false;
    pause.disabled = true;
    stop.disabled = true;
  }

  return { resetButtons };
}
