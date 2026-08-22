import { use, useLayoutEffect, useRef } from "react";
import { initPianoWithPlayer } from "@music-ui/piano";
import { PlayerContext } from "@music-ui/react";

export function VanillaPianoWithPlayer() {
  const playerContext = use(PlayerContext);
  if (!playerContext) {
    throw new Error("usePlayer has to be used within <PlayerProvider>");
  }
  const { player } = playerContext;

  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    if (!player || !firstRender.current) {
      return;
    }
    firstRender.current = false;
    initPianoWithPlayer({
      selection:
        ref.current!.querySelectorAll<HTMLElement>(".piano-with-player"),
      player,
    });
  }, [player]);

  return (
    <div ref={ref}>
      <div
        className="piano-with-player"
        data-notes="C4 E4 G4 B4"
        data-note-labels="1 3 5 7"
        data-octaves="5"
        data-id="piano-1"
      >
        <div className="piano"></div>
        <div className="controls"></div>
      </div>
      <div
        className="piano-with-player"
        data-notes="C4 Eb4 G4 Bb4"
        data-note-labels="1 3 5 7"
        data-octaves="5"
        data-with-final-c="false"
        data-show-octaves
        data-id="piano-2"
      >
        <div className="piano"></div>
        <div className="controls"></div>
      </div>
    </div>
  );
}
