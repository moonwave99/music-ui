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

export type ElementOrSelector<T extends HTMLElement> =
  NodeListOf<T> | T | string;

export function ensureSelection<T extends HTMLElement>(
  elementOrSelector: ElementOrSelector<T>,
): T[] {
  if (typeof elementOrSelector === "string") {
    return Array.from(document.querySelectorAll<T>(elementOrSelector));
  }
  if ((elementOrSelector as NodeListOf<T>).length) {
    return Array.from(elementOrSelector as NodeListOf<T>);
  }
  return [elementOrSelector as T];
}

export function extractElementOptions<
  T extends Record<string, string | number | boolean>,
>(el: HTMLElement, baseOptions: T): T {
  const options = {} as Record<string, string | number | boolean>;
  Object.entries(baseOptions).forEach(([key, sample]) => {
    const value = el.dataset[key];
    switch (typeof sample) {
      case "string":
        if (value) {
          options[key] = value;
        }
        break;
      case "number":
        if (value) {
          options[key] = +value;
        }
        break;
      case "boolean":
        if (typeof value !== "undefined") {
          options[key] = value !== "false";
        }
    }
  });
  return options as T;
}

export function joinVoices(voices: string[][]) {
  return voices
    .map((notes) => notes.join(" "))
    .toReversed()
    .join(",");
}
