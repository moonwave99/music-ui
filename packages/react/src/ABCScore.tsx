import { type ReactNode, ReactElement, useId } from "react";
import { useABCScore, type UseABCScoreParams } from "./useABCScore";
import { getAbcScore } from "@music-ui/core";
import { getNodeText } from "./utils";

export type ABCScoreProps = UseABCScoreParams & {
  id?: string;
  children: ReactNode;
  className?: string;
  showTempo?: boolean;
};

export function ABCScore({
  className = "abc-score",
  children,
  showTempo = true,
  showTimeSignature = true,
  ...params
}: ABCScoreProps): ReactElement {
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
