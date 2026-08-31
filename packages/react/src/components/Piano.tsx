import { usePiano, type UsePianoParams } from "../hooks/usePiano";

/**
 * Props expected by the `Piano` component.
 * @property id The piano unique identifier.
 * @property className The component class name.
 */
export type PianoProps = UsePianoParams & {
  id?: string;
  className?: string;
};

/**
 * A component wrapped around the `@music-ui/piano` Piano class.
 */
export function Piano({ className, ...params }: PianoProps) {
  const { ref } = usePiano<HTMLDivElement>(params);
  return <div className={className} ref={ref}></div>;
}
