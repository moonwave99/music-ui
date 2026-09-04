import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Chord` component.
 * @property id The chord unique identifier.
 * @property className The component class name.
 * @property label The chord label.
 */
export type ChordProps = Omit<UseFretboardParams, "chord"> &
  UseFretboardParams["chord"] & {
    id?: string;
    className?: string;
    label?: string;
  };

/**
 * A component wrapped around the `@music-ui/fretboard` Fretboard class.
 */
export function Chord({ className = "chord", label, ...params }: ChordProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    fretCount: 3,
    chord: params,
  });
  return (
    <figure className={className}>
      <div ref={ref}></div>
      {label ? <figcaption>{label}</figcaption> : null}
    </figure>
  );
}
