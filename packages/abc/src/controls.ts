import { Player, getAbcScore } from "@music-ui/core";

type InitControlsParams = {
  id: string;
  input: string;
  element: HTMLElement;
};

export async function initControls({ id, input, element }: InitControlsParams) {
  const player = new Player();
  const score = getAbcScore({ id, input });
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
  });

  return player;
}

function createControls(
  element: HTMLElement,
  handlers: {
    play: () => void;
    pause: () => void;
    stop: () => void;
  },
) {
  const controls = document.createElement("div");
  controls.classList.add("controls");

  const buttons = {} as Record<string, HTMLButtonElement>;

  Object.entries(handlers).forEach(([name, handler]) => {
    const button = document.createElement("button");
    button.classList.add("control-button", `${name}-button`);
    button.addEventListener("click", handler);
    button.textContent = name;
    controls.append(button);
    button.disabled = name !== "play";
    buttons[name] = button;
  });

  element.append(controls);

  return buttons as {
    play: HTMLButtonElement;
    pause: HTMLButtonElement;
    stop: HTMLButtonElement;
  };
}
