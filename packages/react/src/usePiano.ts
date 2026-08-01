import { useEffect, useRef } from "react";
import { Piano, type PianoOptions, SetNotesParams } from "@music-ui/piano";

export type UsePianoParams = Partial<PianoOptions> & {
  notes?: SetNotesParams;
};

export function usePiano({
  notes,
  startOctave = 2,
  octaves = 4,
}: UsePianoParams) {
  const ref = useRef(null);
  const pianoRef = useRef<Piano>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (notes) {
      pianoRef.current?.setNotes(notes);
    }
    return () => {
      pianoRef?.current?.clearNotes();
    };
  }, [notes]);

  return { ref };
}
