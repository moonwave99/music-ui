import { DEFAULT_COLORS } from "../constants";
import { type FretboardPosition } from "./Fretboard";

type HighlightDegreeFillParams = {
  degree?: number;
  fill?: string;
  highlightFill?: string;
};

export function highlightDegreeFill({
  degree = 1,
  fill = DEFAULT_COLORS.positionFill,
  highlightFill = DEFAULT_COLORS.highlightFill,
}: HighlightDegreeFillParams = {}) {
  return (position: FretboardPosition) =>
    position.degree === degree ? highlightFill : fill;
}
