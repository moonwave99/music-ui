"use client";

import { usePiano, type UsePianoParams } from "./usePiano";

type PianoProps = UsePianoParams & {
  className?: string;
};

export function Piano({ className, ...params }: PianoProps) {
  const { ref } = usePiano(params);
  return <div className={className} ref={ref}></div>;
}
