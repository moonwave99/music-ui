import * as Tone from "tone";
import { EventEmitter } from "events";
import { type Score } from "./utils";
import { createSampler } from "./lib";
import { ScoreManager } from "./scoreManager";

export type PlayerPosition = Tone.Unit.BarsBeatsSixteenths;

export type PlaybackInfo = {
  time: number;
  duration: number;
  notes: string[];
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
  position: PlayerPosition;
}) => void;

export type PlayerEvents = "stop" | "pause" | "progress" | "finished";

const transportEvents = ["start", "stop", "pause"] as const;

export class Player {
  private sampler: Tone.Sampler;
  private part: Tone.Part | null;
  private transport: ReturnType<typeof Tone.getTransport>;
  private draw: ReturnType<typeof Tone.getDraw>;
  private params: PlayerParams;
  private score: Score | null;
  private playbackProgress: number;
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
    this.part = null;
    this.score = null;
    this.playbackProgress = 0;
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
      this.part?.clear();
      return this;
    }
    if (this.score?.hash === score.hash) {
      return this;
    }
    this.stop();
    this.part?.clear();
    this.score = score;
    if (this.score.info.bpm) {
      this.transport.bpm.value = this.score.info.bpm;
    }
    this.createPart();
    return this;
  }
  async play() {
    // #TODO fix seek before first playback bug
    // hint: playbackProgress should be a PlayerPosition and not just an integer
    await Tone.start();
    if (!this.part) {
      return;
    }
    this.part.start(this.transport.position);
    this.transport.start();
    return this;
  }
  pause() {
    this.transport.pause();
    return this;
  }
  stop() {
    this.playbackProgress = 0;
    this.transport.stop();
    this.draw.cancel(0);
    return this;
  }
  seekTo(position: PlayerPosition) {
    this.transport.position = position;
  }

  private createPart() {
    if (!this.score) {
      return;
    }
    const score = this.score;
    const scoreData = this.scoreManager.getScoreContent(
      score,
      this.params.timeTolerance,
    );

    this.part = new Tone.Part((time: number, chord: PlaybackInfo) => {
      const position = this.transport.position;
      this.sampler.triggerAttackRelease(
        chord.notes,
        chord.duration,
        time,
        chord.velocity,
      );
      this.draw.schedule(
        () =>
          this.eventEmitter.emit("progress", {
            playedNotes: chord.notes,
            activeId: score.id,
            position,
          }),
        time,
      );
      if (++this.playbackProgress == scoreData.length) {
        this.draw.schedule(() => {
          this.eventEmitter.emit("finished", {
            playedNotes: [],
            activeId: score.id,
            position,
          });
          this.playbackProgress = 0;
          this.stop();
        }, time + 0.5);
      }
    }, scoreData);
  }
}
