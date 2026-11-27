import { ensureElements, ensureSelection } from "@music-ui/core";
import { initOscillator, type InitOscillatorParams } from "./init";
import { OscPlayer } from "./OscPlayer";
import { Oscilloscope } from "./Oscilloscope";

const cssClasses = {
  wrapper: "oscillators-with-oscilloscope",
  oscillators: "oscillators",
  oscillator: "oscillator",
  oscilloscope: "oscilloscope",
} as const;

/**
 * The params expected by the `initOscillatorWithOscilloscope` function.
 * @property player An `OscPlayer` instance.
 */
type InitOscillatorWithOscilloscopeParams<T extends HTMLElement> =
  InitOscillatorParams<T>;

/**
 * Initializes oscillators and oscilloscope on the passed selection.
 * @param params The initialization params.
 */
export function initOscillatorWithOscilloscope<T extends HTMLElement>(
  params: Partial<InitOscillatorWithOscilloscopeParams<T>>,
) {
  const { selection, player } = {
    selection: cssClasses.wrapper,
    ...params,
  };

  if (!(player instanceof OscPlayer)) {
    throw new Error("You must pass an OscPlayer instance");
  }

  ensureSelection(selection).forEach((element, index) => {
    const id = element.dataset.id || `${index + 1}`;
    const { oscillatorsElement, oscilloscopeElement } = ensureElements({
      id,
      parentElement: element,
      elements: {
        oscillatorsElement: `.${cssClasses.oscillators}`,
        oscilloscopeElement: `.${cssClasses.oscilloscope}`,
      },
    });

    initOscillator({
      selection: oscillatorsElement!.querySelectorAll<HTMLElement>(
        `.${cssClasses.oscillator}`,
      ),
      player,
    });

    new Oscilloscope({
      element: oscilloscopeElement!,
      player,
    }).render();
  });
}
