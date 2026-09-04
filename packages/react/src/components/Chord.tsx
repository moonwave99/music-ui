import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Chord` component.
 * @property id The chord unique identifier.
 * @property className The component class name.
 */
export type ChordProps = UseFretboardParams & {
  id?: string;
  className?: string;
};

/**
 * A component wrapped around the `@music-ui/fretboard` Fretboard class.
 */
export function Chord({ className, ...params }: ChordProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount: 3,
  });
  return <div className={className} ref={ref}></div>;
}
