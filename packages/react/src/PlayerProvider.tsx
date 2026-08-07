import {
  createContext,
  use,
  useState,
  useEffect,
  type Context,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";

import {
  Player,
  type Score,
  PlayerCallback,
  PlayerEvents,
} from "@music-ui/core";

let _player: Player;

function getPlayer(): Player {
  if (!_player) {
    _player = new Player();
  }
  return _player;
}

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

export type UsePlayer = {
  play: (score: Score) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  playerStatus: PlayerStatus;
  playedNotes: string[];
};

export type PlayerStatus = "playing" | "paused" | "stopped";

export function usePlayer(id: string): UsePlayer {
  const playerContext = use(PlayerContext);
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
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
        setPlayerStatus("stopped");
      },
      playing: ({ playedNotes, activeId }) => {
        if (id !== activeId) {
          setPlayerStatus("stopped");
          return;
        }
        setPlayerStatus("playing");
        setPlayedNotes(playedNotes);
      },
      finished: () => {
        setPlayerStatus("stopped");
        setPlayedNotes([]);
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
  }, [player, id]);

  function play(score: Score) {
    if (!score) {
      return;
    }
    if (currentScore?.hash !== score.hash) {
      player?.setScore(score);
      setCurrentScore(score);
    }
    player?.play();
  }

  function resume() {
    player?.play();
  }

  function pause() {
    player?.pause();
  }

  function stop() {
    player?.stop();
  }

  return { play, pause, resume, stop, playedNotes, playerStatus };
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
