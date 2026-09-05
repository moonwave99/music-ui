import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Chord` component.
 * @property id The chord unique identifier.
 * @property className The component class name.
 * @property showName Show the chord name or not.
 */
export type ChordProps = Omit<UseFretboardParams, "chord"> &
  UseFretboardParams["chord"] & {
    id?: string;
    className?: string;
    name?: string;
    showName?: boolean;
  };

/**
 * A component that renders a guitar chord diagram.
 */
export function Chord({
  className = "chord",
  chordName,
  fretCount = 3,
  showFretNumbers = false,
  showName = true,
  ...params
}: ChordProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount,
    showFretNumbers,
    chord: {
      ...params,
      chordName,
    },
  });
  return (
    <figure className={className}>
      <div ref={ref}></div>
      {showName && chordName ? <figcaption>{chordName}</figcaption> : null}
    </figure>
  );
}
