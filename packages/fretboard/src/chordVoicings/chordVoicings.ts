import { chroma as getChroma } from "@tonaljs/note";
import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import { CHORD_SYMBOLS, parseChord } from "../chords/chords";
import { drop3 } from "./drop3";
import { drop2 } from "./drop2";

const deriveMap = {
  maj7: [0, 0, 0, 0],
  "7": [0, 0, 0, -1],
  m7: [0, -1, 0, -1],
  m7b5: [0, -1, -1, -1],
  dim7: [0, -1, -1, -2],
} as const;

type VoicingSystem = {
  degrees: readonly (readonly VoicingDegree[])[];
  strings: Record<
    VoicingBaseString,
    Partial<
      Record<VoicingQuality, readonly (readonly (number | null)[])[]>
    > | null
  >;
};

export const voicingDegrees = [1, 3, 5, 7] as const;
export const voicingQualities = Object.keys(deriveMap) as VoicingQuality[];
export const voicingBaseStrings = [6, 5, 4] as const;
export const voicingInversions = [0, 1, 2, 3] as const;

type VoicingDegree = (typeof voicingDegrees)[number];
type VoicingType = keyof typeof voicingTypes;
type VoicingQuality = keyof typeof deriveMap;
type VoicingBaseString = (typeof voicingBaseStrings)[number];
type VoicingInversion = (typeof voicingInversions)[number];

export const voicingTypes = {
  drop2: computeVoicings(drop2),
  drop3: computeVoicings(drop3),
} as const;

/**
 * The params expected by the `getChordVoicing` function.
 * @property type The voicing type (e.g. drop2)
 * @property string The base string
 * @property root The root note
 * @property quality The chord quality
 * @property inversion The chord inversion
 * @property system The fretboard system context
 */
export type GetChordVoicingParams = {
  type: VoicingType;
  string: VoicingBaseString;
  root: string;
  quality?: VoicingQuality;
  inversion?: VoicingInversion;
  system: FretboardSystem;
};

/**
 * Returns the chord voicing for the given parameters.
 * @param __namedParameters The expected parameters.
 * @returns The chord voicing.
 */
export function getChordVoicing({
  root,
  type,
  string,
  quality = "maj7",
  inversion = 0,
  system,
}: GetChordVoicingParams) {
  if (!voicingTypes[type]) {
    console.warn(`Cannot find type: ${type} in dictionary`);
    return null;
  }

  if (!voicingTypes[type].strings[string]) {
    console.warn(
      `Cannot find chords based on the ${string} string for ${type} voicings`,
    );
    return null;
  }

  if (!voicingTypes[type].strings[string][quality]) {
    console.warn(
      `Cannot find quality ${quality} on the ${string} string for ${type} voicings`,
    );
    return null;
  }

  if (!voicingTypes[type].strings[string][quality][inversion]) {
    console.warn(
      `Cannot find the ${inversion} inversion of quality ${quality} on the ${string} string for ${type} voicings`,
    );
    return null;
  }

  const reversedDegrees = voicingTypes[type].degrees
    .at(inversion)!
    .toReversed();

  const chord = parseChord({
    input: getShorthand({
      root,
      input: voicingTypes[type].strings[string][quality][inversion],
    }),
    chordName: `${root}${quality}`,
    system,
    includeOpenStrings: true,
  });

  return {
    ...chord,
    positions: chord.positions.map((x, index) => ({
      ...x,
      degree: reversedDegrees[index]!,
    })),
  };
}

/**
 * Get the strings where the passing voicing type can be based on.
 * @param type The voicing type (e.g. drop2)
 * @returns The base voicing strings
 */
export function getVoicingTypeStrings(type: VoicingType) {
  return Object.entries(voicingTypes[type].strings)
    .map(([string, value]) => {
      return value ? Number(string) : null;
    })
    .filter(Boolean) as VoicingBaseString[];
}

type GetShorthandParams = {
  input: readonly (number | null)[];
  root: string;
};

function getShorthand({ input, root }: GetShorthandParams) {
  const delta = getChroma("C") - getChroma(root);
  const transposed = input.map((x) => (x === null ? null : Number(x) - delta));
  const hasNegatives = transposed.some((x) => Number(x) < 0);
  const adjusted = hasNegatives
    ? transposed.map((x) => (x === null ? null : x + 12))
    : transposed;
  const exceedsOctave = adjusted.filter(Boolean).every((x) => Number(x) >= 12);

  return adjusted
    .map((x) => (x !== null && exceedsOctave ? x - 12 : x))
    .map((x) => (x === null ? "x" : x))
    .join(adjusted.some((x) => Number(x) >= 10) ? CHORD_SYMBOLS.splitter : "");
}

type DeriveVoicingParams = {
  degrees: readonly VoicingDegree[];
  original: readonly (number | null)[];
  quality: VoicingQuality;
};

function deriveVoicing({ degrees, original, quality }: DeriveVoicingParams) {
  const delta = getDeriveDelta(degrees, quality);
  let i = 0;
  return original.map((x) => {
    if (x === null) {
      return null;
    }
    return (x += delta[i++]!);
  });
}

function getDeriveDelta(
  degrees: readonly VoicingDegree[],
  quality: VoicingQuality,
) {
  const delta = deltaToObject(deriveMap[quality]);
  return degrees.map((x) => delta[x]!);
}

function deltaToObject(delta: readonly number[]) {
  return {
    1: delta[0],
    3: delta[1],
    5: delta[2],
    7: delta[3],
  };
}

function computeVoicings(input: VoicingSystem) {
  Object.values(input.strings).map((entry) => {
    if (entry === null) {
      return entry;
    }
    voicingQualities.forEach((quality) => {
      entry[quality] = entry.maj7!.map((original, index) =>
        deriveVoicing({ original, quality, degrees: input.degrees[index]! }),
      );
    });
  });
  return input;
}
