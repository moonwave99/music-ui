import { useRef, RefObject } from "react";
import { useDeepCompareLayoutEffect } from "use-deep-compare";
import { initAbc, type InitABCParams, InitAbc } from "@music-ui/abc";
export { type OnAbcClickParams } from "@music-ui/abc";

export type UseAbcParams = Pick<InitABCParams, "content" | "onClick">;

export type UseAbc<T extends HTMLElement> = {
  staffRef: RefObject<T | null>;
  abcRef: RefObject<InitAbc | null>;
};

export function useAbc<T extends HTMLElement>(params: UseAbcParams): UseAbc<T> {
  const staffRef = useRef<T>(null);
  const abcRef = useRef<InitAbc>(null);

  useDeepCompareLayoutEffect(() => {
    abcRef.current = initAbc({
      staffElement: staffRef.current as T,
      ...params,
    });
  }, [params]);

  return { staffRef, abcRef };
}
