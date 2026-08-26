import {
  createControls,
  Player,
  PlayerStatus,
  BPM_RANGE,
  type Score,
} from "@music-ui/core";

import { cssClasses } from "./abcScore";

type InitControlsParams = {
  element: HTMLElement;
  score: Score;
  player: Player;
  showTempoControls?: boolean;
};

type InitControls = {
  updateButtonState: (playerStatus: PlayerStatus) => void;
};

export function initControls({
  element,
  score,
  player,
  showTempoControls = true,
}: InitControlsParams): InitControls {
  const originalBpm = score.info.bpm;
  let currentBpm = originalBpm;

  const { play, pause, stop } = createControls(element, {
    play: () => {
      player.setScore(score);
      player.setBpm(currentBpm);
      player.play();
    },
    pause: () => player.pause(),
    stop: () => player.stop(),
  }) as {
    play: HTMLButtonElement;
    pause: HTMLButtonElement;
    stop: HTMLButtonElement;
  };

  pause.disabled = true;
  stop.disabled = true;

  if (showTempoControls) {
    const { setTempoValue } = initTempoControl({
      element,
      id: score.id,
      originalBpm,
      onChange: onTempoChange,
      onReset: onTempoReset,
    });

    function onTempoChange(value: number) {
      currentBpm = value;
      player.setBpm(currentBpm);
    }

    function onTempoReset() {
      currentBpm = originalBpm;
      setTempoValue(originalBpm);
      player.setBpm(originalBpm);
    }
  }

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

type InitTempoControlParams = {
  element: HTMLElement;
  id: string;
  originalBpm: number;
  onChange: (value: number) => void;
  onReset: () => void;
};

type InitTempoControl = {
  setTempoValue: (value: number) => void;
};

function initTempoControl({
  element,
  id,
  originalBpm,
  onChange,
  onReset,
}: InitTempoControlParams): InitTempoControl {
  const _id = `tempo-control-${id}`;

  const tempoControlElement = document.createElement("div");
  tempoControlElement.classList.add(cssClasses.tempoControl);

  const label = document.createElement("label");
  label.setAttribute("for", _id);
  label.textContent = "Tempo";

  const input = document.createElement("input");
  input.type = "range";
  input.id = _id;
  input.min = `${BPM_RANGE[0]}`;
  input.max = `${BPM_RANGE[1]}`;
  input.addEventListener("change", (event: Event) => {
    const value = (event.target as HTMLInputElement)?.value;
    onChange(Number(value));
    output.textContent = `${value}`;
  });

  const output = document.createElement("output");
  output.setAttribute("for", _id);

  const button = document.createElement("button");
  button.textContent = "Reset";
  button.addEventListener("click", onReset);

  tempoControlElement.append(label, input, output, button);

  setTempoValue(originalBpm);

  element.append(tempoControlElement);

  function setTempoValue(value: number) {
    input.value = `${value}`;
    output.textContent = `${value}`;
  }

  return { setTempoValue };
}
