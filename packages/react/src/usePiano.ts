import { useLayoutEffect, useRef, type RefObject } from "react";
import { Piano, type PianoOptions, SetNotesParams } from "@music-ui/piano";

export type UsePianoParams = Partial<PianoOptions> & {
  notes?: SetNotesParams;
  noteLabels?: string | string[];
  activeNotes?: string[];
};

export type UsePiano<T extends HTMLElement> = {
  ref: RefObject<T | null>;
};

export function usePiano<T extends HTMLElement>({
  notes,
  noteLabels,
  activeNotes,
  startOctave = 2,
  octaves = 4,
}: UsePianoParams): UsePiano<T> {
  const ref = useRef<T>(null);
  const pianoRef = useRef<Piano>(null);

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
    if (!activeNotes) {
      return;
    }
    pianoRef.current?.setActiveNotes(activeNotes);
    return () => {
      pianoRef.current?.clearActiveNotes();
    };
  }, [activeNotes]);

  return { ref };
}
