import { get as getNote, chroma as getChroma } from "@tonaljs/note";
import { distance, semitones } from "@tonaljs/interval";
import { get as getScale } from "@tonaljs/scale";
import { parseNote } from "@music-ui/core";

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
  disableOtherBoxes?: boolean;
  displayBoxOnly?: boolean;
};

export type SystemPosition = BareFretboardPosition & {
  chroma: number;
  octave: number;
};

/**
 * Options accepted by the Fretboard constructor.
 * @property tuning The instrument tuning
 * @property fretCount The instrument fret count
 */
export type FretboardSystemParams = {
  tuning?: Tuning;
  fretCount?: number;
};

export class FretboardSystem {
  private tuning: Tuning = GUITAR_TUNINGS.default;
  private fretCount: number = DEFAULT_FRET_COUNT;
  private positions: SystemPosition[];
  private baseOctave: number;
  /**
   * Creates a `FretboardSystem` instance.
   *
   * @param params The accepted params
   */
  constructor(params?: FretboardSystemParams) {
    Object.assign(this, params);
    this.fretCount = Math.max(this.fretCount, MIN_FRET_COUNT);
    this.positions = [];
    const { octave: baseOctave } = parseNote(this.tuning[0]!);
    this.baseOctave = baseOctave;
    this.populate();
  }
  /**
   * Returns the instance tuning
   *
   * @returns The instance tuning
   */
  getTuning(): Tuning {
    return this.tuning;
  }
  /**
   * Returns the instance fret count
   *
   * @returns The instance fret count
   */
  getFretCount(): number {
    return this.fretCount;
  }
  /**
   * Returns the position information at the given string and fret
   *
   * @param __namedParameters The expected parameters
   * @returns The found position
   */
  getPositionAt(position: BareFretboardPosition): SystemPosition | null {
    return (
      findPositionInArray<SystemPosition>(position, this.positions) || null
    );
  }
  /**
   * Returns the position information for the passed scale parameters.
   *
   * @param __namedParameters The expected parameters
   * @returns The scale positions
   */
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
    const boxPositions: BareFretboardPosition[] = box
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
        const octave = adjustEnharmonicsOctave(x);
        return {
          octaveInScale: getOctaveInScale({ root, baseOctave, ...x, octave }),
          inBox: Boolean(
            boxPositions.length && !!findPositionInArray(x, boxPositions),
          ),
          ...x,
          octave,
        } as FretboardPosition;
      });
  }
  private adjustOctave(
    positions: BareFretboardPosition[],
    root: string,
  ): BareFretboardPosition[] {
    const { tuning } = this;
    const rootOffset = semitones(distance(tuning[0]!, root)) >= 12;
    const negativeFrets = positions.some((x) => x.fret < 0);
    return positions.map(({ string, fret }) => ({
      string,
      fret: rootOffset || negativeFrets ? fret + 12 : fret,
    }));
  }
  private populate(): void {
    const { tuning, fretCount } = this;
    this.positions = tuning.toReversed().reduce((memo, note, index) => {
      const string = index + 1;
      const { chroma, oct } = getNote(note);
      const filledString = Array.from({ length: fretCount + 1 }, (_, fret) => ({
        string,
        fret,
        chroma: (chroma + fret) % 12,
        octave: oct! + Math.floor((chroma + fret) / 12),
      }));
      return [...memo, ...filledString];
    }, [] as SystemPosition[]);
  }
}

/**
 * Finds a position in a list of positions by the passed coordinates.
 *
 * @param param0 The lookup coordinates
 * @param array The haystack array
 * @returns The found position
 */
export function findPositionInArray<T extends BareFretboardPosition>(
  { fret, string }: BareFretboardPosition,
  array: T[],
) {
  return array.find((x) => x.fret === fret && x.string === string);
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

function adjustEnharmonicsOctave({
  note,
  octave,
}: Pick<FretboardPosition, "note" | "octave">) {
  if (note === "B#") {
    return octave! - 1;
  }
  if (note === "Cb") {
    return octave! + 1;
  }
  return octave!;
}
