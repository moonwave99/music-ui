import md5 from "md5";
import { scientificToAbcNotation } from "@tonaljs/abc-notation";
import { parseAbc, getAbcInfo, type ParseAbcOptions } from "./abcParser";

export type Score = {
  id: string;
  content: string;
  hash: string;
  info: ScoreInfo;
};

export type ScoreInfo = {
  title?: string;
  composer?: string;
  meter?: string;
  unitNoteLength?: string;
  key?: string;
  bpm?: number;
};

export type NoteInput = string | string[];

type GetAbcScoreParams = Pick<Score, "id"> & {
  input: string;
  options?: ParseAbcOptions;
};

export function getAbcScore({ id, input, options }: GetAbcScoreParams): Score {
  const { info, content } = parseAbc(input, options);
  return {
    id,
    info,
    content,
    hash: getScoreHash(id, content),
  };
}

export type PlaybackMode = "block" | "arpeggio";

type GetPianoScoreParams = {
  id: string;
  bpm?: number;
  input: NoteInput;
  playbackMode?: PlaybackMode;
};

export function getPianoScore({
  id,
  input,
  playbackMode = "block",
  bpm = 120,
}: GetPianoScoreParams) {
  const content = [
    getAbcInfo({ Q: bpm }),
    withPlaybackMode(input, playbackMode),
  ].join("\n");

  return {
    id,
    content,
    info: { bpm },
    hash: getScoreHash(id, content),
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

export function getScoreHash(id: string, score: string) {
  return md5(`${id}${score}`);
}

export function querySelectorAll<T extends HTMLElement>(
  elementsOrSelector: NodeListOf<T> | string,
): NodeListOf<T> {
  return typeof elementsOrSelector === "string"
    ? document.querySelectorAll<T>(elementsOrSelector)
    : elementsOrSelector;
}

export function querySelector<T extends HTMLElement>(
  elementOrSelector: T | string,
): T | null {
  return typeof elementOrSelector === "string"
    ? document.querySelector<T>(elementOrSelector)
    : elementOrSelector;
}
