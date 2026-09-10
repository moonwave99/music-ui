import {
  DEFAULT_COLORS,
  type FretboardPosition,
  type ScaleParams,
} from "@music-ui/fretboard";
import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Scale` component.
 * @property id The scale unique identifier.
 * @property className The component class name.
 * @property showName Shows the scale name.
 * @property highlightRoots Highlights root notes.
 */
export type ScaleProps = ScaleParams &
  Omit<UseFretboardParams, "scale" | "chord" | "positions"> & {
    id?: string;
    className?: string;
    showName?: boolean;
    highlightRoots?: boolean;
  };

/**
 * A component that renders a guitar scale diagram.
 */
export function Scale({
  className = "scale",
  showName = false,
  root,
  type,
  box,
  displayBoxOnly = false,
  highlightRoots = false,
  style = {},
  ...params
}: ScaleProps) {
  function fill({ degree }: FretboardPosition) {
    if (!highlightRoots || degree !== 1) {
      return DEFAULT_COLORS.positionFillColor;
    }
    return DEFAULT_COLORS.highlightFill;
  }

  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    scale: {
      root,
      type,
      box,
      displayBoxOnly,
    },
    style: {
      ...style,
      fill,
    },
  });

  return (
    <figure className={className}>
      <div ref={ref}></div>
      {showName ? <figcaption>{`${root} ${type}`}</figcaption> : null}
    </figure>
  );
}
