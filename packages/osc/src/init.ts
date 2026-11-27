import {
  ensureSelection,
  extractElementOptions,
  type ElementOrSelector,
} from "@music-ui/core";
import { Oscillator, DEFAULT_OSCILLATOR_PARAMS } from "./oscillator";
import { OscPlayer } from "./OscPlayer";

/**
 * The params expected by the `initOscillator` function.
 * @property selection The elements to be initialized.
 */
export type InitOscillatorParams<T extends HTMLElement> = {
  selection: ElementOrSelector<T>;
  player: OscPlayer;
};

export const DEFAULT_OPTIONS = {
  selection: ".oscillator",
} as const;

/**
 * Initializes oscillators on the passed selection.
 * @param params The initialization params.
 */
export function initOscillator<T extends HTMLElement>(
  params: Partial<InitOscillatorParams<T>> = {},
) {
  const { selection, player } = { ...DEFAULT_OPTIONS, ...params };

  if (!(player instanceof OscPlayer)) {
    throw new Error("You must pass an OscPlayer instance");
  }

  ensureSelection(selection).forEach((element, index) => {
    new Oscillator({
      player,
      element,
      id: `osc-${index + 1}`,
      ...extractElementOptions(element, DEFAULT_OSCILLATOR_PARAMS),
    }).render();
  });
}
