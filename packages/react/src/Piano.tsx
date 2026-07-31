"use client";

import { usePiano, type UsePainoParams } from "./usePiano";

type PianoProps = UsePainoParams & {
  className?: string;
};

export function Piano({ className, ...params }: PianoProps) {
  const { ref } = usePiano(params);
  return <div className={className} ref={ref}></div>;
}
