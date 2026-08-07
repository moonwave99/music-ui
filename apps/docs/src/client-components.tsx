"use client";

import { useId } from "react";

import {
  Piano,
  PianoPlayer as Player,
  Score,
  PianoPlayerProps,
} from "@music-ui/react";

function PianoPlayer(props: PianoPlayerProps) {
  const { id: propsId, ...rest } = props;
  const id = useId();
  return <Player className="piano-player" id={propsId || id} {...rest} />;
}

export { Piano, PianoPlayer, Score };
