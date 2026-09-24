import {
  DEFAULT_COLORS,
  highlightDegreeFill,
  type GetScaleParams,
} from "@music-ui/fretboard";
import { useFretboard, type UseFretboardParams } from "../hooks/useFretboard";

/**
 * Props expected by the `Scale` component.
 * @property id The scale unique identifier.
 * @property className The component class name.
 * @property showName Shows the scale name.
 * @property highlightDegree Highlights the passed degree.
 */
export type ScaleProps = GetScaleParams &
  Omit<UseFretboardParams, "scale" | "chord" | "positions"> & {
    id?: string;
    className?: string;
    showName?: boolean;
    highlightDegree?: number;
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
  pickDegrees,
  displayBoxOnly = false,
  disableOtherBoxes = false,
  highlightDegree = undefined,
  style = {},
  display = "overflow",
  ...params
}: ScaleProps) {
  const { ref } = useFretboard<HTMLDivElement>({
    ...params,
    display,
    scale: {
      root,
      type,
      box,
      pickDegrees,
      displayBoxOnly,
      disableOtherBoxes,
    },
    style: {
      ...style,
      fill: highlightDegree
        ? highlightDegreeFill({ degree: highlightDegree })
        : DEFAULT_COLORS.positionFill,
    },
  });

  return (
    <figure className={className}>
      <div className="fretboard" ref={ref}></div>
      {showName ? <figcaption>{`${root} ${type}`}</figcaption> : null}
    </figure>
  );
}
