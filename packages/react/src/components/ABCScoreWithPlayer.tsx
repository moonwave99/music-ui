import { useState, useEffect, useCallback, useId, type ReactNode } from "react";
import type { ABCScoreProps } from "./ABCScore";
import { OnABCClickParams, useABCScore } from "../hooks/useABCScore";
import { usePlayer } from "../hooks/usePlayer";
import { Piano, type PianoProps } from "./Piano";
import { TempoControl, type TempoControlProps } from "./TempoControl";
import { getNodeText } from "../utils";
import { extractIndentedInput, getAbcScore, joinVoices } from "@music-ui/core";

/**
 * Props expected by the `ABCScoreWithPlayer` component.
 * @property showPiano Displays or hides the piano view.
 * @property pianoOptions Props expected by the `Piano` renderer.
 * @property showTempoControls Displays or hides the tempo controls.
 * @property playButtonLabel The play button aria label.
 * @property stopButtonLabel The stop button aria label.
 * @property pauseButtonLabel The pause button aria label.
 * @property playButtonContent The play button content.
 * @property stopButtonContent The stop button content.
 * @property pauseButtonContent The pause button content.
 */
export type ABCScoreWithPlayerProps = ABCScoreProps &
  Pick<TempoControlProps, "resetButtonContent"> & {
    showPiano?: boolean;
    pianoOptions?: PianoProps;
    showTempoControls?: boolean;
    playButtonLabel?: string;
    stopButtonLabel?: string;
    pauseButtonLabel?: string;
    playButtonContent?: ReactNode;
    stopButtonContent?: ReactNode;
    pauseButtonContent?: ReactNode;
  };

/**
 * A component that adds playback to a {@link ABCScore}.
 */
export function ABCScoreWithPlayer({
  className = "abc-score",
  children,
  pianoOptions = {},
  playButtonLabel = "Play",
  pauseButtonLabel = "Pause",
  stopButtonLabel = "Stop",
  playButtonContent = "Play",
  stopButtonContent = "Pause",
  pauseButtonContent = "Stop",
  showTempoControls = true,
  showTempo = true,
  showPiano = false,
  showTimeSignature = true,
  ...params
}: ABCScoreWithPlayerProps) {
  const componentId = useId();
  const id = params.id || componentId;
  const score = getAbcScore({
    id,
    input: extractIndentedInput(getNodeText(children)),
    options: { showTempo },
  });

  const originalTempo = score.info.bpm;

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

  useEffect(() => {
    abcRef.current?.updatePosition(position);
    if (!params.highlightBars) {
      return;
    }
    abcRef.current?.highlightBar(position);
  }, [position, abcRef, params.highlightBars]);

  function onTempoChange(value: number) {
    setScoreBpm(value);
    if (!isCurrent) {
      return;
    }
    setBpm(value);
  }

  function onTempoReset() {
    setScoreBpm(originalTempo);
    if (!isCurrent) {
      return;
    }
    setBpm(originalTempo);
  }

  function onPlayClick() {
    if (playerStatus === "paused") {
      resume();
      return;
    }
    setBpm(scoreBpm);
    play(score, scoreBpm);
  }

  function getButtonLabel(label: string) {
    return `${label} ${score.info.title || `score ${id}`}`;
  }

  return (
    <div className={className}>
      <div className="staff" ref={ref}></div>
      <div className="controls">
        <button
          className="play-button"
          onClick={onPlayClick}
          aria-label={getButtonLabel(playButtonLabel)}
          disabled={playerStatus === "playing"}
        >
          {playButtonContent}
        </button>
        <button
          className="pause-button"
          onClick={pause}
          aria-label={getButtonLabel(pauseButtonLabel)}
          disabled={playerStatus !== "playing"}
        >
          {pauseButtonContent}
        </button>
        <button
          className="stop-button"
          onClick={stop}
          aria-label={getButtonLabel(stopButtonLabel)}
          disabled={playerStatus === "stopped"}
        >
          {stopButtonContent}
        </button>
        {showTempoControls ? (
          <TempoControl
            id={id}
            value={scoreBpm}
            onChange={onTempoChange}
            onReset={onTempoReset}
            resetButtonContent={params.resetButtonContent}
          />
        ) : null}
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
