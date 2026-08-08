"use client";

import { type ReactNode, ReactElement } from "react";
import { useAbc } from "./useAbc";
import { usePlayer } from "./PlayerProvider";
import { Piano, type PianoProps } from "./Piano";
import { getAbcScore } from "@music-ui/core";

export type ScoreProps = {
  id: string;
  hidePlayer?: boolean;
  children: ReactNode;
  className?: string;
  pianoOptions?: PianoProps & {
    show?: boolean;
  };
  playButtonLabel?: string;
  stopButtonLabel?: string;
  pauseButtonLabel?: string;
};

export function Score({
  className = "score",
  children,
  pianoOptions = { show: false },
  playButtonLabel = "Play",
  pauseButtonLabel = "Pause",
  stopButtonLabel = "Stop",
  hidePlayer = false,
  ...params
}: ScoreProps): ReactElement {
  const content = getNodeText(children);
  const { play, pause, stop, resume, playedNotes, playerStatus } = usePlayer(
    params.id,
  );
  const { staffRef } = useAbc<HTMLDivElement>({ ...params, content });
  const score = getAbcScore({ ...params, content });

  return (
    <div className={className}>
      <div className="score-staff" ref={staffRef}></div>
      {!hidePlayer ? (
        <div className="score-audio-controls">
          <button
            className="score-button score-play-button"
            onClick={() => (playerStatus === "paused" ? resume() : play(score))}
            aria-label={playButtonLabel}
            disabled={playerStatus === "playing"}
          >
            {playButtonLabel}
          </button>
          <button
            className="score-button score-pause-button"
            onClick={pause}
            aria-label={pauseButtonLabel}
            disabled={playerStatus !== "playing"}
          >
            {pauseButtonLabel}
          </button>
          <button
            className="score-button score-stop-button"
            onClick={stop}
            aria-label={stopButtonLabel}
            disabled={playerStatus === "stopped"}
          >
            {stopButtonLabel}
          </button>
        </div>
      ) : null}
      {pianoOptions.show ? (
        <Piano notes={playedNotes} {...pianoOptions} />
      ) : null}
    </div>
  );
}

function getNodeText(node: ReactNode): string {
  if (node === null) {
    return "";
  }
  switch (typeof node) {
    case "string":
    case "number":
      return node.toString();
    case "boolean":
      return "";
    case "object": {
      if (Array.isArray(node)) {
        return node.map(getNodeText).join("");
      }
      if (!("props" in node)) {
        return "";
      }
      return getNodeText((node.props as { children?: ReactNode })?.children);
    }
    default:
      console.warn("Unresolved `node` of type:", typeof node, node);
      return "";
  }
}
