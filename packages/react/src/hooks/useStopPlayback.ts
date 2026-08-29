import { use, useCallback } from "react";
import { PlayerContext } from "../PlayerProvider";

export type UseStopPlayback = {
  stop: () => void;
};

export function useStopPlayback(): UseStopPlayback {
  const context = use(PlayerContext);

  if (!context) {
    throw new Error("useStopPlayback has to be used within a <PlayerProvider>");
  }

  const { setCurrentScore, player } = context;

  const stop = useCallback(() => {
    player?.setScore(null);
    player?.stop();
    setCurrentScore(null);
  }, [player, setCurrentScore]);

  return { stop };
}
