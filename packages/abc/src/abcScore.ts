import {
  renderAbc,
  TuneObject,
  ClickListenerAnalysis,
  type AbcVisualParams,
} from "abcjs";
import { extractIndentedInput } from "@music-ui/core";
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
  timeSignature: "abcjs-time-signature",
  tempo: "abcjs-tempo",
  cursor: "abcjs-cursor",
  barBox: "abcjs-bar-box",
  currentNote: "abcjs-current-note",
  selectedNote: "abcjs-note_selected",
} as const;

/**
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

/**
 * @property position The current position of the score
 */
export type OnABCClickParams = {
  position: TransportPosition;
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
   * Clears current note selection
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
  getSVGElement() {
    return this.element?.querySelector("svg");
  }
  getTimeSignature(): TimeSignature {
    const { num, den } = {
      num: 4,
      den: 4,
      ...(this.tune?.getMeterFraction() || {}),
    };
    return [num, den];
  }
  highlightBar(position: TransportPosition): ABCScore {
    const svgElement = this.getSVGElement()!;
    const bar = Number(position.split(":").at(0)!);
    const leftBar = svgElement.querySelector(`.abcjs-bar.abcjs-mm${bar - 1}`)!;
    const rightBar = svgElement.querySelector(`.abcjs-bar.abcjs-mm${bar}`)!;
    const leftBarBox = leftBar?.querySelector<SVGGElement>("path")?.getBBox();
    const rightBarBox = rightBar?.querySelector<SVGGElement>("path")?.getBBox();

    const isFirstOfLine =
      getValueFromNote(
        svgElement.querySelector(`.abcjs-mm${bar}`)!,
        "abcjs-m",
      ) === 0;

    if (rightBarBox) {
      let x = isFirstOfLine ? 0 : leftBarBox?.x || 0;
      const y = rightBarBox.y;
      let width = isFirstOfLine
        ? rightBarBox.x
        : rightBarBox.x - (leftBarBox?.x || 0);

      let height = rightBarBox.height;
      if (this.voiceCount > 1) {
        const staffLine = getValueFromNote(
          svgElement.querySelector(`.abcjs-mm${bar}`)!,
          "abcjs-l",
        );

        const staffLeftMostBarLine = svgElement.querySelector<SVGPathElement>(
          `.abcjs-staff-wrapper.abcjs-l${staffLine} path:last-child`,
        );

        if (isFirstOfLine) {
          const xOffset = staffLeftMostBarLine!.getBBox().x;
          x = xOffset;
          width -= xOffset;
        }

        const rightBarLastVoice = svgElement.querySelector<SVGGElement>(
          `.abcjs-bar.abcjs-mm${bar}.abcjs-v${this.voiceCount - 1}`,
        );

        if (rightBarLastVoice) {
          height += rightBarLastVoice.getBBox().height;
        }
      }

      this.barBox?.setAttribute("x", String(x));
      this.barBox?.setAttribute("y", String(y));
      this.barBox?.setAttribute("width", String(width));
      this.barBox?.setAttribute("height", String(height));
    }
    return this;
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

    if (`${timeSignature}` === "1,1") {
      const [bar] = position.split(":");
      currentNote = svgElement!.querySelectorAll<SVGGElement>(
        `:is(.abcjs-note, .abcjs-rest).abcjs-v${voice}`,
      )[Number(bar)];
    } else {
      const barNotes = this.getBarNotes(position, voice);
      if (!barNotes.length) {
        return;
      }
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
    }

    const isTimeSignatureDenominatorOne =
      this.tune.getMeter().value?.at(0)!.den == 1;

    if (!this.showTimeSignature || isTimeSignatureDenominatorOne) {
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
