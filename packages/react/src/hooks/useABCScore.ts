import { useRef, RefObject } from "react";
import { useDeepCompareLayoutEffect } from "use-deep-compare";
import { ABCScore, type ABCScoreParams } from "@music-ui/abc";
export { type OnABCClickParams } from "@music-ui/abc";

export type UseABCScoreParams = Omit<ABCScoreParams, "element">;

export type UseABCScore<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  abcRef: RefObject<ABCScore | null>;
};

export function useABCScore<T extends HTMLElement>(
  params: UseABCScoreParams,
): UseABCScore<T> {
  const ref = useRef<T>(null);
  const abcRef = useRef<ABCScore>(null);

  useDeepCompareLayoutEffect(() => {
    abcRef.current = new ABCScore({
      element: ref.current!,
      ...params,
    }).render();
  }, [params]);

  return { ref, abcRef };
}
