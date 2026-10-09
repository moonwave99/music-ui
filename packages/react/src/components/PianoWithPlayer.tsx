import { useId, type ReactNode } from "react";
import { Piano, type PianoProps } from "./Piano";
import { usePlayer } from "../hooks/usePlayer";
import { getPlaybackScore, joinVoices } from "@music-ui/core";

/**
 * Props expected by the `PianoWithPlayer` component.
 * @property id The piano unique identifier.
 * @property description The piano description.
 * @property playButtonContent The playback button content.
 * @property arpeggioButtonContent The arpeggio button content
 * @property arpeggioSpeed The arpeggio playback speed.
 */
export type PianoWithPlayerProps = PianoProps & {
  id: string;
  description?: string;
  playButtonContent?: ReactNode;
  arpeggioButtonContent?: ReactNode;
  arpeggioSpeed?: number;
};

/**
 * A component that adds playback to a {@link Piano}.
 */
export function PianoWithPlayer({
  description = "",
  playButtonContent = "Play",
  arpeggioButtonContent = "Arpeggio",
  arpeggioSpeed = 120,
  className = "piano-with-player",
  ...props
}: PianoWithPlayerProps) {
  const componentId = useId();
  const id = props.id || componentId;
  const { notes = [], ...rest } = props;
  const { play, playerStatus, playedNotes } = usePlayer({ id });

  return (
    <figure className={className}>
      <Piano playedNotes={joinVoices(playedNotes)} notes={notes} {...rest} />
      <div className="controls">
        <button
          className="play-block-button"
          disabled={playerStatus === "playing"}
          onClick={() => play(getPlaybackScore({ id, input: notes }))}
        >
          {playButtonContent}
        </button>
        <button
          className="play-arpeggio-button"
          disabled={playerStatus === "playing"}
          onClick={() =>
            play(
              getPlaybackScore({
                id,
                input: notes,
                playbackMode: "arpeggio",
                bpm: arpeggioSpeed,
              }),
            )
          }
        >
          {arpeggioButtonContent}
        </button>
      </div>
      <figcaption>{description}</figcaption>
    </figure>
  );
}
