import {
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  type Ref,
  RefObject,
} from "react";
import { Piano, type PianoOptions } from "@music-ui/piano";
import type { NoteInput } from "@music-ui/core";

/**
 * The params expected by the `usePiano` function.
 * @property notes The notes to highlight.
 * @property noteLabels The corresponding note labels.
 * @property playedNotes The notes being currently played.
 * @property imperativeRef A reference to the `ImperativePiano` methods.
 */
export type UsePianoParams = Partial<PianoOptions> & {
  notes?: NoteInput;
  noteLabels?: NoteInput;
  playedNotes?: NoteInput;
  imperativeRef?: Ref<ImperativePiano>;
};

/**
 * The piano methods that can be called imperatively from outside the component.
 * @see {@link https://react.dev/reference/react/useImperativeHandle|React docs}
 */
export type ImperativePiano = Pick<Piano, "setNotes" | "clearNotes">;

/**
 * Properties exposed by the `usePiano` hook.
 * @property ref Reference to the `HTMLElement` where the piano will be rendered.
 */
export type UsePiano<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

/**
 * Hook used to render a piano on screen.
 * @param __namedParameters The parameters for rendering a piano on screen.
 * @returns { UsePiano } The properties exposed by the hook.
 */
export function usePiano<T extends HTMLElement>({
  notes,
  noteLabels,
  playedNotes,
  imperativeRef,
  ...rest
}: UsePianoParams): UsePiano<T> {
  const ref = useRef<T>(null);
  const pianoRef = useRef<Piano>(null);

  useImperativeHandle(imperativeRef, () => ({
    setNotes: (notes) => pianoRef.current!.setNotes(notes),
    clearNotes: () => pianoRef.current!.clearNotes(),
  }));

  useLayoutEffect(() => {
    /* istanbul ignore if  */
    if (pianoRef.current) {
      return;
    }
    pianoRef.current = new Piano({
      element: ref.current!,
      ...rest,
    });
    pianoRef.current.render();
  }, [rest]);

  useLayoutEffect(() => {
    if (notes) {
      pianoRef.current?.setNotes(notes, noteLabels);
    }
    return () => {
      pianoRef?.current?.clearNotes();
    };
  }, [notes, noteLabels]);

  useLayoutEffect(() => {
    if (!playedNotes) {
      return;
    }
    pianoRef.current?.setPlayedNotes(playedNotes);
    return () => {
      pianoRef.current?.clearPlayedNotes();
    };
  }, [playedNotes]);

  return { ref };
}
