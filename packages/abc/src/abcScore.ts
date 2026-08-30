import {
  renderAbc,
  TuneObject,
  ClickListenerAnalysis,
  type AbcVisualParams,
} from "abcjs";
import { extractIndentedInput, isTimeSignatureUnary } from "@music-ui/core";
import type { TransportPosition, TimeSignature } from "@music-ui/core";
import { getCurrentNote, getNotePosition, getValueFromNote } from "./lib";

/**
 * The cursor staff height overflow.
 * Affects both sides (i.e. {cursorBleed}px above and {cursorBleed}px below).
 */
const cursorBleed = 7.5;

/**
 * The horizontal distance between the cursor and the current note.
 */
const cursorOffset = -2.5;

/**
 * @property {boolean} showCursor The default cursor display
 * @property {boolean} showTempo The default show tempo display
 * @property {boolean} showTimeSignature The default time signature display
 * @property {boolean} highlightBars The default highlightBars display
 */
export const DEFAULT_ABC_SCORE_OPTIONS = {
  showCursor: true,
  showTempo: true,
  showTimeSignature: true,
  highlightBars: false,
} as const;

/**
 * @property {string} responsive The default responsive behavior
 * @property {boolean} add_classes The default abc.js class rendering
 * @property {number} paddingleft The default left score padding
 * @property {number} paddingright The default right score padding
 * @property {string} selectionColor The default selection color
 */
const DEFAULT_ABC_VISUAL_PARAMS = {
  responsive: "resize",
  add_classes: true,
  paddingleft: 0,
  paddingright: 0,
  selectionColor: "dodgerblue",
} as Partial<AbcVisualParams>;

/**
 * @property {string} content The abc notation element class
 * @property {string} staff The rendered notation element class
 * @property {string} controls The controls element class
 * @property {string} tempoControl The tempo control element class
 * @property {string} timeSignature The time signature element class
 * @property {string} tempo The tempo element class
 * @property {string} cursor The cursor element class
 * @property {string} barBox The current bar element class
 * @property {string} currentNote The current note element class
 * @property {string} selectedNote The selected note element class
 */
export const cssClasses = {
  content: "content",
  staff: "staff",
  controls: "controls",
  tempoControl: "tempo-control",
  timeSignature: "abcjs-time-signature",
  tempo: "abcjs-tempo",
  cursor: "abcjs-cursor",
  barBox: "abcjs-bar-box",
  currentNote: "abcjs-current-note",
  selectedNote: "abcjs-note_selected",
} as const;

/**
 * @property position The current position of the score
 */
export type OnABCClickParams = {
  position: TransportPosition;
};

type BarBounds = Pick<DOMRect, "x" | "y" | "width" | "height">;

type GroupedBarsEntry = {
  barNumber: number;
  isFirstOfLine: boolean;
  voices: BarBounds[];
};

/**
 * The parameters accepted by the ABCScore constructor.
 *
 * @property content The abc notation content
 * @property element The element where the score will be rendered
 * @property showCursor Display the cursor or not
 * @property showTimeSignature Display the time signature or not
 * @property abcOptions The options passed to the abcjs renderer
 * @property onClick The function called when clicking on a note
 */
export type ABCScoreParams = {
  content?: string;
  element: HTMLElement;
  showCursor?: boolean;
  showTimeSignature?: boolean;
  highlightBars?: boolean;
  abcOptions?: AbcVisualParams;
  onClick?: (params: OnABCClickParams) => void;
};

export class ABCScore {
  private content: string;
  private element: HTMLElement;
  private showCursor: boolean;
  private showTimeSignature: boolean;
  private highlightBars: boolean;
  private abcOptions: AbcVisualParams;
  private onClick: ((params: OnABCClickParams) => void) | undefined;
  private tune: TuneObject | null;
  private cursor: SVGLineElement | null;
  private barBox: SVGRectElement | null;
  private rendered: boolean;
  private voiceCount: number;
  private barBounds: BarBounds[];
  /**
   * Creates an `ABCScore` instance.
   *
   * @param __namedParameters The accepted params
   */
  constructor({
    content = "",
    element,
    showCursor = true,
    showTimeSignature = true,
    highlightBars = false,
    abcOptions = {},
    onClick,
  }: ABCScoreParams) {
    if (!element) {
      throw new Error("Element not found");
    }
    this.content = extractIndentedInput(content);
    this.element = element;
    this.showCursor = showCursor;
    this.showTimeSignature = showTimeSignature;
    this.highlightBars = highlightBars;
    this.abcOptions = abcOptions;
    this.onClick = onClick;
    this.tune = null;
    this.cursor = null;
    this.barBox = null;
    this.voiceCount = 1;
    this.rendered = false;
    this.barBounds = [];
  }
  /**
   * Renders the UI inside the current element.
   * @returns The current ABCScore instance.
   */
  render(): ABCScore {
    this.baseRender();
    return this;
  }
  /**
   * Updates the score position (moving the cursor and highlighting the corresponding note).
   * @param position The new score position.
   * @returns The current ABCScore instance.
   */
  updatePosition(position: TransportPosition): ABCScore {
    if (!this.showCursor || !this.rendered) {
      return this;
    }
    Array.from({ length: this.voiceCount }, (_, i) => i).forEach((voice) =>
      this.updateVoicePosition(position, voice),
    );
    return this;
  }
  /**
   * Clears current note selection.
   * @returns The current ABCScore instance.
   */
  clearSelection(): ABCScore {
    /* istanbul ignore if  */
    if (!this.rendered) {
      return this;
    }
    this.getSVGElement()!
      .querySelectorAll<SVGGElement>(`.${cssClasses.selectedNote}`)
      .forEach((el) => {
        el.classList.remove(cssClasses.selectedNote);
        el.setAttribute("fill", "currentColor");
      });
    return this;
  }
  /**
   * Returns the <svg> element of the current instance.
   * @returns The <svg> element.
   */
  getSVGElement() {
    return this.element?.querySelector("svg");
  }
  /**
   * Returns the time signature of the current instance.
   * @returns The time signature.
   */
  getTimeSignature(): TimeSignature {
    const { num, den } = {
      num: 4,
      den: 4,
      ...(this.tune?.getMeterFraction() || {}),
    };
    return [num, den];
  }
  /**
   * Tells if the current score has no tempo indication.
   */
  hasFreeTempo() {
    return isTimeSignatureUnary(this.getTimeSignature());
  }
  /**
   * Highlights the bar at the passed position.
   * @param position The current transport position.
   * @returns The current ABCScore instance.
   */
  highlightBar(position: TransportPosition): ABCScore {
    if (!this.highlightBars || this.hasFreeTempo()) {
      return this;
    }
    if (position === "0:0:0") {
      this.resetBarBox();
      return this;
    }
    const bar = Number(position.split(":").at(0)!);
    const foundBarBound = this.barBounds[bar];
    if (!foundBarBound) {
      return this;
    }
    Object.entries(foundBarBound).forEach(([key, value]) =>
      this.barBox?.setAttribute(key, String(value)),
    );
    return this;
  }
  private computeBarBounds() {
    const svgElement = this.getSVGElement()!;
    const bars = svgElement.querySelectorAll<SVGGElement>(".abcjs-bar");
    const groupedBars = [...bars].reduce((memo, bar) => {
      const barNumber = Number(getValueFromNote(bar, "abcjs-mm"));
      const foundBar = memo.find((x) => x.barNumber === barNumber);
      return foundBar
        ? memo.map((x) =>
            x.barNumber === barNumber
              ? { ...x, voices: [...x.voices, bar.getBBox()] }
              : x,
          )
        : [
            ...memo,
            {
              barNumber,
              isFirstOfLine: Number(getValueFromNote(bar, "abcjs-m")) === 0,
              voices: [bar.getBBox()],
            },
          ];
    }, [] as GroupedBarsEntry[]);

    const staffLeftMostBarLine = svgElement.querySelector<SVGPathElement>(
      `.abcjs-staff-wrapper.abcjs-l0 path:last-child`,
    );

    this.barBounds = groupedBars.map(({ isFirstOfLine, voices }, index) => {
      let x = staffLeftMostBarLine ? staffLeftMostBarLine.getBBox().x : 0;
      const y = voices[0]!.y;
      let width = voices[0]!.x - x;
      const height = voices.reduce((memo, { height }) => memo + height, 0);
      if (!isFirstOfLine) {
        x = groupedBars[index - 1]!.voices[0]!.x;
        width = voices[0]!.x - x;
      }
      return { x, y, width, height };
    });
  }
  private resetBarBox() {
    ["x", "y", "width", "height"].forEach((x) =>
      this.barBox?.removeAttribute(x),
    );
  }
  private getBarNotes(position: TransportPosition, voice: number) {
    const svgElement = this.getSVGElement()!;
    const [bar] = position.split(":");
    return svgElement!.querySelectorAll<SVGGElement>(
      `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}.abcjs-v${voice}`,
    );
  }
  private updateVoicePosition(position: TransportPosition, voice: number) {
    const svgElement = this.getSVGElement()!;
    const timeSignature = this.getTimeSignature();

    let currentNote = null;

    if (this.hasFreeTempo()) {
      const [bar] = position.split(":");
      currentNote = svgElement!.querySelectorAll<SVGGElement>(
        `:is(.abcjs-note, .abcjs-rest).abcjs-v${voice}`,
      )[Number(bar)];
    } else {
      const barNotes = this.getBarNotes(position, voice);
      currentNote = getCurrentNote(barNotes, position, timeSignature);
    }

    if (!currentNote) {
      return;
    }

    svgElement
      .querySelectorAll(`.abcjs-v${voice}.${cssClasses.currentNote}`)
      .forEach((element) => element.classList.remove(cssClasses.currentNote));
    currentNote.classList.add(cssClasses.currentNote);
    this.updateCursor(currentNote);
  }
  private updateCursor(currentNote: SVGGElement): ABCScore {
    /* istanbul ignore if  */
    if (!this.rendered) {
      return this;
    }
    const lineNumber = getValueFromNote(currentNote, "abcjs-l");
    const line = this.getSVGElement()?.querySelector<SVGGElement>(
      `.abcjs-staff.abcjs-l${lineNumber}`,
    );
    const noteBox = currentNote.querySelector<SVGGElement>("path")?.getBBox();
    const lineBox = line?.getBBox();
    if (!noteBox || !lineBox) {
      return this;
    }
    this.cursor?.setAttribute("x1", String(noteBox.x! + cursorOffset));
    this.cursor?.setAttribute("x2", String(noteBox.x! + cursorOffset));
    this.cursor?.setAttribute("y1", String(lineBox.y! - cursorBleed));
    this.cursor?.setAttribute(
      "y2",
      String(lineBox.y! + lineBox.height! + cursorBleed),
    );
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
      /* istanbul ignore if  */
      if (!this.onClick) {
        return;
      }
      const currentNote = x.selectableElement as unknown as SVGGElement;
      const position = getNotePosition(currentNote, this.getTimeSignature());
      this.updateCursor(currentNote);
      this.onClick({ position });
    };

    this.tune = renderAbc(this.element, this.content, {
      ...DEFAULT_ABC_VISUAL_PARAMS,
      ...this.abcOptions,
      clickListener,
    }).at(0) as TuneObject;

    this.voiceCount = this.tune.makeVoicesArray().length;

    if (this.showCursor) {
      this.cursor = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      this.cursor.classList.add(cssClasses.cursor);
      this.getSVGElement()?.append(this.cursor);
    }

    if (this.highlightBars) {
      this.barBox = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      this.barBox.classList.add(cssClasses.barBox);
      this.getSVGElement()?.append(this.barBox);
      this.resetBarBox();
      this.computeBarBounds();
    }

    if (!this.showTimeSignature || this.hasFreeTempo()) {
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
