"use client";

import { usePiano } from "./usePiano";

interface PianoViewProps {
  className?: string;
  notes?: string;
}

export function PianoView({ className, notes }: PianoViewProps) {
  const { ref } = usePiano({ notes });
  return <div className={className} ref={ref}></div>;
}
