import { useLayoutEffect, useRef, RefObject } from "react";
import { initAbc, type InitABCParams } from "@music-ui/abc";

export type UseAbcParams = Pick<InitABCParams, "id" | "content">;

export type UseAbc = {
  staffRef: RefObject<HTMLDivElement>;
};

export function useAbc(params: UseAbcParams) {
  const staffRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    initAbc({
      staffElement: staffRef.current as HTMLElement,
      ...params,
    });
  }, [params]);

  return { staffRef };
}
