import {
  useLayoutEffect,
  type ReactNode,
  ReactElement,
  useCallback,
  useId,
} from "react";
import {
  OnABCClickParams,
  useABCScore,
  type UseABCScoreParams,
} from "./useABCScore";
import { usePlayer } from "./PlayerProvider";
import { Piano, type PianoProps } from "./Piano";
import { getAbcScore, joinVoices } from "@music-ui/core";

export type ABCScoreProps = UseABCScoreParams & {
  id?: string;
  children: ReactNode;
  className?: string;
  pianoOptions?: PianoProps;
  showPiano?: boolean;
  showTempo?: boolean;
  showPlayer?: boolean;
  playButtonLabel?: string;
  stopButtonLabel?: string;
  pauseButtonLabel?: string;
};

export function ABCScore({
  className = "abc-score",
  children,
  pianoOptions = {},
  playButtonLabel = "Play",
  pauseButtonLabel = "Pause",
  stopButtonLabel = "Stop",
  showPiano = false,
  showPlayer = true,
  showTempo = true,
  showTimeSignature = true,
  ...params
}: ABCScoreProps): ReactElement {
  const componentId = useId();
  const id = params.id || componentId;
  const input = getNodeText(children);
  const score = getAbcScore({
    id,
    input,
    options: { showTempo },
  });

  const {
    play,
    pause,
    stop,
    resume,
    seekTo,
    isCurrentScore,
    playedNotes,
    playerStatus,
    position,
  } = usePlayer({ id, onStop: () => abcRef.current?.clearSelection() });

  const isCurrent = isCurrentScore(score);

  const onClick = useCallback(
    ({ position }: OnABCClickParams) => {
      if (!isCurrent) {
        return;
      }
      seekTo(position);
    },
    [seekTo, isCurrent],
  );

  const { ref, abcRef } = useABCScore<HTMLDivElement>({
    showTimeSignature,
    content: score.content,
    onClick,
  });

  useLayoutEffect(() => {
    abcRef.current?.updatePosition(position);
  }, [position, abcRef]);

  return (
    <div className={className}>
      <div className="score-staff" ref={ref}></div>
      {showPlayer ? (
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
      {showPiano ? (
        <Piano
          notes={isCurrent ? joinVoices(playedNotes) : []}
          {...pianoOptions}
        />
      ) : null}
    </div>
  );
}

function getNodeText(node: ReactNode): string {
  if (!node) {
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
