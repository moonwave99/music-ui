import { useId, useEffect, type ReactNode } from "react";
import { type ChordProps } from "./Chord";
import { usePlayer } from "../hooks/usePlayer";
import { getPlaybackScore, areNotesEquivalent } from "@music-ui/core";
import {
  DEFAULT_COLORS,
  DEFAULT_DIMENSIONS,
  getChordFretSpan,
} from "@music-ui/fretboard";
import { useFretboard } from "../hooks/useFretboard";

/**
 * Props expected by the `ChordWithPlayer` component.
 * @property id The chord unique identifier.
 * @property instrument The playback instrument.
 * @property playedNoteColor The played note color.
 * @property playButtonContent The playback button content.
 * @property arpeggioButtonContent The arpeggio button content
 * @property arpeggioSpeed The arpeggio playback speed.
 */
export type ChordWithPlayerProps = ChordProps & {
  id?: string;
  instrument?: string;
  playedNoteColor?: string;
  playButtonContent?: ReactNode;
  arpeggioButtonContent?: ReactNode;
  arpeggioSpeed?: number;
};

/**
 * A component that adds playback to a {@link Chord}.
 */
export function ChordWithPlayer({
  className = "chord-with-player",
  instrument = "acoustic_guitar_nylon",
  playedNoteColor = DEFAULT_COLORS.highlightFill,
  playButtonContent = "Play",
  arpeggioButtonContent = "Arpeggio",
  arpeggioSpeed = 120,
  input,
  chordName,
  width = DEFAULT_DIMENSIONS.chord,
  showFretNumbers = false,
  showName = false,
  includeOpenStrings,
  barres,
  ...params
}: ChordWithPlayerProps) {
  const componentId = useId();
  const id = params.id || componentId;
  const { play, playerStatus, playedNotes } = usePlayer({ id });
  const { ref, fretboardRef } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount: params.fretCount || getChordFretSpan(input),
    showFretNumbers,
    display: "contain",
    width,
    chord: {
      input,
      chordName,
      includeOpenStrings,
      barres,
    },
  });

  useEffect(() => {
    const notes = playedNotes.flat();
    fretboardRef.current?.style({
      fill: ({ noteWithOctave }) =>
        notes.some((x) => areNotesEquivalent(x, noteWithOctave!))
          ? playedNoteColor
          : DEFAULT_COLORS.positionFill,
    });
  }, [playedNotes, playedNoteColor, fretboardRef]);

  function getChordNotes() {
    return fretboardRef
      .current!.getChordPositions({ input, chordName })
      .toReversed()
      .map(({ noteWithOctave }) => noteWithOctave!);
  }

  return (
    <figure className={className}>
      <div className="fretboard" ref={ref}></div>
      <div className="controls">
        <button
          className="play-block-button"
          disabled={playerStatus === "playing"}
          onClick={() =>
            play(getPlaybackScore({ id, instrument, input: getChordNotes() }))
          }
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
                instrument,
                input: getChordNotes(),
                playbackMode: "arpeggio",
                bpm: arpeggioSpeed,
              }),
            )
          }
        >
          {arpeggioButtonContent}
        </button>
      </div>
      {showName && chordName ? <figcaption>{chordName}</figcaption> : null}
    </figure>
  );
}
