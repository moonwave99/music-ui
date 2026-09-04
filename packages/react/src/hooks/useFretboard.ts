import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  Fretboard,
  type FretboardOptions,
  type FretboardPosition,
  type Barre,
  StyleParams,
} from "@music-ui/fretboard";

/**
 * The params expected by the `useFretboard` function.
 * @property positions An array of {@link FretboardPosition}.
 * @property chord A chord shorthand (e.g. `x02221`).
 * @property barres A single {@link Barre} / array of Barres.
 * @property style Params expected by the `Fretboard.style` function.
 */
export type UseFretboardParams = Partial<FretboardOptions> & {
  positions?: FretboardPosition[];
  chord?: string;
  barres?: Barre | Barre[];
  style?: StyleParams;
};

/**
 * Properties exposed by the `useFretboard` hook.
 * @property ref Reference to the `HTMLElement` where the fretboard will be rendered.
 */
export type UseFretboard<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

/**
 * Hook used to render a fretboard on screen.
 * @param params The parameters for rendering a fretboard on screen.
 * @returns { UseFretboard } The properties exposed by the hook.
 */
export function useFretboard<T extends HTMLElement>({
  positions,
  chord,
  barres,
  style,
  ...params
}: UseFretboardParams): UseFretboard<T> {
  const ref = useRef<T>(null);
  const fretboardRef = useRef<Fretboard>(null);

  useLayoutEffect(() => {
    /* istanbul ignore if  */
    if (fretboardRef.current) {
      return;
    }
    fretboardRef.current = new Fretboard({
      element: ref.current!,
      ...params,
    });
    fretboardRef.current.render();
  }, [params]);

  useLayoutEffect(() => {
    if (chord) {
      fretboardRef.current?.renderChord(chord, barres);
      if (style) {
        fretboardRef.current?.style(style);
      }
      return;
    }
    if (!positions || !positions.length) {
      fretboardRef.current?.clear().render();
      return;
    }
    fretboardRef.current?.setPositions(positions).render();
    if (style) {
      fretboardRef.current?.style(style);
    }
  }, [positions, chord, barres, style]);

  return { ref };
}
