"use client";

import {
  Piano,
  PianoPlayer as Player,
  Score,
  PianoPlayerProps,
} from "@music-ui/react";

function PianoPlayer(props: PianoPlayerProps) {
  return <Player className="piano-player" {...props} />;
}

export { Piano, PianoPlayer, Score };
