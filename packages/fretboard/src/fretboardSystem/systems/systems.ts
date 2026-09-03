import { chroma as getChroma } from "@tonaljs/note";
import { get as getMode } from "@tonaljs/mode";
import { FretboardPosition } from "../../fretboard/Fretboard";

export type Systems = "pentatonic" | "CAGED" | "TNPS";

type ScaleDefinition = {
  box: string[];
  baseChroma: number;
  baseOctave: number;
};

const DEFAULT_MODE = 0;
const DEFAULT_PENTATONIC_MODE = 5;
const CAGED_ORDER = "GEDCA";

const CAGEDDefinition: ScaleDefinition[] = [
  {
    box: ["-6-71", "-34-5", "71-2-", "-5-6-", "-2-34", "-6-71"],
    baseChroma: getChroma("G#"),
    baseOctave: 2,
  },
  {
    box: ["71-2", "-5-6", "2-34", "6-71", "34-5", "71-2"],
    baseChroma: getChroma("E#"),
    baseOctave: 2,
  },
  {
    box: ["-2-34", "-6-71", "34-5", "71-2-", "-5-6-", "-2-34"],
    baseChroma: getChroma("D#"),
    baseOctave: 3,
  },
  {
    box: ["34-5", "71-2", "5-6-", "2-34", "6-71", "34-5"],
    baseChroma: getChroma("C"),
    baseOctave: 3,
  },
  {
    box: ["-5-6-", "-2-34", "6-71-", "34-5-", "71-2-", "-5-6-"],
    baseChroma: getChroma("A#"),
    baseOctave: 2,
  },
];

const TNPSDefinition: ScaleDefinition[] = [
  {
    box: ["--2-34", "--6-71", "-34-5-", "-71-2-", "4-5-6-", "1-2-3-"],
    baseChroma: getChroma("E"),
    baseOctave: 2,
  },
  {
    box: ["--34-5", "--71-2", "4-5-6-", "1-2-3-", "5-6-7-", "2-34--"],
    baseChroma: getChroma("D"),
    baseOctave: 3,
  },
  {
    box: ["-4-5-6", "-1-2-3", "5-6-7-", "2-34--", "6-71--", "34-5--"],
    baseChroma: getChroma("C"),
    baseOctave: 3,
  },
  {
    box: ["--5-6-7", "--2-34-", "-6-71--", "-34-5--", "-71-2--", "4-5-6--"],
    baseChroma: getChroma("B"),
    baseOctave: 2,
  },
  {
    box: ["--6-71", "--34-5", "-71-2-", "4-5-6-", "1-2-3-", "5-6-7-"],
    baseChroma: getChroma("A"),
    baseOctave: 2,
  },
  {
    box: ["--71-2", "-4-5-6", "1-2-3-", "5-6-7-", "2-34--", "6-71--"],
    baseChroma: getChroma("G"),
    baseOctave: 2,
  },
  {
    box: ["-1-2-3", "-5-6-7", "2-34--", "6-71--", "34-5--", "71-2--"],
    baseChroma: getChroma("F"),
    baseOctave: 2,
  },
];

export function getModeFromScaleType(type: string): number {
  const { modeNum } = getMode(type.replace("pentatonic", "").trim());
  return modeNum;
}

function getModeOffset(mode: number): number {
  return getChroma("CDEFGAB".split("")[mode]!);
}

function getPentatonicBoxIndex(box: number, mode: number): number {
  if (mode === DEFAULT_PENTATONIC_MODE) {
    return box - 1;
  }
  return box % 5;
}

type GetBoxPositionsParams = {
  root: string;
  box: string[];
  modeOffset: number;
  baseChroma: number;
};

function getBoxPositions({
  root,
  box,
  modeOffset = 0,
  baseChroma,
}: GetBoxPositionsParams): FretboardPosition[] {
  let delta = getChroma(root) - baseChroma - modeOffset;
  while (delta < -1) {
    delta += 12;
  }
  return box.reduce(
    (memo, item, string) => [
      ...memo,
      ...item
        .split("")
        .map((x, i) =>
          x !== "-" ? { string: string + 1, fret: i + delta } : null,
        )
        .filter((x) => !!x),
    ],
    [] as FretboardPosition[],
  );
}

type GetBoxParams = {
  root: string;
  box: number | string;
  mode?: number | string;
  system: Systems;
};

export function getBox({
  root,
  mode = -1,
  system,
  box,
}: GetBoxParams): FretboardPosition[] {
  let foundBox;
  let modeNumber =
    system === "pentatonic" ? DEFAULT_PENTATONIC_MODE : DEFAULT_MODE;

  if (typeof mode === "string") {
    modeNumber = getModeFromScaleType(mode);
  } else if (mode > -1) {
    modeNumber = mode;
  }

  switch (system) {
    case "pentatonic":
      foundBox = CAGEDDefinition[getPentatonicBoxIndex(+box, modeNumber)];
      break;
    case "CAGED":
      foundBox = CAGEDDefinition[CAGED_ORDER.indexOf(`${box}`)];
      break;
    case "TNPS":
      foundBox = TNPSDefinition[+box - 1];
      break;
  }

  if (!foundBox) {
    throw new Error(`Cannot find box ${box} in the ${system} scale system`);
  }

  const { baseChroma, box: boxDefinition } = foundBox;

  return getBoxPositions({
    root,
    modeOffset: getModeOffset(modeNumber),
    baseChroma,
    box:
      system === "pentatonic"
        ? boxDefinition.map((x) => x.replace("4", "-").replace("7", "-"))
        : boxDefinition,
  });
}
