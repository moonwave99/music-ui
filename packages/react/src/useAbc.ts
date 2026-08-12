import { useRef, RefObject } from "react";
import { useDeepCompareLayoutEffect } from "use-deep-compare";
import { ABCScore, type ABCScoreParams } from "@music-ui/abc";
export { type OnABCClickParams } from "@music-ui/abc";

export type UseAbcParams = Pick<ABCScoreParams, "content" | "onClick">;

export type UseAbc<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  abcRef: RefObject<ABCScore | null>;
};

export function useAbc<T extends HTMLElement>(params: UseAbcParams): UseAbc<T> {
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
