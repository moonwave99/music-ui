import { toMidi } from "@tonaljs/midi";
import { kebabCase } from "change-case";
import {
  CHROMATIC_SCALE,
  ensureSelection,
  type NoteInput,
  type ElementOrSelector,
} from "@music-ui/core";
import { parseNote, normalizeInput, parseNoteInput } from "./lib";

/**
 * @property chroma The scientific pitch notation value of the pitch class (e.g. 0-11)
 * @property color The key color
 * @property note The pitch class of the note
 */
export type ScaleNote = {
  chroma: number;
  color: "black" | "white";
  note: string;
};

/**
 * Extends the ScaleNote type with the octave number.
 *
 * @property octave The octave of the note
 */
export type ScaleNoteWithOctave = ScaleNote & {
  octave: number;
};

/**
 * The options expected by the Piano constructor.
 *
 * @property element The Element where the piano will be rendered
 * @property startOctave The first rendered octave (e.g. 2 will start from C2)
 * @property octaves The count of rendered octaves
 * @property withFinalC Renders a final C key after the last octave
 * @property showOctaves Shows current octave on every C note
 */
export type PianoOptions = {
  element: ElementOrSelector<HTMLElement>;
  startOctave: number;
  octaves: number;
  withFinalC: boolean;
  showOctaves: boolean;
};

/**
 * GroupedInput allows to give different CSS classes to different note groups (e.g. left hand vs. right hand, or various voices).
 *
 * @property group The group id
 * @property note The note name
 * @property label The note label
 */
export type GroupedInput = {
  group: number;
  note: string;
  label?: string;
}[];

/**
 * The CSS classes used by the Piano class.
 *
 * @property {string} piano The outer wrapper class
 * @property {string} pianoWrapper The inner wrapper class (needed to handle overflow)
 * @property {string} key The piano key class
 * @property {string} keyPlayed The played key class
 * @property {string} keyOn The selected key class
 */
export const cssClasses = {
  piano: "piano",
  pianoWrapper: "piano-wrapper",
  controls: "controls",
  key: "key",
  keyPlayed: "key-played",
  keyOn: "key-on",
  octaveLabel: "octave-label",
} as const;

/**
 * @property {string} element The default selector
 * @property {number} startOctave The default start octave
 * @property {number} octaves The default octave count
 * @property {boolean} withFinalC The default final C display
 */
export const DEFAULT_PIANO_OPTIONS = {
  element: "#piano",
  startOctave: 3,
  octaves: 2,
  withFinalC: true,
  showOctaves: false,
} as PianoOptions;

export class Piano {
  private options: PianoOptions;
  private element: HTMLElement;
  private rendered: boolean;
  /**
   * Creates a `Piano` instance.
   *
   * @param options The rendering options
   */
  constructor(options: Partial<PianoOptions> = {}) {
    this.options = { ...DEFAULT_PIANO_OPTIONS, ...options };
    const element = ensureSelection(
      this.options.element as ElementOrSelector<HTMLElement>,
    ).at(0);
    if (!element) {
      throw new Error(`Element ${this.options.element} not found)`);
    }
    this.element = element;
    this.rendered = false;
  }
  /**
   * Highlights the passed notes. Sets the corresponding note labels if passed.
   *
   * Use an underscore in order to skip a note.
   *
   * @example
   * // will highlight C4, E4 and C5 with labels 1, 3 and 5
   * setNotes("C4 E4 G4", "1 3 5")
   *
   * @example
   * // will highlight C4, E4 and C5 with labels 1, (nothing) and 5
   * setNotes("C4 E4 G4", "1 _ 5")
   *
   * @param notes The notes to be displayed
   * @param noteLabels The corresponding note labels
   *
   * @returns The current Piano instance.
   */
  setNotes(notes: NoteInput, noteLabels?: NoteInput): Piano {
    this.clearNotes();
    this._setNotes(parseNoteInput(notes, noteLabels));
    return this;
  }
  /**
   * Clears all highlighted notes.
   * @returns The current Piano instance.
   */
  clearNotes(): Piano {
    this.element
      ?.querySelectorAll(`.${cssClasses.keyOn}`)
      .forEach((el: Element) => {
        el.classList.remove(cssClasses.keyOn);
        el.classList.remove(cssClasses.keyPlayed);
      });
    this.render();
    return this;
  }
  /**
   * Renders the UI inside the current element.
   * @returns The current Piano instance.
   */
  render(): Piano {
    this.baseRender();
    if (this.options.showOctaves) {
      this.showOctaves();
    }
    return this;
  }
  /**
   * Removes the current element from the DOM.
   */
  destroy(): void {
    this.element?.remove();
  }

  /**
   * Sets the passed notes as played.
   *
   * @param notes The notes to be played.
   * @returns The current Piano instance.
   */
  setPlayedNotes(notes: NoteInput): Piano {
    this.clearPlayedNotes();
    normalizeInput(notes).forEach((note) =>
      this.element
        ?.querySelector(`.midi-${toMidi(note)}`)
        ?.classList.add(cssClasses.keyPlayed),
    );
    return this;
  }
  /**
   * Clears all played notes.
   * @returns The current Piano instance.
   */
  clearPlayedNotes(): Piano {
    this.element
      ?.querySelectorAll(`.${cssClasses.keyPlayed}`)
      .forEach((el: Element) => el.classList.remove(cssClasses.keyPlayed));
    return this;
  }
  private baseRender(): void {
    /* istanbul ignore if  */
    if (this.rendered) {
      return;
    }
    const { withFinalC, startOctave, octaves } = this.options;
    this.element.classList.add(cssClasses.piano);

    const overFlowWrapper = document.createElement("div");
    overFlowWrapper.classList.add(cssClasses.pianoWrapper);
    this.element.append(overFlowWrapper);

    const createKey = (note: ScaleNoteWithOctave): void => {
      const span = document.createElement("span");
      span.classList.add(cssClasses.key);
      const noteWithOctave = `${note.note}${note.octave}`;

      Object.entries({
        ...note,
        noteWithOctave,
        midi: toMidi(noteWithOctave),
      }).forEach(([key, value]) => {
        span.dataset[key] = `${value}`;
        span.classList.add(`${kebabCase(key)}-${value}`);
      });

      overFlowWrapper.append(span);
    };

    Array.from({ length: octaves }, (_, octave) =>
      CHROMATIC_SCALE.forEach((x) =>
        createKey({
          ...x,
          octave: startOctave + octave,
        }),
      ),
    );

    if (withFinalC) {
      createKey({
        ...(CHROMATIC_SCALE[0] as ScaleNote),
        octave: startOctave + octaves,
      });
    }
    this.rendered = true;
  }
  private showOctaves() {
    this.element.querySelectorAll(".chroma-0").forEach((note, index) => {
      note.textContent = `C${this.options.startOctave + index}`;
      note.classList.add(cssClasses.octaveLabel);
    });
  }
  private getMiddleOctave(): number {
    const { startOctave, octaves } = this.options;
    return Math.round((startOctave + octaves) / 2) + 1;
  }
  private _setNotes(notes: GroupedInput): void {
    const middleOctave = this.getMiddleOctave();
    let octave = middleOctave;
    notes.forEach(({ group, note, label }, index) => {
      if (index > 0 && note.startsWith("C")) {
        octave++;
      }
      const parsed = parseNote(note, octave);
      const foundKey = this.element?.querySelector(`.midi-${parsed.midi}`);
      if (!foundKey) {
        return;
      }
      foundKey.classList.add("key-on", `group-${group + 1}`);
      if (!label) {
        return;
      }
      foundKey.classList.remove(cssClasses.octaveLabel);
      foundKey.innerHTML = label;
    });
  }
}
