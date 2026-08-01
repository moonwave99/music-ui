"use client";

import type { ReactNode } from "react";
import { PlayerProvider } from "@music-ui/react";

type ProviderWrapperProps = { children: ReactNode };

export function ProviderWrapper({ children }: ProviderWrapperProps) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
