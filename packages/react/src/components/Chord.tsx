import {
  DEFAULT_DIMENSIONS,
  getChordFretSpan,
  type Barre,
} from "@music-ui/fretboard";
import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Chord` component.
 * @property id The chord unique identifier.
 * @property className The component class name.
 * @property input The chord input (e.g. x32010).
 * @property chordName The chord name (e.g. C major, A7b9).
 * @property showName Shows the chord name.
 * @property includeOpenStrings Shows the open string notes.
 * @property barres The chord barres.
 */
export type ChordProps = Omit<
  UseFretboardParams,
  "scale" | "chord" | "positions"
> & {
  id?: string;
  className?: string;
  input: string;
  chordName?: string;
  showName?: boolean;
  includeOpenStrings?: boolean;
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
  showFretNumbers = false,
  showName = false,
  includeOpenStrings,
  barres,
  ...params
}: ChordProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount: params.fretCount || getChordFretSpan(input),
    showFretNumbers,
    width,
    chord: {
      input,
      chordName,
      includeOpenStrings,
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
