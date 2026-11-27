import { vi } from "vitest";

export function getOscPlayerDependencies() {
  const context = {
    createOscillator: () => ({
      connect: () => vi.fn(),
      frequency: {
        value: 0,
      },
      start: vi.fn(),
    }),
    createGain: () => ({
      connect: () => vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    }),
  } as unknown as AudioContext;
  const analyzer = {
    connect: () => vi.fn(),
  } as unknown as AnalyserNode;

  return { context, analyzer };
}
