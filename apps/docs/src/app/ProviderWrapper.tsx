"use client";

import type { ReactNode } from "react";
import { PlayerProvider } from "@music-ui/react";
import { RouteChangeListener } from "./RouteChangeListener";

type ProviderWrapperProps = { children: ReactNode };

export function ProviderWrapper({ children }: ProviderWrapperProps) {
  return (
    <PlayerProvider>
      <RouteChangeListener />
      {children}
    </PlayerProvider>
  );
}
