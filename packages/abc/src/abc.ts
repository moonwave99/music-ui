import {
  renderAbc,
  type AbcVisualParams,
  TuneObject,
  ClickListenerAnalysis,
} from "abcjs";
import type { PlayerPosition } from "@music-ui/core";

const cursorBleed = 7.5;
const cursorOffset = -2.5;

const DEFAULT_ABC_VISUAL_PARAMS = {
  responsive: "resize",
  add_classes: true,
  paddingleft: 0,
  paddingright: 0,
  selectionColor: "dodgerblue",
} as const;

const cssClasses = {
  content: "content",
  staff: "staff",
  timeSignature: "abcjs-time-signature",
  cursor: "abcjs-cursor",
  currentNote: "abcjs-current-note",
} as const;

export type OnAbcClickParams = {
  position: PlayerPosition;
};

export type InitABCParams = {
  content?: string;
  staffElement: HTMLElement;
  showPlayer?: boolean;
  showCursor?: boolean;
  hideMeter?: boolean;
  hideTempo?: boolean;
  abcOptions?: AbcVisualParams;
  onClick?: (params: OnAbcClickParams) => void;
};

export type InitAbc = {
  updatePosition: (position: PlayerPosition) => void;
};

export function initAbc({
  content = "",
  staffElement,
  showCursor = true,
  hideMeter = false,
  abcOptions = {},
  onClick,
}: InitABCParams): InitAbc {
  const visualObj = renderAbc(staffElement, content, {
    ...DEFAULT_ABC_VISUAL_PARAMS,
    ...abcOptions,
    clickListener,
  }).at(0) as TuneObject;

  const svgElement = staffElement.querySelector<SVGElement>("svg")!;

  function clickListener(
    _: unknown,
    __: unknown,
    ___: unknown,
    x: ClickListenerAnalysis,
  ) {
    if (!onClick) {
      return;
    }
    const currentNote = x.selectableElement as unknown as SVGGElement;
    updateCursor({ svgElement, cursor, currentNote });
    onClick({ position: getNotePosition(currentNote) });
  }

  const isMeterDenominatorUnary = visualObj.getMeter().value?.at(0)!.den == 1;

  if (hideMeter || isMeterDenominatorUnary) {
    const timeSignature = staffElement.querySelector<HTMLElement>(
      `.${cssClasses.timeSignature}`,
    );
    if (timeSignature) {
      timeSignature.style.display = "none";
    }
  }

  let cursor: SVGLineElement;

  if (showCursor) {
    cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    cursor.classList.add(cssClasses.cursor);
    staffElement.querySelector("svg")?.append(cursor);
  }

  function updatePosition(position: PlayerPosition) {
    if (!showCursor) {
      return;
    }
    const [bar] = position.split(":");
    const barNotes = svgElement.querySelectorAll<SVGGElement>(
      `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}`,
    );

    const currentNote = getCurrentNote(barNotes, position);
    if (!currentNote) {
      return;
    }
    svgElement
      .querySelectorAll(`.${cssClasses.currentNote}`)
      .forEach((element) => element.classList.remove(cssClasses.currentNote));
    currentNote.classList.add(cssClasses.currentNote);
    updateCursor({
      currentNote,
      svgElement,
      cursor,
    });
  }

  return { updatePosition };
}

const DEFAULT_INIT_OPTIONS = {
  elements: "[data-abc]",
} as const;

type InitAllOptions = {
  elements: string | NodeListOf<HTMLElement>;
};

export function initAll(options: InitAllOptions = DEFAULT_INIT_OPTIONS) {
  const elements =
    typeof options.elements === "string"
      ? document.querySelectorAll<HTMLElement>(options.elements)
      : options.elements;

  elements.forEach((element: HTMLElement) => {
    initAbc({
      content: element
        .querySelector(`.${cssClasses.content}`)!
        .textContent.trim(),
      staffElement: element.querySelector(`.${cssClasses.staff}`)!,
    });
  });
}

function getCurrentNote(
  barNotes: NodeListOf<SVGGElement>,
  position: PlayerPosition,
) {
  const [, beat, sixteenths] = position.split(":").map(Number) as [
    number,
    number,
    number,
  ];
  const elementsWithDurations = [];

  let relativePosition = 0;

  for (const element of barNotes) {
    const duration = getNoteDuration(element);
    elementsWithDurations.push({
      position: relativePosition * 4,
      element,
    });
    relativePosition += duration;
  }

  for (const { element, position } of elementsWithDurations) {
    if (position >= beat + Math.floor(sixteenths) / 4) {
      return element;
    }
  }

  return null;
}

type UpdateCursorParams = {
  svgElement: SVGElement;
  currentNote: SVGGElement;
  cursor: SVGLineElement;
};

function updateCursor({ svgElement, currentNote, cursor }: UpdateCursorParams) {
  const lineNumber = getValueFromNote(currentNote, "abcjs-l");

  const line = svgElement.querySelector<SVGGElement>(
    `.abcjs-staff.abcjs-l${lineNumber}`,
  );
  const noteBox = currentNote.querySelector<SVGGElement>("path")?.getBBox();

  const lineBox = line?.getBBox();
  if (noteBox && lineBox) {
    cursor.setAttribute("x1", String(noteBox.x! + cursorOffset));
    cursor.setAttribute("x2", String(noteBox.x! + cursorOffset));
    cursor.setAttribute("y1", String(lineBox.y! - cursorBleed));
    cursor.setAttribute(
      "y2",
      String(lineBox.y! + lineBox.height! + cursorBleed),
    );
  }
}

function getNotePosition(element: SVGGElement): PlayerPosition {
  const bar = getValueFromNote(element, "abcjs-mm");

  const barNotes = element.parentElement!.querySelectorAll<SVGGElement>(
    `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}`,
  );

  const barPosition = Array.from(barNotes).indexOf(element);
  const beatWithRest =
    Array.from(barNotes)
      .slice(0, barPosition)
      .reduce((memo, element) => memo + getNoteDuration(element), 0) * 4;

  const rest = beatWithRest % 1;
  const beat = beatWithRest - rest;
  const sixteenths = rest * 4;

  const position = `${bar}:${beat}:${sixteenths}` as PlayerPosition;
  return position;
}

function getValueFromNote(element: SVGGElement, classPrefix: string) {
  return Number(
    element.classList
      .toString()
      .split(" ")
      .find((x) => x.startsWith(classPrefix))
      ?.replace(classPrefix, ""),
  );
}

function getNoteDuration(element: SVGGElement) {
  const durationValue = element
    .getAttribute("class")
    ?.split(" ")
    .map((x) => x.match(/abcjs-d(.*)/))
    .filter(Boolean)
    .at(0)
    ?.at(1);

  const duration = Number(
    durationValue?.includes("-")
      ? durationValue.replace("-", ".")
      : durationValue,
  );
  return duration;
}
