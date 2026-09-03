import { select, Selection, ValueFn, BaseType } from "d3-selection";

import {
  generateStrings,
  generateFrets,
  getStringThickness,
  getPositionClasses,
  getDimensions,
} from "./utils";

import { parseChord } from "../chords/chords";

import {
  MIDDLE_FRET,
  GUITAR_TUNINGS,
  DEFAULT_COLORS,
  DEFAULT_DIMENSIONS,
  DEFAULT_FRET_COUNT,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_HIGHLIGHT_BLEND_MODE,
} from "../constants";

import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import { Systems } from "../fretboardSystem/systems/systems";

export type Tuning = string[];

export type FretboardPosition = {
  string: number;
  fret: number;
  note?: string;
  disabled?: boolean;
  octave?: number;
  octaveInScale?: number;
  inBox?: boolean;
  interval?: string;
  degree?: number;
  chroma?: number;
} & Record<string, string | number | boolean | Array<string | number>>;

type MouseEventNames = keyof Pick<
  HTMLElementEventMap,
  {
    [P in keyof HTMLElementEventMap]: HTMLElementEventMap[P] extends MouseEvent
      ? P
      : never;
  }[keyof HTMLElementEventMap]
>;

export type Barre = {
  fret: number;
  stringFrom?: number;
  stringTo?: number;
};

export const DEFAULT_FRETBOARD_OPTIONS = {
  element: "#fretboard",
  tuning: GUITAR_TUNINGS.default,
  stringCount: 6,
  stringWidth: DEFAULT_DIMENSIONS.line,
  stringColor: DEFAULT_COLORS.line,
  fretCount: DEFAULT_FRET_COUNT,
  fretWidth: DEFAULT_DIMENSIONS.line,
  fretColor: DEFAULT_COLORS.line,
  nutWidth: DEFAULT_DIMENSIONS.nut,
  nutColor: DEFAULT_COLORS.line,
  middleFretColor: DEFAULT_COLORS.highlight,
  middleFretWidth: 3 * DEFAULT_DIMENSIONS.line,
  scaleFrets: true,
  crop: false,
  fretLeftPadding: 0,
  topPadding: DEFAULT_DIMENSIONS.unit,
  bottomPadding: DEFAULT_DIMENSIONS.unit * 0.75,
  leftPadding: DEFAULT_DIMENSIONS.unit,
  rightPadding: DEFAULT_DIMENSIONS.unit,
  height: DEFAULT_DIMENSIONS.height,
  width: DEFAULT_DIMENSIONS.width,
  positionSize: DEFAULT_DIMENSIONS.unit,
  positionStrokeColor: DEFAULT_COLORS.positionStroke,
  positionStrokeWidth: 2 * DEFAULT_DIMENSIONS.line,
  positionTextSize: DEFAULT_FONT_SIZE,
  positionFill: DEFAULT_COLORS.positionFill,
  positionText: (): string => "",
  disabledOpacity: 0.9,
  showFretNumbers: true,
  fretNumbersHeight: 2 * DEFAULT_DIMENSIONS.unit,
  fretNumbersMargin: DEFAULT_DIMENSIONS.unit,
  fretNumbersColor: DEFAULT_COLORS.line,
  font: DEFAULT_FONT_FAMILY,
  barresColor: DEFAULT_COLORS.barres,
  highlightPadding: DEFAULT_DIMENSIONS.unit * 0.5,
  highlightRadius: DEFAULT_DIMENSIONS.unit * 0.5,
  highlightStroke: DEFAULT_COLORS.highlightStroke,
  highlightFill: DEFAULT_COLORS.highlightFill,
  highlightBlendMode: DEFAULT_HIGHLIGHT_BLEND_MODE,
};

export const defaultMuteStringsParams = {
  strings: [] as number[],
  width: 15,
  strokeWidth: 5,
  stroke: DEFAULT_COLORS.mutedString,
};

export type FretboardOptions = {
  element: string | HTMLElement;
  tuning: Tuning;
  stringCount: number;
  stringWidth: number | number[];
  stringColor: string;
  fretCount: number;
  fretWidth: number;
  fretColor: string;
  nutWidth: number;
  nutColor: string;
  middleFretColor: string;
  middleFretWidth: number;
  scaleFrets: boolean;
  topPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
  height: number;
  width: number;
  positionSize: number;
  positionStrokeColor: string;
  positionStrokeWidth: number;
  positionTextSize: number;
  positionFill: string;
  positionText: ValueFn<BaseType, FretboardPosition, string>;
  disabledOpacity: number;
  showFretNumbers: boolean;
  fretNumbersHeight: number;
  fretNumbersMargin: number;
  fretNumbersColor: string;
  crop: boolean;
  fretLeftPadding: number;
  font: string;
  barresColor: string;
  highlightPadding: number;
  highlightRadius: number;
  highlightStroke: string;
  highlightFill: string;
  highlightBlendMode: string;
};

type Rec = Record<string, string | number | boolean>;

type Point = {
  x: number;
  y: number;
};

type MuteStringsParams = {
  strings: number[];
  width?: number;
  strokeWidth?: number;
  stroke?: string;
};

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

function generateGrid({
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

function validateOptions(options: FretboardOptions): void {
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

export class Fretboard {
  strings: number[];
  frets: number[];
  grid: Point[][];
  svg: Selection<
    SVGSVGElement,
    FretboardPosition,
    HTMLElement,
    FretboardPosition
  >;
  wrapper: Selection<
    SVGGElement,
    FretboardPosition,
    HTMLElement,
    FretboardPosition
  >;
  private options: FretboardOptions;
  private baseRendered = false;
  private handlers: Partial<
    Record<MouseEventNames, (event: MouseEvent) => void>
  > = {};
  private system: FretboardSystem;
  private positions: FretboardPosition[] = [];
  constructor(options: Partial<FretboardOptions> = {}) {
    this.options = { ...DEFAULT_FRETBOARD_OPTIONS, ...options };
    validateOptions(this.options);
    const {
      element,
      height,
      width,
      leftPadding,
      topPadding,
      stringCount,
      stringWidth,
      fretCount,
      scaleFrets,
      tuning,
    } = this.options;

    this.strings = generateStrings({ stringCount, height, stringWidth });
    this.frets = generateFrets({ fretCount, scaleFrets });
    const { totalWidth, totalHeight } = getDimensions(this.options);

    this.system = new FretboardSystem({
      fretCount,
      tuning,
    });

    this.grid = generateGrid({
      ...this,
      ...this.options,
    });

    this.svg = select<BaseType, FretboardPosition>(element as string)
      .append("div")
      .attr("class", "fretboard-html-wrapper")
      .attr("style", "position: relative")
      .append("svg")
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);

    this.wrapper = this.svg
      .append("g")
      .attr("class", "fretboard-wrapper")
      .attr(
        "transform",
        `translate(${leftPadding}, ${topPadding}) scale(${width / totalWidth})`,
      );
  }

  render(): Fretboard {
    const { wrapper, grid, options } = this;
    const {
      font,
      positionStrokeColor,
      positionStrokeWidth,
      positionFill,
      positionSize,
      positionText,
      positionTextSize,
      disabledOpacity,
    } = this.options;

    const positionOffset = this.getPositionOffset();

    this.baseRender(positionOffset);

    wrapper.select(".positions").remove();

    const positions = this.positions.filter(
      ({ fret }) => fret <= options.fretCount + positionOffset,
    );
    if (!positions.length) {
      return this;
    }

    const positionGroup = wrapper
      .append("g")
      .attr("class", "positions")
      .attr("font-family", font);

    const positionNodes = positionGroup
      .selectAll("g")
      .data(positions)
      .enter()
      .filter(({ fret }) => fret >= 0)
      .append("g")
      .attr("class", (position) =>
        ["position", getPositionClasses(position, "")].join(" "),
      )
      .attr("opacity", ({ disabled }) => (disabled ? disabledOpacity : 1));

    positionNodes
      .append("circle")
      .attr("class", "position-circle")
      .attr(
        "cx",
        ({ string, fret }) => `${grid[string - 1]![fret - positionOffset]!.x}%`,
      )
      .attr(
        "cy",
        ({ string, fret }) => grid[string - 1]![fret - positionOffset]!.y,
      )
      .attr("r", positionSize * 0.5)
      .attr("stroke", positionStrokeColor)
      .attr("stroke-width", positionStrokeWidth)
      .attr("fill", positionFill);

    positionNodes
      .append("text")
      .attr("class", "position-text")
      .attr(
        "x",
        ({ string, fret }) => `${grid[string - 1]![fret - positionOffset]!.x}%`,
      )
      .attr(
        "y",
        ({ string, fret }) => grid[string - 1]![fret - positionOffset]!.y,
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", positionTextSize)
      .text(positionText);

    return this;
  }

  setPositions(positions: FretboardPosition[]): Fretboard {
    this.positions = positions;
    return this;
  }

  clear(): Fretboard {
    this.setPositions([]);
    this.wrapper.select(".positions").remove();
    return this;
  }

  style({
    filter = () => true,
    ...opts
  }: {
    [key: string]:
      | string
      | number
      | ValueFn<BaseType, FretboardPosition, number | boolean | string>;
  } & {
    filter?: (position: FretboardPosition) => boolean;
  }): Fretboard {
    const { wrapper } = this;
    const { positionTextSize } = this.options;
    const filterFunction =
      filter instanceof Function
        ? filter
        : (position: FretboardPosition): boolean => {
            const [key, value] = Object.entries(filter)[0]!;
            return position[key] === value;
          };

    const positions = wrapper
      .selectAll<BaseType, FretboardPosition>(".position-circle")
      .filter(filterFunction);

    Object.keys(opts).forEach((key) =>
      positions.attr(key, (opts as Rec)[key]!),
    );

    if (opts.text) {
      wrapper
        .selectAll<BaseType, FretboardPosition>(".position-text")
        .filter(filterFunction)
        .text(opts.text)
        .attr("font-size", opts.fontSize || positionTextSize)
        .attr("fill", opts.fontFill || DEFAULT_COLORS.positionText);
    }

    return this;
  }

  muteStrings(params: MuteStringsParams): Fretboard {
    const { wrapper, grid } = this;

    const { strings, stroke, strokeWidth, width } = {
      ...defaultMuteStringsParams,
      ...params,
    };

    wrapper
      .append("g")
      .attr("class", "muted-strings")
      .attr("transform", `translate(${-width / 2}, ${-width / 2})`)
      .selectAll("path")
      .data(strings)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const { y } = grid[d - 1]![0]!;
        return [
          `M 0 ${y}`,
          `L ${width} ${y + width}`,
          `M ${width} ${y}`,
          `L 0 ${y + width}`,
        ].join(" ");
      })
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("class", "muted-string");

    return this;
  }

  renderChord(chord: string, barres?: Barre | Barre[]): Fretboard {
    const { positions, mutedStrings: strings } = parseChord(chord);
    this.setPositions(positions);
    if (barres) {
      this.renderBarres(Array.isArray(barres) ? barres : [barres]);
    }
    this.render();
    this.muteStrings({ strings });
    return this;
  }

  renderScale({
    type,
    root,
    box,
  }: {
    type: string;
    root: string;
    box?: {
      system: Systems;
      box: string | number;
    };
  }): Fretboard {
    if (
      box &&
      this.options.tuning.toString() !== GUITAR_TUNINGS.default.toString()
    ) {
      console.warn(
        "Selected scale system works for standard tuning. Wrong notes may be highlighted.",
      );
    }
    return this.setPositions(
      this.system.getScale({ type, root, box }),
    ).render();
  }

  renderBox({
    type,
    root,
    box,
  }: {
    type: string;
    root: string;
    box?: {
      system: Systems;
      box: string | number;
    };
  }): Fretboard {
    if (this.options.tuning.toString() !== GUITAR_TUNINGS.default.toString()) {
      console.warn(
        "Selected scale system works for standard tuning. Wrong notes may be highlighted.",
      );
    }

    return this.setPositions(
      this.system.getScale({ type, root, box }).filter(({ inBox }) => inBox),
    ).render();
  }

  highlightAreas(
    ...areas: [FretboardPosition, FretboardPosition][]
  ): Fretboard {
    const { wrapper, options, grid } = this;
    const {
      width,
      positionSize,
      highlightPadding,
      highlightFill,
      highlightStroke,
      highlightBlendMode,
      highlightRadius,
    } = options;

    const highlightGroup = wrapper.append("g").attr("class", "highlight-areas");

    const positionPercentSize = (positionSize / width) * 100;
    const highlightPaddingPercentSize = (highlightPadding / width) * 100;
    const positionOffset = this.getPositionOffset();

    const bounds = areas.map(getBounds);

    highlightGroup
      .selectAll("rect")
      .data(bounds)
      .enter()
      .append("rect")
      .attr("class", "area")
      .attr(
        "y",
        ({ topLeft }) =>
          grid[topLeft.string - 1]![topLeft.fret - positionOffset]!.y -
          positionSize * 0.5 -
          highlightPadding,
      )
      .attr(
        "x",
        ({ topLeft }) =>
          `${grid[topLeft.string - 1]![topLeft.fret - positionOffset]!.x - positionPercentSize / 2 - highlightPaddingPercentSize}%`,
      )
      .attr("rx", highlightRadius)
      .attr("width", ({ topLeft, topRight }) => {
        const from = grid[topLeft.string - 1]![topLeft.fret]!.x;
        const to = grid[topRight.string - 1]![topRight.fret]!.x;
        return `${to - from + positionPercentSize + 2 * highlightPaddingPercentSize}%`;
      })
      .attr("height", ({ topLeft, bottomLeft }) => {
        const from = grid[topLeft.string - 1]![topLeft.fret]!.y;
        const to = grid[bottomLeft.string - 1]![bottomLeft.fret]!.y;
        return to - from + positionSize + 2 * highlightPadding;
      })
      .attr("stroke", highlightStroke)
      .attr("fill", highlightFill)
      .attr("style", `mix-blend-mode: ${highlightBlendMode}`);

    return this;
  }

  clearHighlightAreas(): Fretboard {
    this.wrapper.select(".highlight-areas").remove();
    return this;
  }

  private renderBarres(barres: Barre[]): void {
    const { wrapper, strings, options, grid } = this;

    const normalizedBarres = barres.map(
      ({ fret, stringFrom, stringTo }: Barre) => ({
        fret,
        stringFrom: stringFrom
          ? Math.min(stringFrom, strings.length)
          : strings.length,
        stringTo: stringTo ? Math.max(stringTo, 1) : 1,
      }),
    );

    const { positionSize, barresColor } = options;
    const positionOffset = this.getPositionOffset();
    const barreWidth = positionSize * 0.8;

    const barresGroup = wrapper
      .append("g")
      .attr("class", "barres")
      .attr("transform", `translate(-${barreWidth * 0.5}, 0)`);

    barresGroup
      .selectAll("rect")
      .data(normalizedBarres)
      .enter()
      .append("rect")
      .attr(
        "y",
        ({ fret, stringTo }: Barre) =>
          grid[stringTo! - 1]![fret - positionOffset]!.y -
          positionOffset * 0.75,
      )
      .attr(
        "x",
        ({ fret, stringFrom }: Barre) =>
          `${grid[stringFrom! - 1]![fret - positionOffset]!.x}%`,
      )
      .attr("rx", 7.5)
      .attr("width", barreWidth)
      .attr(
        "height",
        ({ stringFrom, stringTo }: Barre) =>
          strings[stringFrom! - 1]! -
          strings[stringTo! - 1]! +
          1.5 * positionOffset,
      )
      .attr("fill", barresColor);
  }

  private baseRender(positionOffset: number): void {
    if (this.baseRendered) {
      return;
    }

    const { wrapper, frets, strings } = this;

    const {
      height,
      font,
      nutColor,
      nutWidth,
      stringColor,
      stringWidth,
      fretColor,
      fretWidth,
      middleFretWidth,
      middleFretColor,
      showFretNumbers,
      fretNumbersMargin,
      fretNumbersColor,
      topPadding,
    } = this.options;

    const { totalWidth } = getDimensions(this.options);

    const stringGroup = wrapper.append("g").attr("class", "strings");

    stringGroup
      .selectAll("line")
      .data(strings)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", (d) => d)
      .attr("x2", "100%")
      .attr("y2", (d) => d)
      .attr("stroke", stringColor)
      .attr("stroke-width", (_d, i) =>
        getStringThickness({ stringWidth, stringIndex: i }),
      );

    const fretsGroup = wrapper.append("g").attr("class", "frets");

    fretsGroup
      .selectAll("line")
      .data(frets)
      .enter()
      .append("line")
      .attr("x1", (d) => `${d}%`)
      .attr("y1", 1)
      .attr("x2", (d) => `${d}%`)
      .attr("y2", height - 1)
      .attr("stroke", (_d, i) => {
        switch (i) {
          case 0:
            return nutColor;
          case MIDDLE_FRET + 1:
            return middleFretColor;
          default:
            return fretColor;
        }
      })
      .attr("stroke-width", (_d, i) => {
        switch (i) {
          case 0:
            return nutWidth;
          case MIDDLE_FRET + 1:
            return middleFretWidth;
          default:
            return fretWidth;
        }
      });

    if (showFretNumbers) {
      const fretNumbersGroup = wrapper
        .append("g")
        .attr("class", "fret-numbers")
        .attr("font-family", font)
        .attr(
          "transform",
          `translate(0 ${fretNumbersMargin + topPadding + strings[strings.length - 1]!})`,
        );

      fretNumbersGroup
        .selectAll("text")
        .data(frets.slice(1))
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", (d, i) => (totalWidth / 100) * (d - (d - frets[i]!) / 2))
        .attr("fill", (_d, i) =>
          i === MIDDLE_FRET ? middleFretColor : fretNumbersColor,
        )
        .text((_d, i) => `${i + 1 + positionOffset}`);
    }

    this.baseRendered = true;
  }

  private getPositionOffset(): number {
    const { positions } = this;
    const { crop, fretLeftPadding } = this.options;
    return crop
      ? Math.max(
          0,
          Math.min(...positions.map(({ fret }) => fret)) - 1 - fretLeftPadding,
        )
      : 0;
  }
}
