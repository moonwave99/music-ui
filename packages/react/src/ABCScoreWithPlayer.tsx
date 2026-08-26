import {
  useState,
  useLayoutEffect,
  useCallback,
  useId,
  type ReactNode,
  ReactElement,
} from "react";
import {
  OnABCClickParams,
  useABCScore,
  type UseABCScoreParams,
} from "./useABCScore";
import { usePlayer } from "./PlayerProvider";
import { Piano, type PianoProps } from "./Piano";
import { TempoControl } from "./TempoControl";
import { getNodeText } from "./utils";
import { getAbcScore, joinVoices } from "@music-ui/core";

export type ABCScoreWithPlayerProps = UseABCScoreParams & {
  id?: string;
  children: ReactNode;
  className?: string;
  pianoOptions?: PianoProps;
  showPiano?: boolean;
  showTempo?: boolean;
  playButtonLabel?: string;
  stopButtonLabel?: string;
  pauseButtonLabel?: string;
};

export function ABCScoreWithPlayer({
  className = "abc-score",
  children,
  pianoOptions = {},
  playButtonLabel = "Play",
  pauseButtonLabel = "Pause",
  stopButtonLabel = "Stop",
  showPiano = false,
  showTempo = true,
  showTimeSignature = true,
  ...params
}: ABCScoreWithPlayerProps): ReactElement {
  const componentId = useId();
  const id = params.id || componentId;
  const input = getNodeText(children);
  const score = getAbcScore({
    id,
    input,
    options: { showTempo },
  });

  const originalTempo = score.info.bpm || 120;

  const [scoreBpm, setScoreBpm] = useState(originalTempo);
  const {
    play,
    pause,
    stop,
    resume,
    seekTo,
    setBpm,
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
    ...params,
  });

  useLayoutEffect(() => {
    abcRef.current?.updatePosition(position);
    if (params.highlightBars) {
      abcRef.current?.highlightBar(position);
    }
  }, [position, abcRef, params.highlightBars]);

  function onTempoChange(value: number) {
    setScoreBpm(value);
    if (isCurrent) {
      setBpm(value);
    }
  }

  function onTempoReset() {
    setScoreBpm(originalTempo);
    if (isCurrent) {
      setBpm(originalTempo);
    }
  }

  return (
    <div className={className}>
      <div className="staff" ref={ref}></div>
      <div className="controls">
        <button
          className="play-button"
          onClick={() => {
            if (playerStatus === "paused") {
              resume();
              return;
            }
            setBpm(scoreBpm);
            play(score, scoreBpm);
          }}
          aria-label={playButtonLabel}
          disabled={playerStatus === "playing"}
        >
          {playButtonLabel}
        </button>
        <button
          className="pause-button"
          onClick={pause}
          aria-label={pauseButtonLabel}
          disabled={playerStatus !== "playing"}
        >
          {pauseButtonLabel}
        </button>
        <button
          className="stop-button"
          onClick={stop}
          aria-label={stopButtonLabel}
          disabled={playerStatus === "stopped"}
        >
          {stopButtonLabel}
        </button>
        <TempoControl
          id={id}
          value={scoreBpm}
          onChange={onTempoChange}
          onReset={onTempoReset}
        />
      </div>
      {showPiano ? (
        <Piano
          notes={isCurrent ? joinVoices(playedNotes) : []}
          {...pianoOptions}
        />
      ) : null}
    </div>
  );
}
