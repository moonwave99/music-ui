import { useId, type ReactNode } from "react";
import { useABCScore, type UseABCScoreParams } from "../hooks/useABCScore";
import { getAbcScore } from "@music-ui/core";
import { getNodeText } from "../utils";

/**
 * Props expected by the `ABCScore` component.
 * @property id The score unique identifier.
 * @property children The `textContext` containing the ABC notation.
 * @property className The component class name.
 * @property showTempo Displays or hides the score tempo indicator.
 */
export type ABCScoreProps = UseABCScoreParams & {
  id?: string;
  children: ReactNode;
  className?: string;
  showTempo?: boolean;
};

/**
 * A component wrapped around the `@music-ui/abc` ABCScore class.
 */
export function ABCScore({
  className = "abc-score",
  children,
  showTempo = true,
  showTimeSignature = true,
  ...params
}: ABCScoreProps) {
  const componentId = useId();
  const id = params.id || componentId;
  const input = getNodeText(children);
  const score = getAbcScore({
    id,
    input,
    options: { showTempo },
  });

  const { ref } = useABCScore<HTMLDivElement>({
    showTimeSignature,
    content: score.content,
    ...params,
  });

  return (
    <div className={className}>
      <div className="staff" ref={ref}></div>
    </div>
  );
}
