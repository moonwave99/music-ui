// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { type TransportPosition } from "./types";
import { type PlaybackInfo } from "./player";
import { type ToneEventCallback, Sampler } from "tone";

//@ts-expect-error Hard to mock the whole thing without having vi.mock to complain
vi.mock(import("tone"), async (importOriginal) => {
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
      // #TODO play part from Transport and not from Part
      start(position: TransportPosition) {
        const [, beat] = position.split(":");
        const eventsToPlay = this.scoreData.slice(Number(beat));
        eventsToPlay.forEach((event) => this.progressFn(event.time, event));
      }
      clear() {}
    },
    getDraw: () => ({
      cancel: vi.fn(),
      schedule: (fn: () => void) => fn(),
    }),
    getTransport: () =>
      new (class {
        private handlers: Record<string, () => void>;
        public bpm: { value: number };
        public position: TransportPosition;
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
        off(eventName: string) {
          delete this.handlers[eventName];
        }
        cancel() {}
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
      })(),
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
    const onFinished = vi.fn();

    player.on("progress", onProgress);
    player.on("pause", onPause);
    player.on("stop", onStop);
    player.on("finished", onFinished);

    const input = "CDEF";

    const score = getAbcScore({
      id: "1",
      input,
    });
    player.setScore(score);

    await player.play();
    player.pause();
    player.stop();

    expect(onPause).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
    expect(onFinished).toHaveBeenCalled();

    input.split("").forEach((x) => {
      expect(onProgress).toHaveBeenCalledWith({
        activeId: "1",
        voice: 0,
        playedNotes: [[`${x}4`]],
        position: `0:0:0`,
      });
    });
  });
});

describe("Player - play", () => {
  it("Does nothing if no parts are present", async () => {
    const player = new Player();
    const onProgress = vi.fn();
    player.on("progress", onProgress);
    await player.play();
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe("Player - setScore", () => {
  it("Sets the current score", () => {
    const player = new Player();
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    expect(player.getScore()).toEqual(score);
    player.setScore(null);
    expect(player.getScore()).toEqual(null);
  });

  it("Does not recompute the parts if the new score has the same hash as the current one", () => {
    const player = new Player();
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    expect(player.getScore()).toEqual(score);
    player.setScore({ ...score });
    expect(player.getScore()).toEqual(score);
  });
});

describe("Player - destroy", () => {
  it("Removes all listeners, clears all parts and scheduled events", async () => {
    const player = new Player();
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    const onProgress = vi.fn();
    player.on("progress", onProgress);
    player.destroy();
    await player.play();
    expect(onProgress).not.toHaveBeenCalled();
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
    await player.play();

    expect(onProgress).toHaveBeenCalledWith({
      activeId: "1",
      playedNotes: [["D4"]],
      position: "0:1:0",
      voice: 0,
    });
  });
});
