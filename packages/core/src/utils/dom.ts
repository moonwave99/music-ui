import { ElementOrSelector } from "../types";

/**
 * Normalizes a selection (string, Element, NodeList) to a fixed state (jQuery <3).
 * @param elementOrSelector A CSS selector, a single node or a list of nodes
 * @returns An array of the selected elements
 */
export function ensureSelection<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T>,
): T[] {
  if (typeof elementOrSelector === "string") {
    return Array.from(document.querySelectorAll<T>(elementOrSelector));
  }
  if ((elementOrSelector as NodeListOf<T>).length) {
    return Array.from(elementOrSelector as NodeListOf<T>);
  }
  return [elementOrSelector as T];
}

/**
 * Extracts data attributes from a given element out of a sample whitelist.
 * @param el The element to gather attributes from
 * @param baseOptions The whitelist of accepted data attributes and their relative types
 * @returns An object of the available attributes and their values
 */
export function extractElementOptions<
  T extends Record<string, string | number | boolean>,
>(el: HTMLElement, baseOptions: T): T {
  const options = {} as Record<string, string | number | boolean>;
  Object.entries(baseOptions).forEach(([key, sample]) => {
    const value = el.dataset[key];
    switch (typeof sample) {
      case "string":
        if (value) {
          options[key] = value;
        }
        break;
      case "number":
        if (value) {
          options[key] = +value;
        }
        break;
      case "boolean":
        if (typeof value !== "undefined") {
          options[key] = value !== "false";
        }
    }
  });
  return options as T;
}

/**
 * Creates buttons from a key-value list of handlers, attaches the handlers to them and appends them to the passed element.
 * @param element The element where the buttons will be appended
 * @param handlers The event handlers attached to the buttons
 * @returns
 */
export function createControls(
  element: HTMLElement,
  handlers: Record<string, () => void>,
) {
  const buttons = {} as Record<string, HTMLButtonElement>;

  Object.entries(handlers).forEach(([name, handler]) => {
    const button = document.createElement("button");
    button.classList.add(`${name}-button`);
    button.addEventListener("click", handler);
    button.textContent = name;
    element.append(button);
    buttons[name] = button;
  });

  return buttons;
}

/**
 * The params expected by the `ensureElements` function.
 * @property id The rendering context id (e.g. `piano-1`, `score-3`)
 * @property parentElement The element that should contain the children elements
 * @property elements The key-value lookup list
 *
 * @example
 * {
 *    staffElement: ".staff",
 *    controlsElement: ".controls",
 * }
 */
type EnsureElementsParams = {
  id: string;
  parentElement: HTMLElement;
  elements: Record<string, string>;
};

/**
 * Given a key-value lookup list of desired element names and relative CSS selectors, it populates an object with the same keys and the found elements.
 * @throws `${key} not found inside element with id: ${id}` as soon as an element of the list is not found.
 * @param __namedParameters The id of the context, the parent element, the key-value lookup list
 * @returns The key-value list of element names and selections
 */
export function ensureElements({
  id,
  parentElement,
  elements,
}: EnsureElementsParams) {
  const output = {} as Record<string, HTMLElement>;
  Object.entries(elements).forEach(([key, value]) => {
    const element = parentElement.querySelector<HTMLElement>(value);
    if (!element) {
      throw new Error(`${key} not found inside element with id: ${id}`);
    }
    output[key] = element;
  });
  return output;
}
