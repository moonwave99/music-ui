import md5 from "md5";
import { scientificToAbcNotation } from "@tonaljs/abc-notation";

export type Score = {
  id: string;
  hash: string;
  content: string;
  bpm: number;
};

export type NoteInput = string | string[];

export type PlaybackMode = "block" | "arpeggio";

export type GetScoreParams = {
  content: string;
};

type GetAbcScoreParams = Pick<Score, "id" | "content"> & { bpm?: number };

export function getAbcScore({ bpm = 120, ...rest }: GetAbcScoreParams) {
  return withTempo(withHash({ bpm, ...rest }));
}

export function withHash(score: Omit<Score, "hash">): Score {
  return {
    ...score,
    hash: getScoreHash(score.content),
  };
}

export function withTempo(score: Score): Score {
  return {
    ...score,
    content: `
Q:${score.bpm}
${score.content}`,
  };
}

export function toAbcNotation(input: NoteInput) {
  return (Array.isArray(input) ? input : input.split(" "))
    .map(scientificToAbcNotation)
    .join(" ");
}

export function withPlaybackMode(input: NoteInput, playbackMode: PlaybackMode) {
  const output = toAbcNotation(input);
  return playbackMode === "block" ? `[${output}]6` : output;
}

export function getScoreHash(score: string) {
  return md5(score);
}

type GetPianoScoreParams = {
  id: string;
  bpm?: number;
  input: NoteInput;
  playbackMode?: PlaybackMode;
};

export function getPianoScore({
  id,
  bpm = 120,
  input,
  playbackMode = "block",
}: GetPianoScoreParams) {
  return withTempo(
    withHash({
      id,
      bpm,
      content: withPlaybackMode(input, playbackMode),
    }),
  );
}
