import {
  synth,
  renderAbc,
  type TuneObject,
  type NoteTimingEvent,
  MidiPitch,
} from "abcjs";

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
  hidePlayer,
}: InitABCParams): Promise<InitABC> {
  function clickListener(_: unknown, ___: unknown, classes: string) {
    console.log(classes);
  }

  const visualObj = renderAbc(staffElement, content, {
    clickListener,
    responsive: "resize",
    add_classes: true,
  }).at(0) as TuneObject;

  const cursorControl = new CursorControl({
    id,
    el: staffElement,
    onNotesChange: () => {},
  });

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
  onNotesChange: () => void;
};

type OnPlaybackCallback = (id: string) => void;

class CursorControl {
  private id: string;
  private el: HTMLElement;
  private beatSubdivisions: number;
  private onNotesChange: (pitches: MidiPitch[]) => void;
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
      this.onNotesChange(event.midiPitches || []);
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
