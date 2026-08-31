import { useRef, RefObject } from "react";
import { useDeepCompareLayoutEffect } from "use-deep-compare";
import { ABCScore, type ABCScoreParams } from "@music-ui/abc";
export { type OnABCClickParams } from "@music-ui/abc";

/**
 * The params expected by the `useABCScore` function.
 */
export type UseABCScoreParams = Omit<ABCScoreParams, "element">;

/**
 * Properties exposed by the `useABCScore` hook.
 * @property ref Reference to the `HTMLElement` where the score will be rendered.
 * @property abcRef Reference to the `ABCScore` class.
 */
export type UseABCScore<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  abcRef: RefObject<ABCScore | null>;
};

/**
 * Hook used to render an abc score on screen.
 * @param params The params expected by the `ABCScore` class.
 * @returns { UseABCScore } The properties exposed by the hook.
 */
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
