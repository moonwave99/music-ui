import { useId, type ReactElement } from "react";
import { Piano, type PianoProps } from "./Piano";
import { normalizeInput } from "@music-ui/piano";
import { usePlayer } from "./PlayerProvider";

export type PianoPlayerProps = PianoProps & {
  label?: string;
  playLabel?: string;
  arpeggioLabel?: string;
  arpeggioSpeed?: number;
};

export function PianoPlayer({
  label = "",
  playLabel = "Play",
  arpeggioLabel = "Arpeggio",
  arpeggioSpeed,
  ...props
}: PianoPlayerProps): ReactElement {
  const id = useId();
  const { notes, className, ...rest } = props;
  const { play, isPlaying, activeNotes } = usePlayer({
    id,
    notes: normalizeInput(String(notes)),
  });
  return (
    <figure className={className}>
      <Piano activeNotes={activeNotes} notes={notes} {...rest} />
      <figcaption>{label}</figcaption>
      <div className="actions">
        <button disabled={isPlaying} onClick={() => play({ mode: "block" })}>
          {playLabel}
        </button>
        <button
          disabled={isPlaying}
          onClick={() => play({ mode: "arpeggio", speed: arpeggioSpeed })}
        >
          {arpeggioLabel}
        </button>
      </div>
    </figure>
  );
}
