import { renderAbc, type AbcVisualParams, TuneObject } from "abcjs";
import type { PlayerPosition } from "@music-ui/core";

const DEFAULT_ABC_VISUAL_PARAMS = {
  responsive: "resize",
  add_classes: true,
  paddingleft: 0,
  paddingright: 0,
} as const;

const cssClasses = {
  content: "content",
  staff: "staff",
  timeSignature: "abcjs-time-signature",
} as const;

export type OnAbcClickParams = {
  measure: number;
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

  function clickListener(_: unknown, __: unknown, classes: string) {
    if (!onClick) {
      return;
    }
    const measure = Number(
      classes
        .split(" ")
        .find((x) => x.match(/abcjs-mm(\d+)/))
        ?.replace("abcjs-mm", ""),
    );
    onClick({ measure });
  }

  const isMeterDenominatorUnary = visualObj.getMeter().value?.at(0)!.den == 1;

  if (hideMeter || isMeterDenominatorUnary) {
    (staffElement.querySelector(
      `.${cssClasses.timeSignature}`,
    ) as HTMLElement)!.style.display = "none";
  }

  let cursor: SVGLineElement;

  if (showCursor) {
    cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    cursor.classList.add("abcjs-cursor");
    staffElement.querySelector("svg")?.append(cursor);
  }

  function updatePosition(position: PlayerPosition) {
    if (!showCursor) {
      return;
    }
    const [bar, beat] = position.split(":");
    const firstNoteOfBar = staffElement.querySelector(
      `svg .abcjs-note.abcjs-mm${bar}`,
    );
    // firstNoteOfBar?.setAttribute("fill", "red");
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
