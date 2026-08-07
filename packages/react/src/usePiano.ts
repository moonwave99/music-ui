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
  playedNotes?: string[];
  imperativeRef?: Ref<ImperativePiano>;
};

export type ImperativePiano = { setNotes: (notes: string[]) => void };

export type UsePiano<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

export function usePiano<T extends HTMLElement>({
  notes,
  noteLabels,
  playedNotes,
  startOctave = 2,
  octaves = 4,
  imperativeRef,
}: UsePianoParams): UsePiano<T> {
  const ref = useRef<T>(null);
  const pianoRef = useRef<Piano>(null);

  useImperativeHandle(imperativeRef, () => ({
    setNotes: (notes: string[]) => pianoRef.current?.setNotes(notes),
  }));

  useLayoutEffect(() => {
    if (pianoRef.current) {
      return;
    }
    pianoRef.current = new Piano({
      el: ref.current,
      octaves,
      startOctave,
    });
    pianoRef.current.render();
  }, [octaves, startOctave]);

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
