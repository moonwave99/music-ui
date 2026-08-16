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

import {
  Player,
  type Score,
  PlayerCallback,
  PlayerEvents,
  PlayerPosition,
} from "@music-ui/core";

let _player: Player;

function getPlayer(): Player {
  if (!_player) {
    _player = new Player();
  }
  return _player;
}

export type PlayerStatus = "playing" | "paused" | "stopped";

type PlayerContextType = {
  player: Player | null;
  currentScore: Score | null;
  setCurrentScore: Dispatch<SetStateAction<Score | null>>;
};

const PlayerContext: Context<PlayerContextType> =
  createContext<PlayerContextType>({
    player: null,
    currentScore: null,
    setCurrentScore: () => {},
  });

export type UsePlayerParams = {
  id: string;
  onStop?: () => void;
};

export type UsePlayer = {
  play: (score: Score) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seekTo: (position: PlayerPosition) => void;
  playerStatus: PlayerStatus;
  playedNotes: string[][];
  position: PlayerPosition;
};

const EMPTY_VOICES = [[], []] as string[][];

export function usePlayer({ id, onStop }: UsePlayerParams): UsePlayer {
  const playerContext = use(PlayerContext);
  const [playedNotes, setPlayedNotes] = useState<string[][]>(EMPTY_VOICES);
  const [position, setPosition] = useState<PlayerPosition>("0:0:0");
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("stopped");

  if (!playerContext) {
    throw new Error("usePlayer has to be used within <PlayerProvider>");
  }

  const { player, currentScore, setCurrentScore } = playerContext;

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
      progress: ({ playedNotes, activeId, position, voice }) => {
        if (id !== activeId) {
          setPosition("0:0:0");
          setPlayerStatus("stopped");
          return;
        }
        setPosition(position);
        setPlayerStatus("playing");
        setPlayedNotes((prev) =>
          prev.map((notes, index) => (index === voice ? playedNotes : notes)),
        );
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
    (position: PlayerPosition) => {
      player?.seekTo(position);
    },
    [player],
  );

  return {
    play,
    pause,
    resume,
    stop,
    seekTo,
    playedNotes,
    playerStatus,
    position,
  };
}

export function useStopPlayback() {
  const { setCurrentScore, player } = use(PlayerContext);

  if (!setCurrentScore) {
    throw new Error("usePlayer has to be used within <PlayerProvider>");
  }

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
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const player = getPlayer();
    setPlayer(player);
    return () => {
      player.destroy();
    };
  }, []);

  return (
    <PlayerContext value={{ player, currentScore, setCurrentScore }}>
      {children}
    </PlayerContext>
  );
}
