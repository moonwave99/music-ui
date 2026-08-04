import { useLayoutEffect, useRef, RefObject } from "react";
import { initAbc, type InitABCParams, InitABC } from "@music-ui/abc";

export type UseAbcParams = Pick<
  InitABCParams,
  "id" | "content" | "onNotesChange"
>;
export type UseAbc = Pick<InitABC, "play" | "stop"> & {
  togglePlayback: () => void;
  restart: () => void;
  staffRef: RefObject<HTMLDivElement>;
  audioControlsRef: RefObject<HTMLDivElement>;
};

export function useAbc(params: UseAbcParams) {
  const staffRef = useRef<HTMLDivElement>(null);
  const audioControlsRef = useRef<HTMLDivElement>(null);
  const abcRef = useRef<InitABC>(null);
  const isPlaying = useRef(false);

  function play() {
    abcRef.current?.play();
  }

  function stop() {
    // NOTE: hack to comply with custom abc.js library playback
    abcRef.current?.stop();
    abcRef.current?.play();
    abcRef.current?.stop();
  }

  function togglePlayback() {
    if (isPlaying.current) {
      stop();
      isPlaying.current = false;
      return;
    }
    play();
    isPlaying.current = true;
  }

  function restart() {
    abcRef.current?.restart();
  }

  useLayoutEffect(() => {
    initAbc({
      staffElement: staffRef.current as HTMLElement,
      audioControlsElement: audioControlsRef.current as HTMLElement,
      onPlaybackFinished: () => {
        isPlaying.current = false;
      },
      ...params,
    }).then((abc) => {
      abcRef.current = abc;
    });
    return () => {
      abcRef.current?.stop();
    };
  }, [params]);

  return { staffRef, audioControlsRef, play, stop, togglePlayback, restart };
}
