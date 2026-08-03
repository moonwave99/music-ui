import { midiToNoteName } from "@tonaljs/midi";
import { synth, renderAbc, type TuneObject, type NoteTimingEvent } from "abcjs";

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
};

export type InitABC = {
  cursorControl: CursorControl | null;
  stop: () => void;
};

export async function initAbc({
  content = "",
  staffElement,
  audioControlsElement,
  id,
  hidePlayer = false,
  hideMeter = false,
  onNotesChange = () => {},
}: InitABCParams): Promise<InitABC> {
  const visualObj = renderAbc(staffElement, content, {
    responsive: "resize",
    add_classes: true,
  }).at(0) as TuneObject;

  const cursorControl = new CursorControl({
    id,
    el: staffElement,
    onNotesChange,
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
    };
  }

  const synthControl = new synth.SynthController();
  synthControl.load(audioControlsElement, cursorControl, {
    displayLoop: true,
    displayRestart: true,
    displayPlay: true,
    displayProgress: true,
    displayWarp: true,
  });
  const midiBuffer = new synth.CreateSynth();
  await midiBuffer.init({ visualObj });
  synthControl.setTune(visualObj, true);

  function stop() {
    synthControl.pause();
  }

  return { cursorControl, stop };
}

type CursorControlParams = {
  id: string;
  el: HTMLElement;
  beatSubdivisions?: number;
  onNotesChange: (notes: string[]) => void;
};

type OnPlaybackCallback = (id: string) => void;

class CursorControl {
  private id: string;
  private el: HTMLElement;
  private beatSubdivisions: number;
  private onNotesChange?: (pitches: string[]) => void;
  private _onPlayback: OnPlaybackCallback;
  constructor({
    id,
    el,
    beatSubdivisions = 2,
    onNotesChange,
  }: CursorControlParams) {
    this.id = id;
    this.el = el;
    this.beatSubdivisions = beatSubdivisions;
    this.onNotesChange = onNotesChange;
    this._onPlayback = () => {};
  }
  onPlayback(callback: OnPlaybackCallback) {
    this._onPlayback = callback;
  }
  onStart() {
    if (!this.el.querySelector("svg .abcjs-cursor")) {
      this._createCursor();
    }
    if (!this._onPlayback) {
      return;
    }
    this._onPlayback(this.id);
  }
  onEvent(event: NoteTimingEvent) {
    if (event.measureStart && event.left === null) {
      return;
    }

    if (this.onNotesChange) {
      this.onNotesChange(
        event.midiPitches
          ?.filter((x: unknown) => (x as { cmd: string }).cmd === "note")
          .map(({ pitch }) => midiToNoteName(pitch)) || [],
      );
    }

    this.el
      .querySelectorAll("svg .highlight")
      .forEach((x) => x.classList.remove("highlight"));

    if (event.elements) {
      event.elements.forEach((x: HTMLElement[]) =>
        x.forEach((y) => y.classList.add("highlight")),
      );
    }

    const cursor = this.el.querySelector("svg .abcjs-cursor");
    const { left, top, height } = event;
    if (!cursor || !left || !top || !height) {
      return;
    }

    cursor.setAttribute("x1", `${left - 2}`);
    cursor.setAttribute("x2", `${left - 2}`);
    cursor.setAttribute("y1", `${top}`);
    cursor.setAttribute("y2", `${top + height}`);
  }
  onFinished() {
    if (this.onNotesChange) {
      this.onNotesChange([]);
    }
    this.el
      .querySelectorAll("svg .highlight")
      .forEach((x) => x.classList.remove("highlight"));
    const cursor = this.el.querySelector("svg .abcjs-cursor");
    if (!cursor) {
      return;
    }
    cursor.setAttribute("x1", "0");
    cursor.setAttribute("x2", "0");
    cursor.setAttribute("y1", "0");
    cursor.setAttribute("y2", "0");
  }
  _createCursor() {
    const cursor = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    cursor.setAttribute("class", "abcjs-cursor");
    cursor.setAttributeNS(null, "x1", "0");
    cursor.setAttributeNS(null, "y1", "0");
    cursor.setAttributeNS(null, "x2", "0");
    cursor.setAttributeNS(null, "y2", "0");
    this.el.querySelector("svg")!.appendChild(cursor);
  }
}
