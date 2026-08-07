"use client";

import { type ReactNode, ReactElement } from "react";
import { useAbc } from "./useAbc";
import { usePlayer } from "./PlayerProvider";
import { Piano } from "./Piano";
import { getAbcScore } from "@music-ui/core";

export type ScoreProps = {
  id: string;
  hidePlayer?: boolean;
  children: ReactNode;
  className?: string;
  showPiano?: boolean;
  playbackButtonLabel?: string;
  restartButtonLabel?: string;
};

export function Score({
  className = "score",
  children,
  showPiano = false,
  playbackButtonLabel = "Toggle Playback",
  restartButtonLabel = "Restart",
  hidePlayer = false,
  ...params
}: ScoreProps): ReactElement {
  const content = getNodeText(children);
  const { play, pause, stop, resume, playedNotes, playerStatus } = usePlayer(
    params.id,
  );
  const { staffRef } = useAbc({ ...params, content });

  const score = getAbcScore(params.id, content);

  function togglePlayback() {
    if (playerStatus === "stopped") {
      play(score);
      return;
    }
    if (playerStatus === "playing") {
      pause();
      return;
    }
    if (playerStatus === "paused") {
      resume();
      return;
    }
  }

  return (
    <div className={className}>
      <div className="score-staff" ref={staffRef}></div>
      {!hidePlayer ? (
        <div className="score-audio-controls">
          <button
            className="score-button score-toggle-playback-button"
            onClick={togglePlayback}
            aria-label={playbackButtonLabel}
          >
            {playbackButtonLabel}
          </button>
          <button
            className="score-button score-restart-button"
            onClick={stop}
            aria-label={restartButtonLabel}
          >
            {restartButtonLabel}
          </button>
        </div>
      ) : null}
      {showPiano ? <Piano notes={playedNotes} /> : null}
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
