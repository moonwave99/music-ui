import * as Tone from "tone";
import { Midi, type MidiJSON } from "@tonejs/midi";
import { synth } from "abcjs";
import { type Score } from "./utils";
import { EventEmitter } from "events";

export type PlayerPosition = Tone.Unit.BarsBeatsSixteenths;

type PlaybackInfo = {
  time: number;
  duration: number;
  notes: string[];
  velocity: number;
};

type PlayerParams = {
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
} as const;

export type PlayerCallback = (params: {
  playedNotes: string[];
  activeId: string;
  position: PlayerPosition;
}) => void;

export type PlayerEvents = "playing" | "finished" | "pause" | "stop";

const playerEvents = ["start", "stop", "pause"] as const;

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
  constructor(params?: PlayerParams) {
    this.params = Object.assign(DEFAULT_PARAMS, params);
    this.sampler = createSampler(this.params);
    this.transport = Tone.getTransport();
    this.draw = Tone.getDraw();
    this.part = null;
    this.score = null;
    this.playbackProgress = 0;
    this.scoreManager = new ScoreManager();
    this.eventEmitter = new EventEmitter();
    playerEvents.forEach((eventName) =>
      this.transport.on(eventName, () =>
        this.eventEmitter.emit(eventName, { activeId: this.score?.id }),
      ),
    );
  }
  destroy() {
    this.scoreManager.clearCache();
    playerEvents.forEach((eventName) => this.transport.off(eventName));
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
    if (score.info.bpm) {
      this.transport.bpm.value = score.info.bpm;
    }

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
          this.eventEmitter.emit("playing", {
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
    return this;
  }
  async play() {
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
}

type CreateSamplerParams = Pick<
  PlayerParams,
  "instrument" | "baseUrl" | "reverbDuration"
>;

function createSampler({
  instrument,
  baseUrl,
  reverbDuration,
}: CreateSamplerParams) {
  const sampler = new Tone.Sampler({
    urls: Array.from({ length: 6 }, (_, i) => `C${i + 2}`).reduce(
      (memo, key) => ({ ...memo, [key]: `${key}.mp3` }),
      {},
    ),
    baseUrl: `${baseUrl}/${instrument}-mp3/`,
  }).toDestination();
  const reverb = new Tone.Reverb(reverbDuration).toDestination();
  sampler.connect(reverb);
  return sampler;
}

function parseMidiData(data: MidiJSON, timeTolerance: number) {
  const { notes } = data.tracks.at(0)!;
  const chords: PlaybackInfo[] = [];

  for (const note of notes) {
    const existing = chords.find(
      (c) =>
        Math.abs(c.time - note.time) < timeTolerance &&
        Math.abs(c.duration - note.duration) < timeTolerance,
    );
    if (existing) {
      existing.notes.push(note.name);
    } else
      chords.push({
        time: note.time,
        duration: note.duration,
        notes: [note.name],
        velocity: note.velocity,
      });
  }
  return chords;
}

class ScoreManager {
  private cache: Record<string, PlaybackInfo[]>;
  constructor() {
    this.cache = {};
  }
  getScoreContent(score: Score, timeTolerance: number): PlaybackInfo[] {
    if (this.cache[score.hash]) {
      return this.cache[score.hash] as PlaybackInfo[];
    }
    const rawMidi = synth
      .getMidiFile(score.content, { midiOutputType: "binary" })
      .at(0);
    const midi = new Midi(rawMidi);
    const scoreData = parseMidiData(midi.toJSON(), timeTolerance);
    this.cache[score.hash] = scoreData;
    return scoreData;
  }
  clearCache() {
    this.cache = {};
  }
}
