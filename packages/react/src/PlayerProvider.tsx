import {
  createContext,
  use,
  useState,
  useEffect,
  useCallback,
  type Context,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type {
  Score,
  Player,
  PlayerCallback,
  PlayerEvents,
  TransportPosition,
} from "@music-ui/core";

export type PlayerStatus = "playing" | "paused" | "stopped";

type PlayerContextType = {
  player: Player | null;
  currentScore: Score | null;
  setCurrentScore: Dispatch<SetStateAction<Score | null>>;
};

export const PlayerContext: Context<PlayerContextType | null> =
  createContext<PlayerContextType | null>(null);

export type UsePlayerParams = {
  id: string;
  onStop?: () => void;
};

export type UsePlayer = {
  play: (score: Score) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (position: TransportPosition) => void;
  isCurrentScore: (score: Score) => boolean;
  playerStatus: PlayerStatus;
  playedNotes: string[][];
  position: TransportPosition;
};

const EMPTY_VOICES = [[], [], [], []] as string[][];

export function usePlayer({ id, onStop }: UsePlayerParams): UsePlayer {
  const playerContext = use(PlayerContext);
  if (!playerContext) {
    throw new Error("usePlayer has to be used within <PlayerProvider>");
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
    (score: Score) => {
      if (!score) {
        return;
      }
      if (currentScore?.hash !== score.hash) {
        player?.setScore(score);
        setCurrentScore(score);
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

  return {
    play,
    pause,
    resume,
    stop,
    seekTo,
    isCurrentScore,
    playedNotes,
    playerStatus,
    position,
  };
}

export function useStopPlayback() {
  const context = use(PlayerContext);

  if (!context) {
    throw new Error("usePlayer has to be used within <PlayerProvider>");
  }

  const { setCurrentScore, player } = context;

  const stop = useCallback(() => {
    player?.setScore(null);
    player?.stop();
    setCurrentScore(null);
  }, [player, setCurrentScore]);

  return {
    stop,
  };
}

type PlayerProviderProps = {
  children: ReactNode;
  player: Player | null;
};

export function PlayerProvider({ player, children }: PlayerProviderProps) {
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  return (
    <PlayerContext value={{ player, currentScore, setCurrentScore }}>
      {children}
    </PlayerContext>
  );
}
