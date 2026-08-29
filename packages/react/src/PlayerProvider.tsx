import {
  createContext,
  useState,
  type Context,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Score, Player } from "@music-ui/core";

type PlayerContextType = {
  player: Player | null;
  currentScore: Score | null;
  setCurrentScore: Dispatch<SetStateAction<Score | null>>;
};

export const PlayerContext: Context<PlayerContextType | null> =
  createContext<PlayerContextType | null>(null);

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
