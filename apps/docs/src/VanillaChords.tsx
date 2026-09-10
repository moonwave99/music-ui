import { useLayoutEffect, useRef } from "react";
import { initChords } from "@music-ui/fretboard";
import { getDataAttributes } from "./utils";

const chords = [
  {
    input: "x32010",
    chordName: "C major",
    showFretNumbers: true,
  },
  {
    input: "x5454x",
    chordName: "D7b9",
    showNoteNames: true,
    showFretNumbers: true,
  },
  {
    input: "131244",
    chordName: "F7#9",
    showNoteNames: true,
    showFretNumbers: true,
    barres: "1:6:4,4:2",
  },
] as const;

export function VanillaChords() {
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    if (!firstRender.current) {
      return;
    }
    firstRender.current = false;
    initChords({
      selection: ref.current!.querySelectorAll<HTMLElement>("[data-chord]"),
    });
  }, []);

  return (
    <div ref={ref} className="chords">
      {chords.map((chord, index) => (
        <figure key={index}>
          <div data-chord className="chord" {...getDataAttributes(chord)}></div>
          <figcaption>{chord.chordName}</figcaption>
        </figure>
      ))}
    </div>
  );
}
