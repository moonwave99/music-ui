import md5 from "md5";
import { scientificToAbcNotation } from "@tonaljs/abc-notation";

export type Score = {
  id: string;
  hash: string;
  content: string;
};

export type NoteInput = string | string[];

export type PlaybackMode = "block" | "arpeggio";

export type GetScoreParams = {
  content: string;
};

export function getAbcScore(id: string, content: string) {
  return withHash({ id, content });
}

export function withHash(score: Omit<Score, "hash">): Score {
  return {
    ...score,
    hash: getScoreHash(score.content),
  };
}

export function toAbcNotation(input: NoteInput) {
  return (Array.isArray(input) ? input : input.split(" "))
    .map(scientificToAbcNotation)
    .join(" ");
}

export function withPlaybackMode(input: NoteInput, playbackMode: PlaybackMode) {
  const output = toAbcNotation(input);
  return playbackMode === "block" ? `[${output}]` : output;
}

export function getScoreHash(score: string) {
  return md5(score);
}

type GetPianoScoreParams = {
  id: string;
  input: NoteInput;
  playbackMode?: PlaybackMode;
};

export function getPianoScore({
  id,
  input,
  playbackMode = "block",
}: GetPianoScoreParams) {
  return withHash({
    id,
    content: withPlaybackMode(input, playbackMode),
  });
}
