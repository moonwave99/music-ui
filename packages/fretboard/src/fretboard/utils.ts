import { kebabCase } from "change-case";
import type { Selection, BaseType } from "d3-selection";
import type { FretboardPosition, FretboardOptions } from "./Fretboard";

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
  return ["dot", prefix, kebabCase(key), valueRenderer(key, value)]
    .filter((x) => !!x)
    .join("-");
}

export function dotClasses(dot: FretboardPosition, prefix = ""): string {
  return [
    prefix ? `dot-${prefix}` : null,
    `dot-id-s${dot.string}:f${dot.fret}`,
    ...Object.entries(dot).map(([key, value]) => {
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

export function getDimensions({
  topPadding,
  bottomPadding,
  leftPadding,
  rightPadding,
  width,
  height,
  showFretNumbers,
  fretNumbersHeight,
}: {
  topPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
  width: number;
  height: number;
  showFretNumbers: boolean;
  fretNumbersHeight: number;
}): {
  totalWidth: number;
  totalHeight: number;
} {
  const totalWidth = width + leftPadding + rightPadding;
  let totalHeight = height + topPadding + bottomPadding;

  if (showFretNumbers) {
    totalHeight += fretNumbersHeight;
  }
  return { totalWidth, totalHeight };
}

type GetPositionParams = {
  event: MouseEvent;
  stringsGroup: Selection<
    BaseType,
    FretboardPosition,
    HTMLElement,
    FretboardPosition
  >;
  leftPadding: number;
  nutWidth: number;
  strings: number[];
  frets: number[];
  dots: FretboardPosition[];
};

export const getPositionFromMouseCoords = ({
  event,
  stringsGroup,
  leftPadding,
  nutWidth,
  strings,
  frets,
  dots,
}: GetPositionParams): FretboardPosition => {
  const { width: stringsGroupWidth, height: stringsGroupHeight } = (
    stringsGroup.node() as HTMLElement
  ).getBoundingClientRect();
  const bounds = (event.target as HTMLElement).getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;

  let foundString = 0;

  const stringDistance = stringsGroupHeight / (strings.length - 1);

  for (let i = 0; i < strings.length; i++) {
    if (y < stringDistance * (i + 1)) {
      foundString = i;
      break;
    }
  }

  let foundFret = -1;
  const percentX = (Math.max(0, x - leftPadding) / stringsGroupWidth) * 100;

  for (let i = 0; i < frets.length; i++) {
    if (percentX < frets[i]!) {
      foundFret = i;
      break;
    }
    foundFret = i;
  }

  if (x < leftPadding + nutWidth) {
    foundFret = 0;
  }

  const foundDot = dots.find(
    ({ fret, string }) => fret === foundFret && string === foundString + 1,
  );
  return (
    foundDot || {
      string: foundString + 1,
      fret: foundFret,
    }
  );
};

export function createHoverDiv({
  bottomPadding,
  showFretNumbers,
  fretNumbersHeight,
}: Pick<
  FretboardOptions,
  "bottomPadding" | "showFretNumbers" | "fretNumbersHeight"
>): HTMLDivElement {
  const hoverDiv = document.createElement("div");
  const bottom = bottomPadding + (showFretNumbers ? fretNumbersHeight : 0);
  hoverDiv.className = "hoverDiv";
  hoverDiv.style.position = "absolute";
  hoverDiv.style.top = "0";
  hoverDiv.style.bottom = `${bottom}px`;
  hoverDiv.style.left = "0";
  hoverDiv.style.right = "0";
  return hoverDiv;
}
