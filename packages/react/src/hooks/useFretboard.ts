import { useLayoutEffect, useRef, type RefObject } from "react";
import {
  Fretboard,
  type FretboardOptions,
  type FretboardPosition,
} from "@music-ui/fretboard";

/**
 * The params expected by the `useFretboard` function.
 */
export type UseFretboardParams = Partial<FretboardOptions> & {
  positions?: FretboardPosition[];
};

/**
 * Properties exposed by the `useFretboard` hook.
 * @property ref Reference to the `HTMLElement` where the fretboard will be rendered.
 */
export type UseFretboard<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

/**
 *
 * @param params The parameters for rendering a fretboard on screen.
 * @returns { UseFretboard } The properties exposed by the hook.
 */
export function useFretboard<T extends HTMLElement>({
  positions,
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
    if (!positions || !positions.length) {
      fretboardRef.current?.clear().render();
      return;
    }
    fretboardRef.current?.setPositions(positions).render();
  }, [positions]);

  return { ref };
}
