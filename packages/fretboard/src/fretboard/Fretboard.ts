import { select, Selection, ValueFn, BaseType } from "d3-selection";
import { type ElementOrSelector } from "@music-ui/core";

import {
  generateStrings,
  generateFrets,
  getStringThickness,
  getPositionClasses,
  getDimensions,
  validateOptions,
  generateGrid,
  getBounds,
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

import {
  FretboardSystem,
  type ScaleParams,
} from "../fretboardSystem/FretboardSystem";

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
} & Record<string, string | number | boolean | string[] | number[]>;

export type Barre = {
  fret: number;
  stringFrom?: number;
  stringTo?: number;
};

type MuteStringsParams = {
  strings: number[];
  width?: number;
  strokeWidth?: number;
  stroke?: string;
};

export type StyleParams = {
  [key: string]:
    | string
    | number
    | ValueFn<BaseType, FretboardPosition, number | boolean | string>;
} & {
  filter?: (position: FretboardPosition) => boolean;
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
  fretPaddingLeft: 0,
  paddingTop: DEFAULT_DIMENSIONS.unit,
  paddingBottom: DEFAULT_DIMENSIONS.unit * 0.75,
  paddingLeft: DEFAULT_DIMENSIONS.unit,
  paddingRight: DEFAULT_DIMENSIONS.unit,
  height: DEFAULT_DIMENSIONS.height,
  width: DEFAULT_DIMENSIONS.width,
  positionSize: DEFAULT_DIMENSIONS.unit,
  positionStrokeColor: DEFAULT_COLORS.positionStroke,
  positionStrokeWidth: 2 * DEFAULT_DIMENSIONS.line,
  positionTextSize: DEFAULT_FONT_SIZE,
  positionFill: DEFAULT_COLORS.positionFill,
  positionText: () => "",
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
  strings: [],
  width: 15,
  strokeWidth: 5,
  stroke: DEFAULT_COLORS.mutedString,
} as const;

export const cssClasses = {
  htmlWrapper: "fretboard-html-wrapper",
  svgWrapper: "fretboard-wrapper",
  positions: "positions",
  position: "position",
  positionCircle: "position-circle",
  positionText: "position-text",
  mutedStrings: "muted-strings",
  mutedString: "muted-string",
  barres: "barres",
  highlightAreas: "highlight-areas",
  area: "area",
  strings: "strings",
  frets: "frets",
  fretNumbers: "fret-numbers",
} as const;

export type FretboardOptions = {
  element: ElementOrSelector<HTMLElement>;
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
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
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
  fretPaddingLeft: number;
  font: string;
  barresColor: string;
  highlightPadding: number;
  highlightRadius: number;
  highlightStroke: string;
  highlightFill: string;
  highlightBlendMode: string;
};

type Rec = Record<string, string | number | boolean>;

export type Point = {
  x: number;
  y: number;
};

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
  private system: FretboardSystem;
  private positions: FretboardPosition[] = [];
  constructor(options: Partial<FretboardOptions> = {}) {
    this.options = { ...DEFAULT_FRETBOARD_OPTIONS, ...options };
    validateOptions(this.options);
    const {
      element,
      height,
      width,
      paddingLeft,
      paddingTop,
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
      .attr("class", cssClasses.htmlWrapper)
      .attr("style", "position: relative")
      .append("svg")
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);

    this.wrapper = this.svg
      .append("g")
      .attr("class", cssClasses.svgWrapper)
      .attr(
        "transform",
        `translate(${paddingLeft}, ${paddingTop}) scale(${width / totalWidth})`,
      );
  }

  render(): Fretboard {
    const { wrapper, options } = this;
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
    wrapper.select(`.${cssClasses.positions}`).remove();

    const positions = this.positions.filter(
      ({ fret }) => fret <= options.fretCount + positionOffset,
    );

    if (!positions.length) {
      return this;
    }

    const positionGroup = wrapper
      .append("g")
      .attr("class", cssClasses.positions)
      .attr("font-family", font);

    const positionNodes = positionGroup
      .selectAll("g")
      .data(positions)
      .enter()
      .filter(({ fret }) => fret >= 0)
      .append("g")
      .attr("class", (position) =>
        [cssClasses.position, getPositionClasses(position, "")].join(" "),
      )
      .attr("opacity", ({ disabled }) => (disabled ? disabledOpacity : 1));

    positionNodes
      .append("circle")
      .attr("class", cssClasses.positionCircle)
      .attr(
        "cx",
        ({ string, fret }) =>
          `${this.getGridPositionAt(string - 1, fret - positionOffset)!.x}%`,
      )
      .attr(
        "cy",
        ({ string, fret }) =>
          this.getGridPositionAt(string - 1, fret - positionOffset)!.y,
      )
      .attr("r", positionSize * 0.5)
      .attr("stroke", positionStrokeColor)
      .attr("stroke-width", positionStrokeWidth)
      .attr("fill", positionFill);

    positionNodes
      .append("text")
      .attr("class", cssClasses.positionText)
      .attr(
        "x",
        ({ string, fret }) =>
          `${this.getGridPositionAt(string - 1, fret - positionOffset)!.x}%`,
      )
      .attr(
        "y",
        ({ string, fret }) =>
          this.getGridPositionAt(string - 1, fret - positionOffset)!.y,
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
    this.wrapper.select(`.${cssClasses.positions}`).remove();
    return this;
  }

  style({ filter = () => true, ...opts }: StyleParams): Fretboard {
    const { wrapper } = this;
    const { positionTextSize } = this.options;

    const positions = wrapper
      .selectAll<BaseType, FretboardPosition>(`.${cssClasses.positionCircle}`)
      .filter(filter);

    Object.keys(opts).forEach((key) =>
      positions.attr(key, (opts as Rec)[key]!),
    );

    if (opts.text) {
      wrapper
        .selectAll<BaseType, FretboardPosition>(`.${cssClasses.positionText}`)
        .filter(filter)
        .text(opts.text)
        .attr("font-size", opts.fontSize || positionTextSize)
        .attr("fill", opts.fontFill || DEFAULT_COLORS.positionText);
    }

    return this;
  }

  muteStrings(params: MuteStringsParams): Fretboard {
    const { strings, stroke, strokeWidth, width } = {
      ...defaultMuteStringsParams,
      ...params,
    };

    this.wrapper
      .append("g")
      .attr("class", cssClasses.mutedStrings)
      .attr("transform", `translate(${-width / 2}, ${-width / 2})`)
      .selectAll("path")
      .data(strings)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const { y } = this.getGridPositionAt(d - 1, 0)!;
        return [
          `M 0 ${y}`,
          `L ${width} ${y + width}`,
          `M ${width} ${y}`,
          `L 0 ${y + width}`,
        ].join(" ");
      })
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("class", cssClasses.mutedString);

    return this;
  }

  renderChord(chord: string, barres?: Barre | Barre[]): Fretboard {
    // #TODO: render open strings too
    const { positions, mutedStrings: strings } = parseChord(chord);
    this.setPositions(positions);
    if (barres) {
      this.renderBarres(Array.isArray(barres) ? barres : [barres]);
    }
    this.render();
    this.muteStrings({ strings });
    return this;
  }

  renderScale({ type, root, box, displayBoxOnly }: ScaleParams): Fretboard {
    this.checkTuning();
    return this.setPositions(
      this.system
        .getScale({ type, root, box })
        .filter(({ inBox }) => (displayBoxOnly ? inBox : true)),
    ).render();
  }

  highlightAreas(
    ...areas: [FretboardPosition, FretboardPosition][]
  ): Fretboard {
    const { wrapper, options } = this;
    const {
      width,
      positionSize,
      highlightPadding,
      highlightFill,
      highlightStroke,
      highlightBlendMode,
      highlightRadius,
    } = options;

    const highlightGroup = wrapper
      .append("g")
      .attr("class", cssClasses.highlightAreas);

    const positionPercentSize = (positionSize / width) * 100;
    const highlightPaddingPercentSize = (highlightPadding / width) * 100;
    const positionOffset = this.getPositionOffset();

    const bounds = areas.map(getBounds);

    highlightGroup
      .selectAll("rect")
      .data(bounds)
      .enter()
      .append("rect")
      .attr("class", cssClasses.area)
      .attr(
        "y",
        ({ topLeft }) =>
          this.getGridPositionAt(
            topLeft.string - 1,
            topLeft.fret - positionOffset,
          )!.y -
          positionSize * 0.5 -
          highlightPadding,
      )
      .attr(
        "x",
        ({ topLeft }) =>
          `${this.getGridPositionAt(topLeft.string - 1, topLeft.fret - positionOffset)!.x - positionPercentSize / 2 - highlightPaddingPercentSize}%`,
      )
      .attr("rx", highlightRadius)
      .attr("width", ({ topLeft, topRight }) => {
        const from = this.getGridPositionAt(topLeft.string - 1, topLeft.fret);
        const to = this.getGridPositionAt(topRight.string - 1, topRight.fret);
        return `${to!.x - from!.x + positionPercentSize + 2 * highlightPaddingPercentSize}%`;
      })
      .attr("height", ({ topLeft, bottomLeft }) => {
        const from = this.getGridPositionAt(topLeft.string - 1, topLeft.fret);
        const to = this.getGridPositionAt(
          bottomLeft.string - 1,
          bottomLeft.fret,
        );
        return to!.y - from!.y + positionSize + 2 * highlightPadding;
      })
      .attr("stroke", highlightStroke)
      .attr("fill", highlightFill)
      .attr("style", `mix-blend-mode: ${highlightBlendMode}`);

    return this;
  }

  clearHighlightAreas(): Fretboard {
    this.wrapper.select(`.${cssClasses.highlightAreas}`).remove();
    return this;
  }

  private checkTuning() {
    if (this.options.tuning.toString() === GUITAR_TUNINGS.default.toString()) {
      return;
    }
    console.warn(
      "Selected scale system works for standard tuning. Wrong notes may be highlighted.",
    );
  }

  private getGridPositionAt(x: number, y: number) {
    const row = this.grid[x];
    if (!row) {
      return null;
    }
    return row[y];
  }

  private getPositionOffset(): number {
    const { positions } = this;
    const { crop, fretPaddingLeft } = this.options;
    return crop
      ? Math.max(
          0,
          Math.min(...positions.map(({ fret }) => fret)) - 1 - fretPaddingLeft,
        )
      : 0;
  }

  private renderBarres(barres: Barre[]): void {
    const { wrapper, strings, options } = this;

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
      .attr("class", cssClasses.barres)
      .attr("transform", `translate(-${barreWidth * 0.5}, 0)`);

    barresGroup
      .selectAll("rect")
      .data(normalizedBarres)
      .enter()
      .append("rect")
      .attr(
        "y",
        ({ fret, stringTo }: Barre) =>
          this.getGridPositionAt(stringTo! - 1, fret - positionOffset)!.y -
          positionOffset * 0.75,
      )
      .attr(
        "x",
        ({ fret, stringFrom }: Barre) =>
          `${this.getGridPositionAt(stringFrom! - 1, fret - positionOffset)!.x}%`,
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
      paddingTop,
    } = this.options;

    const { totalWidth } = getDimensions(this.options);

    const stringGroup = wrapper.append("g").attr("class", cssClasses.strings);

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

    const fretsGroup = wrapper.append("g").attr("class", cssClasses.frets);

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
        .attr("class", cssClasses.fretNumbers)
        .attr("font-family", font)
        .attr(
          "transform",
          `translate(0 ${fretNumbersMargin + paddingTop + strings[strings.length - 1]!})`,
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
}
