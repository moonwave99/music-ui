import { useId, type ReactElement } from "react";
import { Piano, type PianoProps } from "./Piano";
import { usePlayer } from "../hooks/usePlayer";
import { getPianoScore, joinVoices } from "@music-ui/core";

export type PianoWithPlayerProps = PianoProps & {
  id: string;
  label?: string;
  playLabel?: string;
  arpeggioLabel?: string;
  arpeggioSpeed?: number;
};

export function PianoWithPlayer({
  label = "",
  playLabel = "Play",
  arpeggioLabel = "Arpeggio",
  arpeggioSpeed = 120,
  className = "piano-with-player",
  ...props
}: PianoWithPlayerProps): ReactElement {
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
      <figcaption>{label}</figcaption>
    </figure>
  );
}
