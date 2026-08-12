import {
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  type Ref,
  RefObject,
} from "react";
import { Piano, type PianoOptions } from "@music-ui/piano";
import type { NoteInput } from "@music-ui/core";

export type UsePianoParams = Partial<PianoOptions> & {
  notes?: NoteInput;
  noteLabels?: NoteInput;
  playedNotes?: NoteInput;
  imperativeRef?: Ref<ImperativePiano>;
};

export type ImperativePiano = Pick<Piano, "setNotes" | "clearNotes">;

export type UsePiano<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

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
    if (pianoRef.current) {
      return;
    }
    pianoRef.current = new Piano({
      element: ref.current,
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
