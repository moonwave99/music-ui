import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Fretboard` component.
 * @property id The fretboard unique identifier.
 * @property className The component class name.
 */
export type FretboardProps = UseFretboardParams & {
  id?: string;
  className?: string;
};

/**
 * A component wrapped around the `@music-ui/fretboard` Fretboard class.
 */
export function Fretboard({ className, ...params }: FretboardProps) {
  const { ref } = useFretboard<HTMLDivElement>(params);
  return <div className={className} ref={ref}></div>;
}
