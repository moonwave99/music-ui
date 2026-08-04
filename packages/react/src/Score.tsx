"use client";

import { useRef, type ReactNode, ReactElement } from "react";
import { useAbc, type UseAbcParams } from "./useAbc";
import { type ImperativePiano } from "./usePiano";
import { Piano } from "./Piano";

export type ScoreProps = Omit<UseAbcParams, "content"> & {
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
  ...params
}: ScoreProps): ReactElement {
  const content = getNodeText(children);
  const pianoRef = useRef<ImperativePiano>(null);
  const { staffRef, audioControlsRef, togglePlayback, restart } = useAbc({
    ...params,
    content,
    onNotesChange: (notes: string[]) => {
      pianoRef.current?.setNotes(notes);
    },
  });

  return (
    <div className={className}>
      <div className="score-staff" ref={staffRef}></div>
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
          onClick={restart}
          aria-label={restartButtonLabel}
        >
          {restartButtonLabel}
        </button>
        <div className="abcjs-inline-audio" ref={audioControlsRef}></div>
      </div>
      {showPiano ? <Piano imperativeRef={pianoRef} /> : null}
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
