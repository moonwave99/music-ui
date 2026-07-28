import { useEffect, useRef } from "react";
import Piano from "@repo/piano/Piano";

type UsePainoParams = {
  notes?: string;
  octaves?: number;
  startOctave?: number;
};

export function usePiano({
  notes,
  startOctave = 2,
  octaves = 4,
}: UsePainoParams) {
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
      pianoRef.current?.setNotes(notes.split(" "));
    }
    return () => {
      pianoRef?.current?.clearNotes();
    };
  }, [notes]);

  return { ref };
}
