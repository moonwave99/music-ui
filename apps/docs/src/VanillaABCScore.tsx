import { use, useLayoutEffect, useRef } from "react";
import { initABCScoreWithPlayer } from "@music-ui/abc";
import { PlayerContext } from "@music-ui/react";

const content = `
T: Vanilla
M: 4/4
Q: 120
CD EF GA Bc|`;

export function VanillaABCScore() {
  const playerContext = use(PlayerContext);
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const { player } = playerContext;

  useLayoutEffect(() => {
    if (!player || !firstRender.current) {
      return;
    }
    firstRender.current = false;
    initABCScoreWithPlayer({
      selection: ref.current!,
      player,
    });
  }, [player]);

  return (
    <div
      ref={ref}
      className="abc-score"
      data-show-tempo="false"
      data-show-time-signature="false"
    >
      <div className="content">{content}</div>
      <div className="staff score-staff"></div>
      <div className="controls score-audio-controls"></div>
    </div>
  );
}
