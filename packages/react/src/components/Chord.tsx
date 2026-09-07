import {
  DEFAULT_CHORD_FRET_COUNT,
  DEFAULT_DIMENSIONS,
  type Barre,
} from "@music-ui/fretboard";
import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Chord` component.
 * @property id The chord unique identifier.
 * @property className The component class name.
 * @property input The chord input (e.g. x32010).
 * @property chordName The chord name (e.g. C major, A7b9).
 * @property showName Show the chord name or not.
 * @property showOpenStrings Show the open string notes or not.
 * @property barres The chord barres.
 */
export type ChordProps = Omit<UseFretboardParams, "chord"> & {
  id?: string;
  className?: string;
  input: string;
  chordName?: string;
  showName?: boolean;
  showOpenStrings?: boolean;
  barres?: Barre | Barre[];
};

/**
 * A component that renders a guitar chord diagram.
 */
export function Chord({
  className = "chord",
  input,
  chordName,
  width = DEFAULT_DIMENSIONS.chord,
  fretCount = DEFAULT_CHORD_FRET_COUNT,
  showFretNumbers = false,
  showName = true,
  showOpenStrings,
  barres,
  ...params
}: ChordProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount,
    showFretNumbers,
    width,
    chord: {
      input,
      chordName,
      showOpenStrings,
      barres,
    },
  });
  return (
    <figure className={className}>
      <div ref={ref}></div>
      {showName && chordName ? <figcaption>{chordName}</figcaption> : null}
    </figure>
  );
}
