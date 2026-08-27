import { use, useLayoutEffect, useRef } from "react";
import { initPianoWithPlayer } from "@music-ui/piano";
import { PlayerContext } from "@music-ui/react";
import { getDataAttributes } from "./utils";

const pianos = [
  {
    notes: "C4 E4 G4 B4",
    labels: "1 3 5 7",
    octaves: 5,
    id: "piano-1",
  },
  {
    notes: "C4 Eb4 G4 Bb4",
    labels: "1 3 5 7",
    octaves: 5,
    withFinalC: false,
    showOctaves: true,
    id: "piano-2",
  },
];

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
      {pianos.map((options, index) => (
        <div
          key={index}
          className="piano-with-player"
          {...getDataAttributes(options)}
        >
          <div className="piano"></div>
          <div className="controls"></div>
        </div>
      ))}
    </div>
  );
}
