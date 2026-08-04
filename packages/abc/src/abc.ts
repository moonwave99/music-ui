import { synth, renderAbc, type TuneObject } from "abcjs";
import { CursorControl } from "./CursorControl";

const DEFAULT_INIT_OPTIONS = {
  elements: "[data-abc]",
} as const;

type InitAllOptions = {
  elements: string | NodeListOf<HTMLElement>;
};

export async function initAll(options: InitAllOptions = DEFAULT_INIT_OPTIONS) {
  const elements =
    typeof options.elements === "string"
      ? document.querySelectorAll<HTMLElement>(options.elements)
      : options.elements;

  return Promise.all(
    [...elements].map((element: HTMLElement, index: number) =>
      initAbc({
        id: element.dataset.id || String(index + 1),
        content: element.querySelector(".content")!.textContent,
        staffElement: element.querySelector(".staff")!,
        audioControlsElement: element.querySelector(".audio-controls")!,
        hidePlayer: Boolean(element.dataset.hidePlayer),
      }),
    ),
  );
}

export type InitABCParams = {
  content?: string;
  staffElement: HTMLElement;
  audioControlsElement: HTMLElement;
  id: string;
  hidePlayer?: boolean;
  hideMeter?: boolean;
  onNotesChange?: (notes: string[]) => void;
  onPlaybackFinished?: () => void;
};

export type InitABC = {
  cursorControl: CursorControl | null;
  stop: () => void;
  play: () => void;
  restart: () => void;
};

export async function initAbc({
  content = "",
  staffElement,
  audioControlsElement,
  id,
  hidePlayer = false,
  hideMeter = false,
  onNotesChange = () => {},
  onPlaybackFinished = () => {},
}: InitABCParams): Promise<InitABC> {
  const visualObj = renderAbc(staffElement, content, {
    responsive: "resize",
    add_classes: true,
    paddingleft: 0,
    paddingright: 0,
  }).at(0) as TuneObject;

  const cursorControl = new CursorControl({
    id,
    el: staffElement,
    onNotesChange,
    onPlaybackFinished,
  });

  const isMeterDenominatorUnary = visualObj.getMeter().value?.at(0)!.den == 1;

  if (hideMeter || isMeterDenominatorUnary) {
    (staffElement.querySelector(
      ".abcjs-time-signature",
    ) as HTMLElement)!.style.display = "none";
  }

  if (hidePlayer) {
    return {
      cursorControl: null,
      stop: () => {},
      play: () => {},
      restart: () => {},
    };
  }

  const synthControl = new synth.SynthController();

  // NOTE: in order to use the CursorControl, SynthController needs to render the audio controls.
  // Hide the .abcjs-inline-audio element via CSS, then use the exported methods in your own controls.
  synthControl.load(audioControlsElement, cursorControl, {
    displayPlay: false,
    displayProgress: false,
  });
  const midiBuffer = new synth.CreateSynth();
  await midiBuffer.init({ visualObj });
  synthControl.setTune(visualObj, false);

  function stop() {
    synthControl.pause();
  }

  function play() {
    synthControl.play();
  }

  function restart() {
    synthControl.restart();
  }

  return { cursorControl, stop, play, restart };
}
