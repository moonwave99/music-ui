import { useLayoutEffect, useRef } from "react";
import { initOscillatorWithOscilloscope, OscPlayer } from "@music-ui/osc";
import { getDataAttributes } from "./utils";

const oscillators = [
  {
    frequency: 440,
    label: "A4",
    volume: 0.6,
    duration: 2,
  },
  {
    frequency: 880,
    label: "A5",
    volume: 0.6,
    duration: 3,
  },
  {
    frequency: 1760,
    label: "A6",
    volume: 0.6,
    duration: 3,
  },
] as const;

export function VanillaOscillator() {
  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef<OscPlayer>(null);

  useLayoutEffect(() => {
    if (playerRef.current) {
      return;
    }
    const context = new AudioContext();
    const analyzer = new AnalyserNode(context, {
      smoothingTimeConstant: 1,
      fftSize: 2048,
    });
    playerRef.current = new OscPlayer({ context, analyzer });
    initOscillatorWithOscilloscope({
      player: playerRef.current,
      selection: ref.current!,
    });
    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="oscillators-wrapper" ref={ref}>
      <div className="oscillators">
        {oscillators.map((oscillator, index) => (
          <div
            key={index}
            className="oscillator"
            {...getDataAttributes(oscillator)}
          ></div>
        ))}
      </div>
      <div className="oscilloscope"></div>
    </div>
  );
}
