import {
  createContext,
  useState,
  type Context,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Score, Player } from "@music-ui/core";

/**
 * The Player context.
 * @property player The `Player` instance.
 * @property currentScore The current `Score`.
 * @property setCurrentScore The current `Score` setter.
 */
type PlayerContext = {
  player: Player | null;
  currentScore: Score | null;
  setCurrentScore: Dispatch<SetStateAction<Score | null>>;
};

export const PlayerContext: Context<PlayerContext | null> =
  createContext<PlayerContext | null>(null);

/**
 * The params expected by the `PlayerProvider`.
 * @property children The component tree that will have access to the `PlayerContext`.
 * @property player The `Player` instance.
 */
type PlayerProviderProps = {
  children: ReactNode;
  player: Player | null;
};

/**
 * A provider that exposes the `Player` and the current `Score` to the descendants.
 * @param __namedParameters  The parameters expected by the provider.
 * @returns
 */
export function PlayerProvider({ player, children }: PlayerProviderProps) {
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  return (
    <PlayerContext value={{ player, currentScore, setCurrentScore }}>
      {children}
    </PlayerContext>
  );
}
