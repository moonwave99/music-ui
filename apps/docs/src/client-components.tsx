"use client";

import {
  Piano,
  PianoPlayer as Player,
  Abc,
  PianoPlayerProps,
} from "@music-ui/react";

function PianoPlayer(props: PianoPlayerProps) {
  return <Player className="piano-player" {...props} />;
}

export { Piano, PianoPlayer, Abc };
