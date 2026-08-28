import type { Unit } from "tone";
import { type NoteJSON } from "@tonejs/midi/dist/Note";
import { EventEmitter } from "events";
import type { TransportPosition, TimeSignature, Score } from "./types";
import {
  normalizedPositionToTonePosition,
  tonePositionToNormalizedPosition,
} from "./utils";
import { END_NOTE } from "./lib";
import { ScoreManager } from "./scoreManager";

export type PlaybackNote = NoteJSON;

export type PlaybackInfo = {
  time: number;
  duration: number;
  notes: PlaybackNote[];
  velocity: number;
};

export type PlayerOptions = {
  timeTolerance: number;
};

const DEFAULT_OPTIONS = {
  timeTolerance: 0.02,
} as const;

export type PlayerCallback = (params: {
  playedNotes: string[][];
  activeId: string;
  position: TransportPosition;
  voice: number;
}) => void;

export type PlayerEvents = "stop" | "pause" | "progress" | "finished";

export type Transport = {
  on: (eventName: "start" | "stop" | "pause", callback: () => void) => void;
  off: (eventName: "start" | "stop" | "pause", callback?: () => void) => void;
  cancel: (time: Unit.Time) => void;
  bpm: {
    value: number;
  };
  timeSignature: number | number[];
  position: Unit.Time;
  start: () => void;
  stop: () => void;
  pause: () => void;
};

export type Draw = {
  cancel: (time: Unit.Time) => void;
  schedule: (callback: () => void, time: Unit.Time) => void;
};

export type Sampler = {
  triggerAttackRelease: (
    notes: string[] | string,
    duration: Unit.Time | Unit.Time[],
    time?: Unit.Time,
    velocity?: number,
  ) => void;
};

export type Part = {
  start: (time: Unit.Time) => void;
  clear: (time?: Unit.Time) => void;
};

const transportEvents = ["start", "stop", "pause"] as const;

export const DEFAULT_TIME_SIGNATURE = [4, 4] as TimeSignature;

export const BPM_RANGE = [20, 200] as const;

type GetPart = (
  callback: (time: number, chord: PlaybackInfo) => void,
  info: PlaybackInfo[],
) => Part;

type PlayerParams = {
  sampler: Sampler;
  transport: Transport;
  draw: Draw;
  startAudio: () => Promise<void>;
  getPart: GetPart;
  options?: PlayerOptions;
};

export class Player {
  private sampler: Sampler;
  private parts: Part[];
  private transport: Transport;
  private draw: Draw;
  private startAudio: () => Promise<void>;
  private getPart: GetPart;
  private options: PlayerOptions;
  private score: Score | null;
  private timeSignature: TimeSignature | null;
  private playedNotes: string[][];
  private scoreManager: ScoreManager;
  private eventEmitter: EventEmitter;
  /**
   * Creates a `Player` instance.
   *
   * @param params The accepted params
   */
  constructor({
    sampler,
    transport,
    draw,
    startAudio,
    getPart,
    options = DEFAULT_OPTIONS,
  }: PlayerParams) {
    this.options = options;
    this.sampler = sampler;
    this.transport = transport;
    this.draw = draw;
    this.startAudio = startAudio;
    this.getPart = getPart;
    this.parts = [];
    this.score = null;
    this.timeSignature = null;
    this.playedNotes = [];
    this.scoreManager = new ScoreManager();
    this.eventEmitter = new EventEmitter();
    transportEvents.forEach((eventName) =>
      this.transport.on(eventName, () =>
        this.eventEmitter.emit(eventName, { activeId: this.score?.id }),
      ),
    );
  }
  destroy() {
    transportEvents.forEach((eventName) => this.transport.off(eventName));
    this.eventEmitter.removeAllListeners();
    this.draw.cancel(0);
    this.transport.cancel(0);
  }
  getScore() {
    return this.score;
  }
  on(eventName: PlayerEvents, callback: PlayerCallback) {
    this.eventEmitter.addListener(eventName, callback);
    return () => this.eventEmitter.removeListener(eventName, callback);
  }
  setScore(score: Score | null) {
    if (!score) {
      this.score = null;
      this.clearParts();
      return this;
    }
    if (this.score?.hash === score.hash) {
      return this;
    }
    this.stop();
    this.clearParts();
    this.score = score;
    if (this.score.info.bpm) {
      this.setBpm(this.score.info.bpm);
    }
    this.timeSignature = this.score.info.timeSignature;
    this.transport.timeSignature = this.timeSignature;
    this.createParts();
    return this;
  }
  async play() {
    // #TODO fix seek before first playback bug
    await this.startAudio();
    if (!this.parts.length) {
      return;
    }
    this.parts.forEach((part) => part.start(this.transport.position));
    this.transport.start();
    return this;
  }
  setBpm(value: number) {
    if (value < BPM_RANGE[0] || value > BPM_RANGE[1]) {
      throw new Error(`Value must be in the ${BPM_RANGE} range`);
    }
    this.transport.bpm.value = value;
  }
  pause() {
    this.transport.pause();
    return this;
  }
  stop() {
    this.transport.stop();
    this.draw.cancel(0);
    this.clearPlayedNotes();
    return this;
  }
  seekTo(position: TransportPosition) {
    this.transport.position = normalizedPositionToTonePosition(
      position,
      this.timeSignature!,
    );
  }
  private updatePlayedNotes(notes: string[], voice: number) {
    this.playedNotes = this.playedNotes.map((x, index) =>
      index === voice ? notes : x,
    );
  }
  private clearPlayedNotes() {
    this.playedNotes = this.playedNotes.map(() => []);
  }
  private clearParts() {
    this.parts.forEach((part) => part.clear());
  }
  private createParts() {
    /* istanbul ignore if  */
    if (!this.score) {
      return;
    }
    const score = this.score;
    const scoreData = this.scoreManager.getScoreContent(
      score,
      this.options.timeTolerance,
    );

    this.playedNotes = scoreData.map(() => []);

    this.parts = scoreData.map(({ notes, voice }) =>
      this.getPart((time: number, chord: PlaybackInfo) => {
        const position = tonePositionToNormalizedPosition(
          this.transport.position as TransportPosition,
          this.timeSignature!,
        );
        if (chord.notes.some((note) => note.name === END_NOTE)) {
          this.draw.schedule(() => {
            this.eventEmitter.emit("finished", {
              playedNotes: this.playedNotes,
              activeId: score.id,
              position,
              voice,
            });
            this.stop();
          }, time);
          return;
        }

        this.sampler.triggerAttackRelease(
          chord.notes.map(({ name }) => name),
          chord.duration,
          time,
          chord.velocity,
        );

        this.draw.schedule(() => {
          this.updatePlayedNotes(
            chord.notes.map(({ name }) => name),
            voice,
          );
          this.eventEmitter.emit("progress", {
            playedNotes: this.playedNotes,
            activeId: score.id,
            position,
            voice,
          });
        }, time);
      }, notes),
    );
  }
}
