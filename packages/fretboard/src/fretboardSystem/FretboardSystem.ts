import { get as getNote, chroma as getChroma } from "@tonaljs/note";
import { distance, semitones } from "@tonaljs/interval";
import { get as getScale } from "@tonaljs/scale";

import { Systems, getBox, getModeFromScaleType } from "./systems/systems";
import {
  BareFretboardPosition,
  FretboardPosition,
  Tuning,
} from "../fretboard/Fretboard";
import { GUITAR_TUNINGS, DEFAULT_FRET_COUNT } from "../constants";

const MIN_FRET_COUNT = 12;

export type ScaleParams = {
  type: string;
  root: string;
  box?: {
    system: Systems;
    box: string | number;
  };
  displayBoxOnly?: boolean;
};

type GetOctaveParams = {
  fret: number;
  string: number;
  note: string;
  chroma: number;
};

export type SystemPosition = BareFretboardPosition & {
  chroma: number;
};

export type FretboardSystemParams = {
  tuning?: Tuning;
  fretCount?: number;
};

export class FretboardSystem {
  private tuning: Tuning = GUITAR_TUNINGS.default;
  private fretCount: number = DEFAULT_FRET_COUNT;
  private positions: SystemPosition[];
  private baseOctave: number;
  constructor(params?: FretboardSystemParams) {
    Object.assign(this, params);
    if (this.fretCount < MIN_FRET_COUNT) {
      this.fretCount = MIN_FRET_COUNT;
    }
    this.positions = [];
    const { octave: baseOctave } = parseNote(this.tuning[0]!);
    this.baseOctave = baseOctave;
    this.populate();
  }
  getTuning(): Tuning {
    return this.tuning;
  }
  getFretCount(): number {
    return this.fretCount;
  }
  getPositionAt({
    string,
    fret,
  }: BareFretboardPosition): SystemPosition | null {
    const foundPosition = this.positions.find(
      (x) => x.string === string && x.fret === fret,
    );
    return foundPosition || null;
  }
  getScale({
    type = "major",
    root: paramsRoot = "C",
    box,
  }: ScaleParams): FretboardPosition[] {
    const { baseOctave } = this;
    const { note: root } = parseNote(paramsRoot);
    const scaleName = `${root} ${type}`;
    const { notes, empty, intervals } = getScale(scaleName);

    if (empty) {
      throw new Error(`Cannot find scale: ${scaleName}`);
    }

    const mode = getModeFromScaleType(type);
    const boxPositions: FretboardPosition[] = box
      ? this.adjustOctave(getBox({ root, mode, ...box }), paramsRoot)
      : [];

    const reverseMap = notes.map((note, index) => ({
      chroma: getChroma(note),
      note,
      interval: intervals[index],
      degree: Number(intervals[index]![0]),
    }));

    return this.positions
      .filter(({ chroma }) => reverseMap.find((x) => x.chroma === chroma))
      .map(({ chroma, ...rest }) => ({
        ...reverseMap.find((x) => x.chroma === chroma)!,
        ...rest,
      }))
      .map((x) => {
        const octave = this.getOctave(x);
        return {
          octave,
          octaveInScale: getOctaveInScale({ root, octave, baseOctave, ...x }),
          inBox: Boolean(
            boxPositions.length &&
            isPositionInBox(x as FretboardPosition, boxPositions),
          ),
          ...x,
        } as FretboardPosition;
      });
  }
  private adjustOctave(
    positions: FretboardPosition[],
    root: string,
  ): BareFretboardPosition[] {
    const { tuning } = this;
    const rootOffset = semitones(distance(tuning[0]!, root)) >= 12;
    const negativeFrets = positions.filter((x) => x.fret < 0).length > 0;
    return positions.map(({ string, fret }) => ({
      string,
      fret: rootOffset || negativeFrets ? fret + 12 : fret,
    }));
  }
  private populate(): void {
    const { tuning, fretCount } = this;
    this.positions = tuning.toReversed().reduce((memo, note, index) => {
      const string = index + 1;
      const { chroma } = getNote(note);
      const filledString = Array.from({ length: fretCount + 1 }, (_, fret) => ({
        string,
        fret,
        chroma: (chroma + fret) % 12,
      }));
      return [...memo, ...filledString];
    }, [] as SystemPosition[]);
  }
  private getOctave({ fret, string, chroma, note }: GetOctaveParams): number {
    const { tuning } = this;
    const baseNoteWithOctave = tuning[tuning.length - string]!;
    const { note: baseNote, octave: baseOctave } =
      parseNote(baseNoteWithOctave);
    const baseChroma = getChroma(baseNote);

    let octaveIncrement = chroma < baseChroma ? 1 : 0;

    if (note === "B#" && octaveIncrement > 0) {
      octaveIncrement--;
    } else if (note === "Cb" && octaveIncrement === 0) {
      octaveIncrement++;
    }
    octaveIncrement += Math.floor(fret / 12);
    return baseOctave + octaveIncrement;
  }
}

export function isPositionInBox(
  { fret, string }: BareFretboardPosition,
  systemPositions: FretboardPosition[],
) {
  return !!systemPositions.find((x) => x.fret === fret && x.string === string);
}

function parseNote(note: string) {
  let octave = +note.slice(-1);
  let parsedNote = note;
  if (isNaN(octave)) {
    octave = 2;
  } else {
    parsedNote = note.slice(0, -1);
  }
  return {
    octave,
    note: parsedNote,
  };
}

type GetOctaveInScaleParams = {
  root: string;
  note: string;
  octave: number;
  baseOctave: number;
};

function getOctaveInScale({
  root,
  note,
  octave,
  baseOctave,
}: GetOctaveInScaleParams) {
  const noteChroma = getChroma(note) || 0;
  const rootChroma = getChroma(root) || 0;
  if (rootChroma > noteChroma) {
    return octave - 1 - baseOctave;
  }
  return octave - baseOctave;
}
