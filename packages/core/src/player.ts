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

/**
 * A playback event.
 * @property time The event scheduled time.
 * @property duration The event duration.
 * @property notes The notes to be played.
 * @property velocity The playback velocity
 */
export type PlaybackEvent = {
  time: number;
  duration: number;
  notes: NoteJSON[];
  velocity: number;
};

/**
 * The Player options.
 * @property timeTolerance The tolerance for grouping chord notes together.
 */
export type PlayerOptions = {
  timeTolerance: number;
};

const DEFAULT_OPTIONS = {
  timeTolerance: 0.02,
} as const;

const transportEvents = ["start", "stop", "pause"] as const;

export const DEFAULT_TIME_SIGNATURE = [4, 4] as TimeSignature;

export const BPM_RANGE = [20, 200] as const;

/**
 * The events triggered by the player.
 */
export type PlayerEvents = "stop" | "pause" | "progress" | "finished";

/**
 * The player event listener callback.
 * @property playedNotes The current played notes.
 * @property activeId The current score id.
 * @property position The current transport position.
 * @property voice The current played voice.
 */
export type PlayerCallback = (params: {
  playedNotes: string[][];
  activeId: string;
  position: TransportPosition;
  voice: number;
}) => void;

/**
 * Transport for timing musical events.
 * @property on Adds an event listener.
 * @property off Removes an event listener.
 * @property cancel Cancels future events.
 * @property bpm The current bpm.
 * @property timeSignature The current time signature.
 * @property position The current position.
 * @property start Starts playback.
 * @property stop Stops playback.
 * @property pause Pauses playback.
 */
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

/**
 * Useful for synchronizing visuals and audio events.
 * @property cancel Cancels future events.
 * @property schedule Schedules the passed callback at the passed time.
 */
export type Draw = {
  cancel: (time: Unit.Time) => void;
  schedule: (callback: () => void, time: Unit.Time) => void;
};

/**
 * Automatically interpolates between a set of pitched samples.
 * @property triggerAttackRelease Plays the passed notes.
 */
export type Sampler = {
  triggerAttackRelease: (
    notes: string[] | string,
    duration: Unit.Time | Unit.Time[],
    time?: Unit.Time,
    velocity?: number,
  ) => void;
};

/**
 * A collection of Tone.Events which can be started/stopped and looped as a single unit.
 * @property start Starts the part.
 * @property clear Clears the part.
 */
export type Part = {
  start: (time: Unit.Time) => void;
  clear: (time?: Unit.Time) => void;
};

/**
 * A function that returns a Part from the given progress callback and playback info.
 */
type GetPart = (
  callback: (time: number, event: PlaybackEvent) => void,
  events: PlaybackEvent[],
) => Part;

/**
 * The parameters accepted by the Player constructor.
 * @property sampler The Sampler instance
 * @property transport The Transport instance
 * @property draw The Draw instance
 * @property startAudio The audio initializer function
 * @property getPart The function used to create the parts
 * @property options The Player options
 */
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
   * @param __namedParameters The accepted params
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
  /**
   * Clears all event listeners and future playback scheduled events.
   */
  destroy() {
    transportEvents.forEach((eventName) => this.transport.off(eventName));
    this.eventEmitter.removeAllListeners();
    this.draw.cancel(0);
    this.transport.cancel(0);
  }
  /**
   * Returns the current score.
   * @returns The current score.
   */
  getScore() {
    return this.score;
  }
  on(eventName: PlayerEvents, callback: PlayerCallback) {
    this.eventEmitter.addListener(eventName, callback);
    return () => this.eventEmitter.removeListener(eventName, callback);
  }
  /**
   * Sets the current score.
   * @param score The score to be set.
   * @returns The current Player instance.
   */
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
    this.setBpm(this.score.info.bpm);
    this.timeSignature = this.score.info.timeSignature;
    this.transport.timeSignature = this.timeSignature;
    this.createParts();
    return this;
  }
  /**
   * Sets the current transport bpm value.
   * @throws `Value must be in the ${BPM_RANGE} range, received ${value} instead` if the passed value is not the BPM range.
   * @param value The new bpm value.
   */
  setBpm(value: number) {
    if (value < BPM_RANGE[0] || value > BPM_RANGE[1]) {
      throw new Error(
        `Value must be in the ${BPM_RANGE} range, received ${value} instead`,
      );
    }
    this.transport.bpm.value = value;
  }
  /**
   * Returns the current transport bpm value.
   * @returns The bpm value.
   */
  getBpm() {
    return this.transport.bpm.value;
  }
  /**
   * Starts playback.
   * @returns The current Player instance.
   */
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
  /**
   * Pauses playback.
   * @returns The current Player instance.
   */
  pause() {
    this.transport.pause();
    return this;
  }
  /**
   * Stops playback.
   * @returns The current Player instance.
   */
  stop() {
    this.transport.stop();
    this.draw.cancel(0);
    this.clearPlayedNotes();
    return this;
  }
  /**
   * Seeks playback to the passed position.
   * @param position The new position.
   * @returns The current Player instance.
   */
  seekTo(position: TransportPosition) {
    this.transport.position = normalizedPositionToTonePosition(
      position,
      this.timeSignature!,
    );
    return this;
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
      this.getPart((time: number, event: PlaybackEvent) => {
        const position = tonePositionToNormalizedPosition(
          this.transport.position as TransportPosition,
          this.timeSignature!,
        );
        if (event.notes.some((note) => note.name === END_NOTE)) {
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
          event.notes.map(({ name }) => name),
          event.duration,
          time,
          event.velocity,
        );

        this.draw.schedule(() => {
          this.updatePlayedNotes(
            event.notes.map(({ name }) => name),
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
