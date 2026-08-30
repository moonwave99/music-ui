import * as Tone from "tone";
import { type PlaybackEvent } from "./player";
import { type MidiJSON } from "@tonejs/midi";

export type CreateSamplerParams = {
  instrument: string;
  baseUrl: string;
  reverbDuration: number;
};

export const DEFAULT_SAMPLER_OPTIONS = {
  reverbDuration: 2,
  instrument: "acoustic_grand_piano",
  baseUrl:
    "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@master/FluidR3_GM",
} as const;

/* istanbul ignore next */
export function createSampler(params: Partial<CreateSamplerParams> = {}) {
  const { instrument, baseUrl, reverbDuration } = {
    ...DEFAULT_SAMPLER_OPTIONS,
    ...params,
  };
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
  notes: PlaybackEvent[];
  voice: number;
};

export function parseMidiData(
  data: MidiJSON,
  timeTolerance: number,
): ParsedVoice[] {
  const voices = data.tracks
    .filter((x) => x.notes.length)
    .map(({ notes }, index) => {
      const groupedNotes: PlaybackEvent[] = [];
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

function getEndNote({ time, duration }: PlaybackEvent) {
  return {
    time: time + duration,
    duration: 0,
    notes: [{ name: END_NOTE }],
    velocity: 0,
  } as PlaybackEvent;
}
