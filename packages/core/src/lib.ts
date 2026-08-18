import * as Tone from "tone";
import { type PlaybackInfo, PlayerParams } from "./player";
import { type MidiJSON } from "@tonejs/midi";

type CreateSamplerParams = Pick<
  PlayerParams,
  "instrument" | "baseUrl" | "reverbDuration"
>;

/* istanbul ignore next */
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

export const END_NOTE = "__END_NOTE__";

export type ParsedVoice = {
  notes: PlaybackInfo[];
  voice: number;
};

export function parseMidiData(
  data: MidiJSON,
  timeTolerance: number,
): ParsedVoice[] {
  const voices = data.tracks
    .filter((x) => x.notes.length)
    .map(({ notes }, index) => {
      const groupedNotes: PlaybackInfo[] = [];
      for (const note of notes) {
        const existing = groupedNotes.find(
          (c) => Math.abs(c.time - note.time) < timeTolerance,
        );
        if (existing) {
          existing.notes.push(note);
        } else
          groupedNotes.push({
            time: note.time,
            duration: note.duration,
            notes: [note],
            velocity: note.velocity,
          });
      }
      return {
        notes: groupedNotes,
        voice: index,
      };
    });

  const longestVoiceIndex = voices
    .toSorted((a, b) => Math.sign(b.notes.at(-1)!.time - a.notes.at(-1)!.time))
    .at(0)?.voice;

  return voices.map((v, index) =>
    index !== longestVoiceIndex
      ? v
      : { ...v, notes: [...v.notes, getEndNote(v.notes.at(-1)!)] },
  );
}

function getEndNote({ time, duration }: PlaybackInfo) {
  return {
    time: time + duration,
    duration: 0,
    notes: [{ name: END_NOTE }],
    velocity: 0,
  } as PlaybackInfo;
}
