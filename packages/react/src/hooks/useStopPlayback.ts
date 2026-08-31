import { use, useCallback } from "react";
import { PlayerContext } from "../PlayerProvider";

/**
 * Properties exposed by the `useStopPlayback` hook.
 * @property stop Stops the current playback.
 */
export type UseStopPlayback = {
  stop: () => void;
};

/**
 * Hook used to stop current playback. Useful when navigating away from a page.
 * @throws `useStopPlayback has to be used within a <PlayerProvider>` if the component is not a descendant of a {@link PlayerProvider}.
 * @returns { UseStopPlayback } The properties exposed by the hook.
 */
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
