import * as Tone from "tone";
import { Midi, type MidiJSON } from "@tonejs/midi";
import { synth } from "abcjs";
import { type Score } from "./utils";
import { EventEmitter } from "events";

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
};

const DEFAULT_PARAMS = {
  timeTolerance: 0.02,
  instrument: "acoustic_grand_piano",
  baseUrl:
    "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@master/FluidR3_GM",
} as const;

export type PlayerCallback = (params: {
  playedNotes: string[];
  activeId: string;
}) => void;

export type PlayerEvents = "playing" | "finished" | "pause" | "stop";

export class Player {
  private sampler: Tone.Sampler;
  private part: Tone.Part | null;
  private transport: ReturnType<typeof Tone.getTransport>;
  private draw: ReturnType<typeof Tone.getDraw>;
  private params: PlayerParams;
  private score: Score | null;
  private eventEmitter: EventEmitter;
  private playbackProgress: number;
  constructor(params?: PlayerParams) {
    this.params = Object.assign(DEFAULT_PARAMS, params);
    this.sampler = createSampler(this.params);
    this.transport = Tone.getTransport();
    this.draw = Tone.getDraw();
    this.part = null;
    this.score = null;
    this.playbackProgress = 0;
    this.eventEmitter = new EventEmitter();
    (["start", "stop", "pause"] as const).forEach((eventName) =>
      this.transport.on(eventName, () =>
        this.eventEmitter.emit(eventName, { activeId: this.score?.id }),
      ),
    );
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
    // #TODO: abstract this to a cache layer
    const rawMidi = synth
      .getMidiFile(score.content, { midiOutputType: "binary" })
      .at(0);
    const midi = new Midi(rawMidi);
    const parsedData = parseMidiData(midi.toJSON(), this.params.timeTolerance);
    this.score = score;

    this.part = new Tone.Part((time: number, chord: PlaybackInfo) => {
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
          }),
        time,
      );
      if (++this.playbackProgress == parsedData.length) {
        this.draw.schedule(() => {
          this.eventEmitter.emit("finished", {
            playedNotes: [],
            activeId: score.id,
          });
          this.playbackProgress = 0;
          this.stop();
        }, time + 0.5);
      }
    }, parsedData);
    return this;
  }
  async play() {
    await Tone.start();
    if (!this.part) {
      return;
    }
    this.part.start(0);
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
}

type CreateSamplerParams = Pick<PlayerParams, "instrument" | "baseUrl">;

function createSampler({ instrument, baseUrl }: CreateSamplerParams) {
  const sampler = new Tone.Sampler({
    urls: Array.from({ length: 6 }, (_, i) => `C${i + 2}`).reduce(
      (memo, key) => ({ ...memo, [key]: `${key}.mp3` }),
      {},
    ),
    baseUrl: `${baseUrl}/${instrument}-mp3/`,
  }).toDestination();
  const reverb = new Tone.Reverb(1).toDestination();
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
    if (existing) existing.notes.push(note.name);
    else
      chords.push({
        time: note.time,
        duration: note.duration,
        notes: [note.name],
        velocity: note.velocity,
      });
  }
  return chords;
}
