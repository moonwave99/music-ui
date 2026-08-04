import { midiToNoteName } from "@tonaljs/midi";
import { type NoteTimingEvent } from "abcjs";

export type CursorControlParams = {
  id: string;
  el: HTMLElement;
  beatSubdivisions?: number;
  onNotesChange?: (notes: string[]) => void;
  onPlaybackFinished?: () => void;
};

type OnPlaybackCallback = (id: string) => void;

export class CursorControl {
  private id: string;
  private el: HTMLElement;
  private beatSubdivisions: number;
  private onNotesChange?: (notes: string[]) => void;
  private onPlaybackFinished?: () => void;
  private _onPlayback: OnPlaybackCallback;
  constructor({
    id,
    el,
    beatSubdivisions = 2,
    onNotesChange,
    onPlaybackFinished,
  }: CursorControlParams) {
    this.id = id;
    this.el = el;
    this.beatSubdivisions = beatSubdivisions;
    this.onNotesChange = onNotesChange;
    this.onPlaybackFinished = onPlaybackFinished;
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
    this._onFinished();
    if (!this.onPlaybackFinished) {
      return;
    }
    this.onPlaybackFinished();
  }
  _onFinished() {
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
