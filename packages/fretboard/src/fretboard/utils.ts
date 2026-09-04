import { kebabCase } from "change-case";
import type { FretboardOptions, FretboardPosition, Point } from "./Fretboard";

type GetStringThicknessParams = {
  stringWidth: number | number[];
  stringIndex: number;
};

export function getStringThickness({
  stringWidth,
  stringIndex,
}: GetStringThicknessParams): number {
  if (typeof stringWidth === "number") {
    return stringWidth;
  }
  return stringWidth[stringIndex] || 1;
}

type GenerateStringsParams = {
  stringCount: number;
  stringWidth: number | number[];
  height: number;
};

export function generateStrings({
  stringCount,
  stringWidth,
  height,
}: GenerateStringsParams): number[] {
  const strings = [];
  let currentStringWidth = 0;

  for (let i = 0; i < stringCount; i++) {
    currentStringWidth = getStringThickness({ stringWidth, stringIndex: i });
    let y = (height / (stringCount - 1)) * i;
    if (i === 0) {
      y += currentStringWidth / 2;
    }
    if (i === stringCount - 1) {
      y -= currentStringWidth / 2;
    }
    strings.push(y);
  }
  return strings;
}

export function generateFrets({
  scaleFrets,
  fretCount,
}: {
  scaleFrets: boolean;
  fretCount: number;
}): number[] {
  const fretRatio = Math.pow(2, 1 / 12);
  const frets = [0];

  for (let i = 1; i <= fretCount; i++) {
    let x = (100 / fretCount) * i;
    if (scaleFrets) {
      x = 100 - 100 / Math.pow(fretRatio, i);
    }
    frets.push(x);
  }
  return frets.map((x) => (x / frets[frets.length - 1]!) * 100);
}

const accidentalMap: { symbol: string; replacement: string }[] = [
  {
    symbol: "##",
    replacement: "double-sharp",
  },
  {
    symbol: "bb",
    replacement: "double-flat",
  },
  {
    symbol: "#",
    replacement: "sharp",
  },
  {
    symbol: "b",
    replacement: "flat",
  },
] as const;

function valueRenderer(
  key: string,
  value: string | number | boolean,
): string | null {
  if (typeof value === "boolean") {
    return !value ? "false" : null;
  }
  if (key === "note") {
    for (let i = 0; i < accidentalMap.length; i++) {
      const { symbol, replacement } = accidentalMap[i]!;
      if (`${value}`.endsWith(symbol)) {
        return `${`${value}`[0]}-${replacement}`;
      }
    }
    return `${value}`;
  }
  return `${value}`;
}

function classRenderer(
  prefix: string,
  key: string,
  value: string | number | boolean,
): string {
  return ["position", prefix, kebabCase(key), valueRenderer(key, value)]
    .filter((x) => !!x)
    .join("-");
}

export function getPositionClasses(
  position: FretboardPosition,
  prefix = "",
): string {
  return [
    prefix ? `position-${prefix}` : null,
    `position-id-s${position.string}:f${position.fret}`,
    ...Object.entries(position).map(([key, value]) => {
      let valArray;
      if (!(value instanceof Array)) {
        valArray = [value];
      } else {
        valArray = value;
      }
      return valArray
        .map((value) => classRenderer(prefix, key, value))
        .join(" ");
    }),
  ]
    .filter(Boolean)
    .join(" ");
}

type GetDimensionsParams = Pick<
  FretboardOptions,
  | "paddingTop"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
  | "width"
  | "height"
  | "showFretNumbers"
  | "fretNumbersHeight"
>;

type Dimensions = {
  totalWidth: number;
  totalHeight: number;
};

export function getDimensions({
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  width,
  height,
  showFretNumbers,
  fretNumbersHeight,
}: GetDimensionsParams): Dimensions {
  const totalWidth = width + paddingLeft + paddingRight;
  let totalHeight = height + paddingTop + paddingBottom;

  if (showFretNumbers) {
    totalHeight += fretNumbersHeight;
  }
  return { totalWidth, totalHeight };
}

type GetPositionCoordsParams = {
  fret: number;
  string: number;
  frets: number[];
  strings: number[];
};

function getPositionCoords({
  fret,
  string,
  frets,
  strings,
}: GetPositionCoordsParams): Point {
  let x = 0;
  if (fret === 0) {
    x = frets[0]! / 2;
  } else {
    x = frets[fret]! - (frets[fret]! - frets[fret - 1]!) / 2;
  }
  return { x, y: strings[string - 1]! };
}

export function generateGrid({
  fretCount,
  stringCount,
  frets,
  strings,
}: {
  fretCount: number;
  stringCount: number;
  frets: number[];
  strings: number[];
}): Point[][] {
  const positions = [];
  for (let string = 1; string <= stringCount; string++) {
    const currentString = [];
    for (let fret = 0; fret <= fretCount; fret++) {
      currentString.push(getPositionCoords({ fret, string, frets, strings }));
    }
    positions.push(currentString);
  }
  return positions;
}

export function validateOptions(options: FretboardOptions): void {
  const { stringCount, tuning } = options;
  if (stringCount !== tuning.length) {
    throw new Error(
      `stringCount (${stringCount}) and tuning size (${tuning.length}) do not match`,
    );
  }
}

export function getBounds(area: FretboardPosition[]): {
  bottomLeft: FretboardPosition;
  bottomRight: FretboardPosition;
  topRight: FretboardPosition;
  topLeft: FretboardPosition;
} {
  const getMinMax = (what: "string" | "fret"): [number, number] => [
    Math.min(...area.map((x) => x[what])),
    Math.max(...area.map((x) => x[what])),
  ];

  const [minString, maxString] = getMinMax("string");
  const [minFret, maxFret] = getMinMax("fret");

  return {
    bottomLeft: { string: maxString, fret: minFret },
    bottomRight: { string: maxString, fret: maxFret },
    topRight: { string: minString, fret: maxFret },
    topLeft: { string: minString, fret: minFret },
  };
}
