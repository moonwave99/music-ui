import { use, useLayoutEffect, useRef } from "react";
import { initABCScoreWithPlayer } from "@music-ui/abc";
import { PlayerContext } from "@music-ui/react";
import { getDataAttributes } from "./utils";

const scores = [
  {
    options: {
      showTempo: false,
      showTimeSignature: false,
    },
    content: `T: Vanilla 1
M: 4/4
Q: 85
CD EF GA Bc|`,
  },
  {
    options: {
      showTempo: false,
      showTimeSignature: false,
    },
    content: `T: Vanilla 2
M: 1/1
L: 1/1
Q: 200
CD EF GA Bc|`,
  },
  {
    options: {
      showPiano: true,
      highlightBars: true,
    },
    content: `T: Vanilla 3
M: 4/4
L: 1/4
Q: 80
CD EF | GA Bc|`,
  },
  {
    options: {
      showTempo: false,
      showTimeSignature: false,
    },
    content: `T: Vanilla 4
M: 1/1
L: 1/1
Q: 200
C ^F | [C ^F] |`,
  },
];

export function VanillaABCScore() {
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
    initABCScoreWithPlayer({
      selection: ref.current!.querySelectorAll<HTMLElement>(".abc-score"),
      player,
    });
  }, [player]);

  return (
    <div ref={ref}>
      {scores.map(({ content, options }, index) => (
        <div
          key={index}
          className="abc-score"
          data-id={`score-${index + 1}`}
          {...getDataAttributes(options)}
        >
          <div className="content">{content}</div>
          <div className="staff"></div>
          <div className="controls"></div>
        </div>
      ))}
    </div>
  );
}
