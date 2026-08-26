import { use, useLayoutEffect, useRef } from "react";
import { initABCScoreWithPlayer } from "@music-ui/abc";
import { PlayerContext } from "@music-ui/react";

const scores = [
  `T: Vanilla 1
M: 4/4
Q: 85
CD EF GA Bc|`,
  `T: Vanilla 2
M: 4/4
L: 1/4
Q: 80
CD EF | GA Bc|`,
];

export function VanillaABCScore() {
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
    initABCScoreWithPlayer({
      selection: ref.current!.querySelectorAll<HTMLElement>(".abc-score"),
      player,
    });
  }, [player]);

  return (
    <div ref={ref}>
      <div
        className="abc-score"
        data-show-tempo="false"
        data-show-time-signature="false"
      >
        <div className="content">{scores[0]}</div>
        <div className="staff"></div>
        <div className="controls"></div>
      </div>
      <div className="abc-score" data-show-piano data-highlight-bars>
        <div className="content">{scores[1]}</div>
        <div className="staff"></div>
        <div className="controls"></div>
      </div>
    </div>
  );
}
