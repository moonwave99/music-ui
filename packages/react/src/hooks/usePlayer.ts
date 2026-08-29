import { use, useState, useEffect, useCallback } from "react";
import type {
  Score,
  TransportPosition,
  PlayerStatus,
  PlayerEvents,
  PlayerCallback,
} from "@music-ui/core";
import { PlayerContext } from "../PlayerProvider";

export type UsePlayerParams = {
  id: string;
  onStop?: () => void;
};

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
