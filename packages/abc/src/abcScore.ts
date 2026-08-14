import {
  renderAbc,
  type AbcVisualParams,
  TuneObject,
  ClickListenerAnalysis,
} from "abcjs";
import { type PlayerPosition } from "@music-ui/core";
import { getCurrentNote, getNotePosition, getValueFromNote } from "./lib";

const cursorBleed = 7.5;
const cursorOffset = -2.5;

export const DEFAULT_ABC_SCORE_OPTIONS = {
  showCursor: true,
  showMeter: true,
  showTempo: true,
} as const;

const DEFAULT_ABC_VISUAL_PARAMS = {
  responsive: "resize",
  add_classes: true,
  paddingleft: 0,
  paddingright: 0,
  selectionColor: "dodgerblue",
} as const;

export const cssClasses = {
  content: "content",
  staff: "staff",
  timeSignature: "abcjs-time-signature",
  cursor: "abcjs-cursor",
  currentNote: "abcjs-current-note",
} as const;

export type ABCScoreParams = {
  content?: string;
  element: HTMLElement;
  showCursor?: boolean;
  showMeter?: boolean;
  showTempo?: boolean;
  abcOptions?: AbcVisualParams;
  onClick?: (params: OnABCClickParams) => void;
};

export type OnABCClickParams = {
  position: PlayerPosition;
};

export class ABCScore {
  private content: string;
  private element: HTMLElement;
  private showCursor: boolean;
  private showMeter: boolean;
  private abcOptions: AbcVisualParams;
  private onClick: ((params: OnABCClickParams) => void) | undefined;
  private tune: TuneObject | null;
  private cursor: SVGLineElement | null;
  private rendered: boolean;
  constructor({
    content = "",
    element,
    showCursor = true,
    showMeter = true,
    abcOptions = {},
    onClick,
  }: ABCScoreParams) {
    if (!element) {
      throw new Error("Element not found");
    }
    this.content = content;
    this.element = element;
    this.showCursor = showCursor;
    this.showMeter = showMeter;
    this.abcOptions = abcOptions;
    this.onClick = onClick;
    this.tune = null;
    this.cursor = null;
    this.rendered = false;
  }
  getSVGElement() {
    return this.element!.querySelector("svg");
  }
  /**
   * Renders the UI inside the current element.
   */
  render(): ABCScore {
    this.baseRender();
    return this;
  }
  /**
   * Updates the score position (moving the cursor and highlighting the corresponding note).
   * @param position The new score position
   */
  updatePosition(position: PlayerPosition): ABCScore {
    if (!this.showCursor || !this.rendered) {
      return this;
    }
    const svgElement = this.getSVGElement()!;
    const [bar] = position.split(":");
    const barNotes = svgElement!.querySelectorAll<SVGGElement>(
      `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}`,
    );

    const currentNote = getCurrentNote(barNotes, position);
    if (!currentNote) {
      return this;
    }
    svgElement
      .querySelectorAll(`.${cssClasses.currentNote}`)
      .forEach((element) => element.classList.remove(cssClasses.currentNote));
    currentNote.classList.add(cssClasses.currentNote);
    this.updateCursor(currentNote);
    return this;
  }
  private updateCursor(currentNote: SVGGElement): ABCScore {
    if (!this.rendered) {
      return this;
    }
    const lineNumber = getValueFromNote(currentNote, "abcjs-l");
    const line = this.getSVGElement()?.querySelector<SVGGElement>(
      `.abcjs-staff.abcjs-l${lineNumber}`,
    );
    const noteBox = currentNote.querySelector<SVGGElement>("path")?.getBBox();

    const lineBox = line?.getBBox();
    if (noteBox && lineBox) {
      this.cursor?.setAttribute("x1", String(noteBox.x! + cursorOffset));
      this.cursor?.setAttribute("x2", String(noteBox.x! + cursorOffset));
      this.cursor?.setAttribute("y1", String(lineBox.y! - cursorBleed));
      this.cursor?.setAttribute(
        "y2",
        String(lineBox.y! + lineBox.height! + cursorBleed),
      );
    }
    return this;
  }
  private baseRender() {
    /* istanbul ignore if  */
    if (this.rendered) {
      return;
    }
    const clickListener = (
      _: unknown,
      __: unknown,
      ___: unknown,
      x: ClickListenerAnalysis,
    ) => {
      if (!this.onClick) {
        return;
      }
      const currentNote = x.selectableElement as unknown as SVGGElement;
      this.updateCursor(currentNote);
      this.onClick({ position: getNotePosition(currentNote) });
    };

    this.tune = renderAbc(this.element!, this.content, {
      ...DEFAULT_ABC_VISUAL_PARAMS,
      ...this.abcOptions,
      clickListener,
    }).at(0) as TuneObject;

    if (this.showCursor) {
      this.cursor = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      this.cursor.classList.add(cssClasses.cursor);
      this.getSVGElement()?.append(this.cursor);
    }

    const isMeterDenominatorUnary = this.tune.getMeter().value?.at(0)!.den == 1;

    if (!this.showMeter || isMeterDenominatorUnary) {
      const timeSignature = this.element!.querySelector<HTMLElement>(
        `.${cssClasses.timeSignature}`,
      );
      if (timeSignature) {
        timeSignature.style.display = "none";
      }
    }
    this.rendered = true;
  }
}
