"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PlayerProvider } from "@music-ui/react";
import { RouteChangeListener } from "./RouteChangeListener";
import { type Player, playerFactory } from "@music-ui/core";

type ProviderWrapperProps = { children: ReactNode };

export function ProviderWrapper({ children }: ProviderWrapperProps) {
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const player = playerFactory();
    setPlayer(player);
    return () => {
      player.destroy();
    };
  }, []);

  return (
    <PlayerProvider player={player}>
      <RouteChangeListener />
      {children}
    </PlayerProvider>
  );
}
