import {
  createControls,
  Player,
  PlayerStatus,
  type Score,
} from "@music-ui/core";

type InitControlsParams = {
  score: Score;
  element: HTMLElement;
  player: Player;
};

type InitControls = {
  updateButtonState: (playerStatus: PlayerStatus) => void;
};

export function initControls({
  score,
  element,
  player,
}: InitControlsParams): InitControls {
  const { play, pause, stop } = createControls(element, {
    play: () => player.setScore(score).play(),
    pause: () => player.pause(),
    stop: () => player.stop(),
  }) as {
    play: HTMLButtonElement;
    pause: HTMLButtonElement;
    stop: HTMLButtonElement;
  };

  pause.disabled = true;
  stop.disabled = true;

  function updateButtonState(playerStatus: PlayerStatus) {
    if (playerStatus === "stopped") {
      play.disabled = false;
      pause.disabled = true;
      stop.disabled = true;
      return;
    }
    if (playerStatus === "playing") {
      play.disabled = true;
      pause.disabled = false;
      stop.disabled = false;
      return;
    }
    play.disabled = false;
    pause.disabled = true;
    stop.disabled = false;
  }

  return { updateButtonState };
}
