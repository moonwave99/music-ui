import { useId } from "react";
import { Piano, type PianoProps } from "./Piano";
import { usePlayer } from "../hooks/usePlayer";
import { getPianoScore, joinVoices } from "@music-ui/core";

/**
 * Props expected by the `PianoWithPlayer` component.
 * @property id The piano unique identifier.
 * @property description The piano description.
 * @property playLabel The playback label.
 * @property arpeggioLabel The playback arpeggio label.
 * @property arpeggioSpeed The arpeggio playback speed.
 */
export type PianoWithPlayerProps = PianoProps & {
  id: string;
  description?: string;
  playLabel?: string;
  arpeggioLabel?: string;
  arpeggioSpeed?: number;
};

/**
 * A component that adds playback to a {@link Piano}.
 */
export function PianoWithPlayer({
  description = "",
  playLabel = "Play",
  arpeggioLabel = "Arpeggio",
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
          disabled={playerStatus === "playing"}
          onClick={() => play(getPianoScore({ id, input: notes }))}
        >
          {playLabel}
        </button>
        <button
          disabled={playerStatus === "playing"}
          onClick={() =>
            play(
              getPianoScore({
                id,
                input: notes,
                playbackMode: "arpeggio",
                bpm: arpeggioSpeed,
              }),
            )
          }
        >
          {arpeggioLabel}
        </button>
      </div>
      <figcaption>{description}</figcaption>
    </figure>
  );
}
