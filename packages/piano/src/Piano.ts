import { get as getNote } from "@tonaljs/note";
import { toMidi } from "@tonaljs/midi";
import { kebabCase } from "change-case";
import { querySelector, type NoteInput } from "@music-ui/core";
import { CHROMATIC_SCALE, normalizeInput, parseNoteInput } from "./lib";

export type ScaleNote = {
  chroma: number;
  color: "black" | "white";
  note: string;
};

export type ScaleNoteWithOctave = ScaleNote & {
  octave: number;
};

export type PianoOptions = {
  element: string | HTMLElement;
  startOctave: number;
  octaves: number;
  withFinalC: boolean;
};

export type GroupedInput = {
  group: number;
  note: string;
  label?: string;
}[];

const cssClasses = {
  piano: "piano",
  pianoWrapper: "piano-wrapper",
  key: "key",
  keyPlayed: "key-played",
  keyOn: "key-on",
} as const;

export const DEFAULT_PIANO_OPTIONS = {
  element: "#piano",
  startOctave: 3,
  octaves: 2,
  withFinalC: true,
} as PianoOptions;

export class Piano {
  private options: PianoOptions;
  private element: HTMLElement | null;
  /**
   * Creates a `Piano` instance.
   *
   * @param options the rendering options
   */
  constructor(options: Partial<PianoOptions> = {}) {
    this.options = Object.assign({}, DEFAULT_PIANO_OPTIONS, options);
    this.element = null;
  }
  /**
   * Highlights the passed notes. Sets the corresponding note labels if passed.
   *
   * @param notes the notes to be displayed
   * @param noteLabels the corresponding note labels
   */
  setNotes(notes: NoteInput, noteLabels?: NoteInput): Piano {
    this.clearNotes();
    this._setNotes(parseNoteInput(notes, noteLabels));
    return this;
  }
  /**
   * Clears all highlighted notes.
   */
  clearNotes(): Piano {
    this.element
      ?.querySelectorAll(`.${cssClasses.keyOn}`)
      .forEach((el: Element) => {
        el.classList.remove(cssClasses.keyOn);
        el.classList.remove(cssClasses.keyPlayed);
        el.innerHTML = "";
      });
    return this;
  }
  /**
   * Renders the UI inside the current element.
   */
  render(): Piano {
    this.baseRender();
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
   * @param notes the notes to be played
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
   */
  clearPlayedNotes(): Piano {
    this.element
      ?.querySelectorAll(`.${cssClasses.keyPlayed}`)
      .forEach((el: Element) => el.classList.remove(cssClasses.keyPlayed));
    return this;
  }
  private baseRender(): void {
    /* istanbul ignore if  */
    if (this.element) {
      return;
    }
    const { element, withFinalC, startOctave, octaves } = this.options;
    this.element = querySelector<HTMLElement>(element);
    if (!this.element) {
      throw new Error(`${element} not found)`);
    }
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
      foundKey.innerHTML = label;
    });
  }
}

function parseNote(
  noteString: string,
  defaultOctave: number,
): {
  chroma: number;
  note: string;
  octave: number;
  midi: number;
} {
  let octave = defaultOctave;
  const maybeOctave = noteString.slice(-1);
  if (Number.isInteger(+maybeOctave)) {
    octave = +maybeOctave;
    noteString = noteString.slice(0, -1);
  }
  const { chroma, pc: note, oct, midi } = getNote(`${noteString}${octave}`);
  return {
    chroma,
    note,
    octave: oct || 0,
    midi: midi || 0,
  };
}
