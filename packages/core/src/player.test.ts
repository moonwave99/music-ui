// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { PlayerPosition, type PlaybackInfo } from "./player";
import { type ToneEventCallback } from "tone";
import { type TransportClass } from "tone/build/esm/core/clock/Transport";
import type { DrawClass } from "tone/build/esm/core/util/Draw";
import type { Sampler } from "tone";

//@ts-expect-error Hard to mock the whole thing without having vi.mock to complain
vi.mock(import("Tone"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Part: class {
      private progressFn: ToneEventCallback<PlaybackInfo>;
      private scoreData: PlaybackInfo[];
      constructor(
        progressFn: ToneEventCallback<PlaybackInfo>,
        scoreData: PlaybackInfo[],
      ) {
        this.progressFn = progressFn;
        this.scoreData = scoreData;
      }
      start(position: PlayerPosition) {
        const [, beat] = position.split(":");
        this.progressFn(0, this.scoreData[Number(beat)]!);
      }
      clear() {}
    },
    getDraw: () =>
      ({
        cancel: vi.fn(),
        schedule: (fn: () => void) => fn(),
      }) as unknown as DrawClass,
    getTransport: () =>
      new (class {
        private handlers: Record<string, () => void>;
        public bpm: { value: number };
        public position: PlayerPosition;
        constructor() {
          this.handlers = {};
          this.bpm = {
            value: 120,
          };
          this.position = "0:0:0";
        }
        on(eventName: string, handler: () => void) {
          this.handlers[eventName] = handler;
        }
        stop() {
          const handler = this.handlers.stop;
          if (!handler) {
            return;
          }
          handler();
        }
        start() {
          const handler = this.handlers.start;
          if (!handler) {
            return;
          }
          handler();
        }
        pause() {
          const handler = this.handlers.pause;
          if (!handler) {
            return;
          }
          handler();
        }
      })() as unknown as TransportClass,
  };
});

vi.mock(import("./lib"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    createSampler: () =>
      ({
        triggerAttackRelease: vi.fn(),
      }) as unknown as Sampler,
  };
});

import { Player } from "./player";
import { getAbcScore } from "./utils";

describe("Player - constructor", () => {
  it("Creates a new player with default options", () => {
    const player = new Player();
    expect(player.getScore()).toBe(null);
  });
});

describe("Player - events", () => {
  it("Listens to the player events", async () => {
    const player = new Player();

    const onProgress = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();

    player.on("progress", onProgress);
    player.on("pause", onPause);
    player.on("stop", onStop);

    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);

    player.play();
    player.pause();
    player.stop();

    await wait();

    expect(onProgress).toHaveBeenCalledWith({
      activeId: "1",
      playedNotes: ["C4"],
      position: "0:0:0",
    });
    expect(onPause).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
  });
});

describe("Player - seek", () => {
  it("Seeks to the passed position", async () => {
    const player = new Player();

    const onProgress = vi.fn();
    player.on("progress", onProgress);

    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    player.seekTo("0:1:0");
    player.play();

    await wait();

    expect(onProgress).toHaveBeenCalledWith({
      activeId: "1",
      playedNotes: ["D4"],
      position: "0:1:0",
    });
  });
});

const wait = (ms = 50) => new Promise((r) => setTimeout(r, ms));
