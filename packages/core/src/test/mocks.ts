import { type ToneEventCallback } from "tone";
import { PlaybackInfo } from "../player";
import { TransportPosition } from "../types";

export class MockedTransport {
  private handlers: Record<string, () => void>;
  public bpm: { value: number };
  public position: TransportPosition;
  public timeSignature: number | number[];
  private parts: MockedPart[];
  private noteIndex: number;
  constructor(parts: MockedPart[]) {
    this.handlers = {};
    this.bpm = {
      value: 120,
    };
    this.position = "0:0:0";
    this.timeSignature = [4, 4];
    this.parts = parts;
    this.noteIndex = 0;
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
    const [, beat] = this.position.split(":");
    this.noteIndex = Number(beat);
    this.parts.forEach((part) => part.playAt(this.noteIndex));
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
  next() {
    this.parts.forEach((part) => part.playAt(++this.noteIndex));
  }
  playUntilEnd() {
    this.parts.forEach((part) => part.playThrough());
  }
  reset() {
    this.noteIndex = 0;
  }
}

export class MockedPart {
  private progressFn: ToneEventCallback<PlaybackInfo>;
  private scoreData: PlaybackInfo[];
  constructor(
    progressFn: ToneEventCallback<PlaybackInfo>,
    scoreData: PlaybackInfo[],
  ) {
    this.progressFn = progressFn;
    this.scoreData = scoreData;
  }
  playAt(index: number) {
    const eventToPlay = this.scoreData.at(index);
    if (!eventToPlay) {
      return;
    }
    this.progressFn(eventToPlay.time, eventToPlay);
  }
  playThrough() {
    this.scoreData.forEach((event) => this.progressFn(event.time, event));
  }
  start() {}
  clear() {}
}

export function getMockedPlayerParams() {
  const parts: MockedPart[] = [];
  const transport = new MockedTransport(parts);
  return {
    draw: {
      cancel: () => {},
      schedule: (fn: () => void) => fn(),
    },
    transport,
    startAudio: async () => {},
    sampler: {
      triggerAttackRelease: () => {},
    },
    getPart: (
      callback: ToneEventCallback<PlaybackInfo>,
      info: PlaybackInfo[],
    ) => {
      const part = new MockedPart(callback, info);
      parts.push(part);
      return part;
    },
    reset() {
      transport.reset();
      while (parts.length > 0) {
        parts.pop();
      }
    },
  };
}
