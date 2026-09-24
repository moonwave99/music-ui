import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  Fretboard,
  type FretboardOptions,
  type FretboardPosition,
  type StyleParams,
  type RenderChordParams,
  type RenderChordVoicingParams,
  type GetScaleParams,
} from "@music-ui/fretboard";

/**
 * The params expected by the `useFretboard` function.
 * @property positions An array of {@link FretboardPosition}.
 * @property chord Params expected by the `Fretboard.renderChord` function.
 * @property scale Params expected by the `Fretboard.renderScale` function.
 * @property style Params expected by the `Fretboard.style` function.
 * @property textProperty The position property to display.
 */
export type UseFretboardParams = Partial<Omit<FretboardOptions, "element">> & {
  positions?: FretboardPosition[];
  chord?: RenderChordParams;
  chordVoicing?: RenderChordVoicingParams;
  scale?: GetScaleParams;
  style?: StyleParams;
  textProperty?: keyof Pick<FretboardPosition, "note" | "degree" | "interval">;
};

/**
 * Properties exposed by the `useFretboard` hook.
 * @property ref Reference to the `HTMLElement` where the fretboard will be rendered.
 * @property fretboardRef Reference to the `Fretboard` instance.
 */
export type UseFretboard<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  fretboardRef: RefObject<Fretboard | null>;
};

/**
 * Hook used to render a fretboard on screen.
 * @param params The parameters for rendering a fretboard on screen.
 * @returns { UseFretboard } The properties exposed by the hook.
 */
export function useFretboard<T extends HTMLElement>({
  positions,
  chord,
  chordVoicing,
  scale,
  style = {},
  textProperty,
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
    if (chordVoicing) {
      fretboardRef.current?.renderChordVoicing(chordVoicing);
      return;
    }
    if (!positions || !positions.length) {
      fretboardRef.current?.clear().render();
      return;
    }
    fretboardRef.current?.setPositions(positions).render();
  }, [positions, chord, chordVoicing, scale]);

  useEffect(() => {
    fretboardRef.current?.style({
      text: (position: FretboardPosition) =>
        textProperty && position[textProperty]
          ? `${position[textProperty]}`
          : "",
      ...style,
    });
  }, [style, textProperty]);

  return { ref, fretboardRef };
}
