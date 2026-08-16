import * as Tone from "tone";
import { type PlaybackInfo, PlayerParams } from "./player";
import { type MidiJSON } from "@tonejs/midi";

type CreateSamplerParams = Pick<
  PlayerParams,
  "instrument" | "baseUrl" | "reverbDuration"
>;

export function createSampler({
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

export function parseMidiData(data: MidiJSON, timeTolerance: number) {
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
