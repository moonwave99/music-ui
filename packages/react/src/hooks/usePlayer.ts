import { use, useState, useEffect, useCallback } from "react";
import type {
  Score,
  TransportPosition,
  PlayerStatus,
  PlayerEvents,
  PlayerCallback,
} from "@music-ui/core";
import { PlayerContext } from "../PlayerProvider";

/**
 * The params expected by the `usePlayer` function.
 * @property id The current score id
 * @property onStop Callback invoked when the playback stops.
 */
export type UsePlayerParams = {
  id: string;
  onStop?: () => void;
};

/**
 * Properties exposed by the `usePlayer` hook.
 * @property play Plays the current score.
 * @property pause Pauses the current playback.
 * @property resume Resumes the current playback.
 * @property stop Stops the current playback.
 * @property seekTo Seeks the current playback to the passed position.
 * @property setBpm Sets the transport bpm to the passed value.
 * @property isCurrentScore Tells if the passed score is the one being played.
 * @property playerStatus The current playback status.
 * @property playedNotes The notes being currently played.
 * @property position The current transport position.
 */
export type UsePlayer = {
  play: (score: Score, bpm?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (position: TransportPosition) => void;
  setBpm: (bpm: number) => void;
  isCurrentScore: (score: Score) => boolean;
  playerStatus: PlayerStatus;
  playedNotes: string[][];
  position: TransportPosition;
};

const EMPTY_VOICES = [[], [], [], []] as string[][];

/**
 * Hook used to playback scores.
 * @throws `usePlayer has to be used within a <PlayerProvider>` if the component is not a descendant of a {@link PlayerProvider}.
 * @param __namedParameters The expected parameters.
 * @returns { UsePlayer } The properties exposed by the hook.
 */
export function usePlayer({ id, onStop }: UsePlayerParams): UsePlayer {
  const playerContext = use(PlayerContext);
  if (!playerContext) {
    throw new Error("usePlayer has to be used within a <PlayerProvider>");
  }
  const { player, currentScore, setCurrentScore } = playerContext;
  const [playedNotes, setPlayedNotes] = useState<string[][]>(EMPTY_VOICES);
  const [position, setPosition] = useState<TransportPosition>("0:0:0");
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("stopped");

  useEffect(() => {
    const handlers: Record<PlayerEvents, PlayerCallback> = {
      pause: ({ activeId }) => {
        if (id !== activeId) {
          return;
        }
        setPlayerStatus("paused");
      },
      stop: ({ activeId }) => {
        if (id !== activeId) {
          return;
        }
        setPosition("0:0:0");
        setPlayerStatus("stopped");
        setPlayedNotes(EMPTY_VOICES);
        if (onStop) {
          onStop();
        }
      },
      progress: ({ playedNotes, activeId, position }) => {
        if (id !== activeId) {
          setPosition("0:0:0");
          setPlayerStatus("stopped");
          return;
        }
        setPosition(position);
        setPlayerStatus("playing");
        setPlayedNotes(playedNotes);
      },
      finished: () => {
        setPosition("0:0:0");
        setPlayerStatus("stopped");
        setPlayedNotes(EMPTY_VOICES);
      },
    } as const;

    const cancelHandlers = [] as (() => void)[];

    if (player) {
      (Object.keys(handlers) as PlayerEvents[]).forEach((key: PlayerEvents) => {
        cancelHandlers.push(player.on(key, handlers[key]));
      });
    }

    return () => {
      cancelHandlers.forEach((cancel) => cancel());
    };
  }, [player, id, onStop]);

  const play = useCallback(
    (score: Score, bpm?: number) => {
      if (currentScore?.hash !== score.hash) {
        player?.setScore(score);
        setCurrentScore(score);
      }
      if (bpm) {
        player?.setBpm(bpm);
      }
      player?.play();
    },
    [currentScore?.hash, player, setCurrentScore],
  );
  const resume = useCallback(() => player?.play(), [player]);
  const pause = useCallback(() => player?.pause(), [player]);
  const stop = useCallback(() => player?.stop(), [player]);
  const seekTo = useCallback(
    (position: TransportPosition) => player?.seekTo(position),
    [player],
  );
  const isCurrentScore = useCallback(
    ({ id }: Score) => player?.getScore()?.id === id,
    [player],
  );

  const setBpm = useCallback((bpm: number) => player?.setBpm(bpm), [player]);

  return {
    play,
    pause,
    resume,
    stop,
    seekTo,
    setBpm,
    isCurrentScore,
    playedNotes,
    playerStatus,
    position,
  };
}
