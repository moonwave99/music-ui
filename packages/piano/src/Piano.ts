import { get as getNote } from "@tonaljs/note";
import { toMidi } from "@tonaljs/midi";
import { kebabCase } from "change-case";

type ScaleNote = {
  chroma: number;
  color: "black" | "white";
  note: string;
};

type ScaleNoteWithOctave = ScaleNote & {
  octave: number;
};

const CHROMATIC_SCALE: ScaleNote[] = [
  {
    chroma: 0,
    color: "white",
    note: "C",
  },
  {
    chroma: 1,
    color: "black",
    note: "C#",
  },
  {
    chroma: 2,
    color: "white",
    note: "D",
  },
  {
    chroma: 3,
    color: "black",
    note: "D#",
  },
  {
    chroma: 4,
    color: "white",
    note: "E",
  },
  {
    chroma: 5,
    color: "white",
    note: "F",
  },
  {
    chroma: 6,
    color: "black",
    note: "F#",
  },
  {
    chroma: 7,
    color: "white",
    note: "G",
  },
  {
    chroma: 8,
    color: "black",
    note: "G#",
  },
  {
    chroma: 9,
    color: "white",
    note: "A",
  },
  {
    chroma: 10,
    color: "black",
    note: "A#",
  },
  {
    chroma: 11,
    color: "white",
    note: "B",
  },
] as const;

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

export type Options = {
  el: string | HTMLElement;
  startOctave: number;
  octaves: number;
  withFinalC: boolean;
};

export const DEFAULT_PIANO_OPTIONS = {
  el: "#piano",
  startOctave: 3,
  octaves: 2,
  withFinalC: true,
};

type SetNotesParams = string[] | Record<string, string[]>;

class Piano {
  private options: Options;
  private wrapper: HTMLElement | null;
  constructor(options = {}) {
    this.options = Object.assign({}, DEFAULT_PIANO_OPTIONS, options);
    this.wrapper = null;
  }
  setNotes(notes: SetNotesParams): Piano {
    this.clearNotes();
    if (Array.isArray(notes)) {
      this._setNotes(notes);
      return this;
    }
    for (const [key, value] of Object.entries(notes)) {
      this._setNotes(value, key);
    }

    return this;
  }
  clearNotes(): Piano {
    this.wrapper
      ?.querySelectorAll(".key-on")
      .forEach((el: Element) => el.classList.remove("key-on"));
    return this;
  }
  render(): Piano {
    this.baseRender();
    return this;
  }
  destroy(): void {
    this.wrapper?.remove();
  }
  private baseRender(): void {
    if (this.wrapper) {
      return;
    }
    const { el, withFinalC, startOctave, octaves } = this.options;

    this.wrapper = (
      typeof el === "string" ? document.querySelector(el) : el
    ) as HTMLElement;
    this.wrapper.classList.add("piano");

    const createKey = (note: ScaleNoteWithOctave): void => {
      const span = document.createElement("span");
      span.classList.add("key");
      const noteWithOctave = `${note.note}${note.octave}`;

      Object.entries({
        ...note,
        noteWithOctave,
        midi: toMidi(noteWithOctave),
      }).forEach(([key, value]) => {
        span.dataset[key] = `${value}`;
        span.classList.add(`${kebabCase(key)}-${value}`);
      });

      this.wrapper?.append(span);
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
  private _setNotes(notes: string[], type?: string): void {
    const middleOctave = this.getMiddleOctave();
    let octave = middleOctave;
    notes.forEach((n, index) => {
      if (index > 0 && n.startsWith("C")) {
        octave++;
      }
      const parsed = parseNote(n, octave);

      const foundKey = this.wrapper?.querySelector(`.key.midi-${parsed.midi}`);
      if (!foundKey) {
        return;
      }
      foundKey.classList.add("key-on");
      if (type) {
        foundKey.classList.add(`${type}`);
      }
    });
  }
}

export default Piano;
