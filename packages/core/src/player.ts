import * as Tone from "tone";
import { type NoteJSON } from "@tonejs/midi/dist/Note";
import { EventEmitter } from "events";
import type { TransportPosition, TimeSignature, Score } from "./types";
import {
  normalizedPositionToTonePosition,
  parseTimeSignature,
  tonePositionToNormalizedPosition,
} from "./utils";
import { createSampler, END_NOTE } from "./lib";
import { ScoreManager } from "./scoreManager";

export type PlaybackNote = NoteJSON;

export type PlaybackInfo = {
  time: number;
  duration: number;
  notes: PlaybackNote[];
  velocity: number;
};

export type PlayerParams = {
  instrument: string;
  baseUrl: string;
  timeTolerance: number;
  reverbDuration: number;
};

const DEFAULT_PARAMS = {
  timeTolerance: 0.02,
  reverbDuration: 2,
  instrument: "acoustic_grand_piano",
  baseUrl:
    "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@master/FluidR3_GM",
} as PlayerParams;

export type PlayerCallback = (params: {
  playedNotes: string[];
  activeId: string;
  position: TransportPosition;
  voice: number;
}) => void;

export type PlayerEvents = "stop" | "pause" | "progress" | "finished";

const transportEvents = ["start", "stop", "pause"] as const;

const DEFAULT_TIME_SIGNATURE = [4, 4] as TimeSignature;

export class Player {
  private sampler: Tone.Sampler;
  private parts: Tone.Part[];
  private transport: ReturnType<typeof Tone.getTransport>;
  private draw: ReturnType<typeof Tone.getDraw>;
  private params: PlayerParams;
  private score: Score | null;
  private timeSignature: TimeSignature | null;
  private scoreManager: ScoreManager;
  private eventEmitter: EventEmitter;
  /**
   * Creates a `Player` instance.
   *
   * @param params The accepted params
   */
  constructor(params: Partial<PlayerParams> = {}) {
    this.params = { ...DEFAULT_PARAMS, ...params };
    this.sampler = createSampler(this.params);
    this.transport = Tone.getTransport();
    this.draw = Tone.getDraw();
    this.parts = [];
    this.score = null;
    this.timeSignature = null;
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
      this.transport.bpm.value = this.score.info.bpm;
    }
    if (this.score.info.timeSignature) {
      this.timeSignature = parseTimeSignature(this.score.info.timeSignature);
    } else {
      this.timeSignature = DEFAULT_TIME_SIGNATURE;
    }

    this.transport.timeSignature = this.timeSignature;

    this.createParts();
    return this;
  }
  async play() {
    // #TODO fix seek before first playback bug
    await Tone.start();
    if (!this.parts.length) {
      return;
    }
    this.parts.forEach((part) => part.start(this.transport.position));
    this.transport.start();
    return this;
  }
  pause() {
    this.transport.pause();
    return this;
  }
  stop() {
    this.transport.stop();
    this.draw.cancel(0);
    return this;
  }
  seekTo(position: TransportPosition) {
    this.transport.position = normalizedPositionToTonePosition(
      position,
      this.timeSignature!,
    );
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
      this.params.timeTolerance,
    );

    this.parts = scoreData.map(
      ({ notes, voice }) =>
        new Tone.Part((time: number, chord: PlaybackInfo) => {
          const position = tonePositionToNormalizedPosition(
            this.transport.position as TransportPosition,
            this.timeSignature!,
          );

          if (chord.notes.some((note) => note.name === END_NOTE)) {
            this.draw.schedule(() => {
              this.eventEmitter.emit("finished", {
                playedNotes: [],
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
            this.eventEmitter.emit("progress", {
              playedNotes: chord.notes.map(({ name }) => name),
              activeId: score.id,
              position,
              voice,
            });
          }, time);
        }, notes),
    );
  }
}
