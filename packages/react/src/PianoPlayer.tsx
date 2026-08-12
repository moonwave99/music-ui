import { useId, type ReactElement } from "react";
import { Piano, type PianoProps } from "./Piano";
import { usePlayer } from "./PlayerProvider";
import { getPianoScore } from "@music-ui/core";

export type PianoPlayerProps = PianoProps & {
  id: string;
  label?: string;
  playLabel?: string;
  arpeggioLabel?: string;
  arpeggioSpeed?: number;
};

export function PianoPlayer({
  label = "",
  playLabel = "Play",
  arpeggioLabel = "Arpeggio",
  arpeggioSpeed = 120,
  className = "piano-player",
  ...props
}: PianoPlayerProps): ReactElement {
  const componentId = useId();
  const id = props.id || componentId;
  const { notes = [], ...rest } = props;
  const { play, playerStatus, playedNotes } = usePlayer(id);

  return (
    <figure className={className}>
      <Piano playedNotes={playedNotes} notes={notes} {...rest} />
      <figcaption>{label}</figcaption>
      <div className="actions">
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
    </figure>
  );
}
