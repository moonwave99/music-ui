import { useLayoutEffect, useRef } from "react";
import { initOscillator, OscPlayer } from "@music-ui/osc";
import { getDataAttributes } from "./utils";

const oscillators = [
  {
    frequency: 440,
    label: "A4",
    volume: 0.5,
    duration: 2,
  },
  {
    frequency: 880,
    label: "A5",
    volume: 0.1,
    duration: 5,
  },
] as const;

export function VanillaOscillator() {
  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef<OscPlayer>(null);

  useLayoutEffect(() => {
    if (playerRef.current) {
      return;
    }
    playerRef.current = new OscPlayer({ context: new AudioContext() });
    initOscillator({
      player: playerRef.current,
      selection:
        ref.current!.querySelectorAll<HTMLElement>("[data-oscillator]"),
    });
    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  return (
    <div ref={ref} className="oscillators">
      {oscillators.map((oscillator, index) => (
        <div
          key={index}
          data-oscillator
          className="oscillator"
          {...getDataAttributes(oscillator)}
        ></div>
      ))}
    </div>
  );
}
