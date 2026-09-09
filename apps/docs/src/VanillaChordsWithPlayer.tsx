import { use, useLayoutEffect, useRef } from "react";
import { initChordsWithPlayer } from "@music-ui/fretboard";
import { getDataAttributes } from "./utils";
import { PlayerContext } from "@music-ui/react";

const chords = [
  {
    input: "x32010",
    chordName: "C major",
    showFretNumbers: true,
    includeOpenStrings: true,
  },
  {
    input: "x5454x",
    chordName: "D7b9",
    showNoteNames: true,
    showFretNumbers: true,
  },
  {
    input: "131233",
    chordName: "F7#9",
    showNoteNames: true,
    showFretNumbers: true,
    barres: "1:6:4,3:2",
  },
] as const;

export function VanillaChordsWithPlayer() {
  const playerContext = use(PlayerContext);
  if (!playerContext) {
    throw new Error("usePlayer has to be used within a <PlayerProvider>");
  }
  const { player } = playerContext;
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    if (!player || !firstRender.current) {
      return;
    }
    firstRender.current = false;
    initChordsWithPlayer({
      player,
      selection: ref.current!.querySelectorAll<HTMLElement>("[data-chord]"),
      playedNoteColor: "orange",
    });
  }, [player]);

  return (
    <div ref={ref} className="chords">
      {chords.map((chord, index) => (
        <figure key={index} data-chord className="chord-with-player">
          <div className="fretboard" {...getDataAttributes(chord)}></div>
          <div className="controls"></div>
          <figcaption>{chord.chordName}</figcaption>
        </figure>
      ))}
    </div>
  );
}
