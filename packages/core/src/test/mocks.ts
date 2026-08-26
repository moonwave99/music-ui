import { type ToneEventCallback } from "tone";
import { PlaybackInfo } from "../player";
import { TransportPosition } from "../types";

export class MockedTransport {
  private handlers: Record<string, (() => void)[]>;
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
    /* istanbul ignore if  */
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  }
  off(eventName: string) {
    delete this.handlers[eventName];
  }
  cancel() {}
  stop() {
    this.handlers.stop?.forEach((handler) => handler());
  }
  start() {
    const [, beat] = this.position.split(":");
    this.noteIndex = Number(beat);
    this.playNext();
    this.handlers.start?.forEach((handler) => handler());
  }
  pause() {
    this.handlers.pause?.forEach((handler) => handler());
  }
  playNext() {
    this.parts.forEach((part) => part.playAt(this.noteIndex));
    this.noteIndex++;
    this.position = `0:${this.noteIndex}:0`;
  }
  playUntilEnd() {
    /* istanbul ignore if  */
    if (!this.parts.length) {
      return;
    }
    while (this.noteIndex < this.parts[0]!.length) {
      this.playNext();
    }
    this.reset();
  }
  reset() {
    this.noteIndex = 0;
    this.position = "0:0:0";
  }
}

export class MockedPart {
  private progressFn: ToneEventCallback<PlaybackInfo>;
  private scoreData: PlaybackInfo[];
  public length: number;
  constructor(
    progressFn: ToneEventCallback<PlaybackInfo>,
    scoreData: PlaybackInfo[],
  ) {
    this.progressFn = progressFn;
    this.scoreData = scoreData;
    this.length = scoreData.length;
  }
  playAt(index: number) {
    const eventToPlay = this.scoreData.at(index);
    if (!eventToPlay) {
      return;
    }
    this.progressFn(eventToPlay.time, eventToPlay);
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
    /* istanbul ignore next  */
    reset() {
      transport.reset();
      while (parts.length > 0) {
        parts.pop();
      }
    },
  };
}
