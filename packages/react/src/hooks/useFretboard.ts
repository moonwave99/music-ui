import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  Fretboard,
  type FretboardOptions,
  type FretboardPosition,
  type StyleParams,
  type RenderChordParams,
  type ScaleParams,
} from "@music-ui/fretboard";

/**
 * The params expected by the `useFretboard` function.
 * @property positions An array of {@link FretboardPosition}.
 * @property chord Params expected by the `Fretboard.renderChord` function.
 * @property scale Params expected by the `Fretboard.renderScale` function.
 * @property style Params expected by the `Fretboard.style` function.
 * @property showNoteNames Display the note names or not.
 */
export type UseFretboardParams = Partial<FretboardOptions> & {
  positions?: FretboardPosition[];
  chord?: RenderChordParams;
  scale?: ScaleParams;
  style?: StyleParams;
  showNoteNames?: boolean;
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
  scale,
  style = {},
  showNoteNames,
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
  }, [params]);

  useEffect(() => {
    if (scale) {
      fretboardRef.current?.renderScale(scale);
      return;
    }
    if (chord) {
      fretboardRef.current?.renderChord(chord);
      return;
    }
    if (!positions || !positions.length) {
      fretboardRef.current?.clear().render();
      return;
    }
    fretboardRef.current?.setPositions(positions).render();
  }, [positions, chord, scale]);

  useEffect(() => {
    fretboardRef.current?.style({
      text: ({ note }: FretboardPosition) =>
        showNoteNames && note ? note : "",
      ...style,
    });
  }, [style, showNoteNames]);

  return { ref };
}
