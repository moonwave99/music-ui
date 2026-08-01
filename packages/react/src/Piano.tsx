import { usePiano, type UsePianoParams } from "./usePiano";

export type PianoProps = UsePianoParams & {
  className?: string;
};

export function Piano({ className, ...params }: PianoProps) {
  const { ref } = usePiano(params);
  return <div className={className} ref={ref}></div>;
}
