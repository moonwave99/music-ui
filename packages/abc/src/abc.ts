import { renderAbc, type TuneObject } from "abcjs";

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

  elements.forEach((element: HTMLElement, index: number) =>
    initAbc({
      id: element.dataset.id || String(index + 1),
      content: element.querySelector(".content")!.textContent,
      staffElement: element.querySelector(".staff")!,
    }),
  );
}

export type InitABCParams = {
  content?: string;
  staffElement: HTMLElement;
  id: string;
  hideMeter?: boolean;
};

export function initAbc({
  content = "",
  staffElement,
  hideMeter = false,
}: InitABCParams) {
  const visualObj = renderAbc(staffElement, content, {
    responsive: "resize",
    add_classes: true,
    paddingleft: 0,
    paddingright: 0,
  }).at(0) as TuneObject;

  const isMeterDenominatorUnary = visualObj.getMeter().value?.at(0)!.den == 1;

  if (hideMeter || isMeterDenominatorUnary) {
    (staffElement.querySelector(
      ".abcjs-time-signature",
    ) as HTMLElement)!.style.display = "none";
  }
}
