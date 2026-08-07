"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStopPlayback } from "@music-ui/react";

export function RouteChangeListener() {
  const firstRender = useRef(true);
  const pathname = usePathname();
  const { stop } = useStopPlayback();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stop();
  }, [pathname, stop]);

  return null;
}
