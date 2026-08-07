import { type ReactElement } from "react";
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
  ...props
}: PianoPlayerProps): ReactElement {
  const { notes = [], className, ...rest } = props;
  const { play, playerStatus, playedNotes } = usePlayer(props.id);

  return (
    <figure className={className}>
      <Piano playedNotes={playedNotes} notes={notes} {...rest} />
      <figcaption>{label}</figcaption>
      <div className="actions">
        <button
          disabled={playerStatus === "playing"}
          onClick={() => play(getPianoScore({ id: props.id, input: notes }))}
        >
          {playLabel}
        </button>
        <button
          disabled={playerStatus === "playing"}
          onClick={() =>
            play(
              getPianoScore({
                id: props.id,
                input: notes,
                playbackMode: "arpeggio",
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
