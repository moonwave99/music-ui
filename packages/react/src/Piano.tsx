import { type ReactElement } from "react";
import { usePiano, type UsePianoParams } from "./usePiano";

export type PianoProps = UsePianoParams & {
  id?: string;
  className?: string;
};

export function Piano({ className, ...params }: PianoProps): ReactElement {
  const { ref } = usePiano<HTMLDivElement>(params);
  return <div className={className} ref={ref}></div>;
}
