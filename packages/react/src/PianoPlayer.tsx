import { useId, type ReactElement } from "react";
import { Piano, type PianoProps } from "./Piano";
import { normalizeInput } from "@music-ui/piano";
import { usePlayer } from "./PlayerProvider";

export type PianoPlayerProps = PianoProps;

export function PianoPlayer(props: PianoPlayerProps): ReactElement {
  const id = useId();
  const { notes, className, ...rest } = props;
  const { play, isPlaying, activeNotes } = usePlayer({
    id,
    notes: normalizeInput(String(notes)),
  });

  return (
    <div className={className}>
      <Piano activeNotes={activeNotes} notes={notes} {...rest} />
      <div className="actions">
        <button disabled={isPlaying} onClick={() => play()}>
          Play
        </button>
        <button disabled={isPlaying} onClick={() => play("arpeggio")}>
          Arpeggio
        </button>
      </div>
    </div>
  );
}
