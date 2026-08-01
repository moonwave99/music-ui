import { useEffect, useRef, RefObject } from "react";
import { initAbc, type InitABCParams } from "@music-ui/abc";

export type UseAbcParams = Pick<InitABCParams, "id" | "content">;
export type UseAbc = {
  staffRef: RefObject<HTMLDivElement>;
  audioControlsRef: RefObject<HTMLDivElement>;
};

export function useAbc(params: UseAbcParams) {
  const staffRef = useRef<HTMLDivElement>(null);
  const audioControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAbc({
      staffElement: staffRef.current as HTMLElement,
      audioControlsElement: audioControlsRef.current as HTMLElement,
      ...params,
    });
  }, [params]);

  return { staffRef, audioControlsRef };
}
