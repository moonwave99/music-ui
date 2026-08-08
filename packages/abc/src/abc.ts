import { renderAbc, type AbcVisualParams, TuneObject } from "abcjs";

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

export type InitABCParams = {
  content?: string;
  staffElement: HTMLElement;
  hideMeter?: boolean;
  abcOptions?: AbcVisualParams;
};

export function initAbc({
  content = "",
  staffElement,
  hideMeter = false,
  abcOptions = {},
}: InitABCParams) {
  const visualObj = renderAbc(staffElement, content, {
    ...DEFAULT_ABC_VISUAL_PARAMS,
    ...abcOptions,
  }).at(0) as TuneObject;

  const isMeterDenominatorUnary = visualObj.getMeter().value?.at(0)!.den == 1;

  if (hideMeter || isMeterDenominatorUnary) {
    (staffElement.querySelector(
      `.${cssClasses.timeSignature}`,
    ) as HTMLElement)!.style.display = "none";
  }
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

  elements.forEach((element: HTMLElement) =>
    initAbc({
      content: element
        .querySelector(`.${cssClasses.content}`)!
        .textContent.trim(),
      staffElement: element.querySelector(`.${cssClasses.staff}`)!,
    }),
  );
}
