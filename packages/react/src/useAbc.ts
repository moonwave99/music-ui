import { useLayoutEffect, useRef, RefObject } from "react";
import { initAbc, type InitABCParams } from "@music-ui/abc";

export type UseAbcParams = Pick<InitABCParams, "content">;

export type UseAbc<T extends HTMLElement> = {
  staffRef: RefObject<T | null>;
};

export function useAbc<T extends HTMLElement>(params: UseAbcParams): UseAbc<T> {
  const staffRef = useRef<T>(null);
  useLayoutEffect(() => {
    initAbc({
      staffElement: staffRef.current as T,
      ...params,
    });
  }, [params]);

  return { staffRef };
}
