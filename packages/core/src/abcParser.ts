import { load } from "js-yaml";
import { type Score, ScoreInfo } from "./utils";

const scoreInfoToAbcInfoMap = {
  title: "T",
  composer: "C",
  meter: "M",
  unitNoteLength: "L",
  key: "K",
  bpm: "Q",
} as const;

const abcInfoToScoreInfoMap = {
  T: "title",
  C: "composer",
  M: "meter",
  L: "unitNoteLength",
  K: "key",
  Q: "bpm",
} as const;

type AbcInfoFields = keyof typeof abcInfoToScoreInfoMap;

const abcDirectives = {
  hideTempo: "%%printtempo 0",
} as const;

const DEFAULT_INFO: Partial<ScoreInfo> = {
  bpm: 120,
};

function extendWithDefaultInfo(info: ScoreInfo): ScoreInfo {
  return { ...DEFAULT_INFO, ...info };
}

export type ParseAbcOptions = {
  hideTempo?: boolean;
};

export function parseAbc(
  input: string,
  options: ParseAbcOptions = { hideTempo: false },
): Pick<Score, "info" | "content"> {
  const { frontMatter, content } = parseDocument(input.trim());
  if (!frontMatter) {
    return {
      info: extendWithDefaultInfo(parseAbcInfo(input)),
      // #TODO: insert defaults in abc info when not present, e.g. Q:{bpm}
      content: input.trim(),
    };
  }
  const info = frontMatterToAbcInfo(frontMatter as ScoreInfo, options);
  return {
    info: extendWithDefaultInfo(frontMatter),
    content: [info, content].join("\n"),
  };
}

function parseAbcInfo(input: string): ScoreInfo {
  const matches = input
    .trim()
    .split("\n")
    .map((line) => {
      const match = line.match(/^([A-Z]{1}):(.*)/);
      if (match) {
        return [match.at(1), match.at(2)];
      }
      return null;
    })
    .filter(Boolean) as [AbcInfoFields, string][];

  const output = {} as Record<string, unknown>;
  matches.forEach(([key, value]) => {
    const scoreInfoKey = abcInfoToScoreInfoMap[key] as keyof ScoreInfo;
    output[scoreInfoKey] = scoreInfoKey === "bpm" ? Number(value) : value;
  });
  return output;
}

export function frontMatterToAbcInfo(
  input: ScoreInfo,
  options: ParseAbcOptions = { hideTempo: false },
) {
  return Object.entries(input)
    .reduce((memo, [key, value]) => {
      const abcField = scoreInfoToAbcInfoMap[key as keyof ScoreInfo];
      if (!abcField) {
        console.warn(
          `@music-ui/abc/parser: ${key} is not a recognized abc information field`,
        );
      }
      if (key === "bpm" && options.hideTempo) {
        return [...memo, abcDirectives.hideTempo, `${abcField}:${value}`];
      }
      return [...memo, `${abcField}:${value}`];
    }, [] as string[])
    .join("\n");
}

const frontMatterPattern =
  /(^\+{3}(?:\r\n|\r|\n)([\w\W]*?)\+{3}(?:\r\n|\r|\n))?([\w\W]*)*/;

type ParseDocument = {
  frontMatter: Record<string, unknown> | null;
  content: string;
};

function parseDocument(input: string): ParseDocument {
  const matches = input.match(frontMatterPattern);
  if (!matches) {
    return {
      frontMatter: null,
      content: input,
    };
  }

  const output = {
    frontMatter: null,
    content: "",
  } as ParseDocument;

  if (matches[2]) {
    output.frontMatter = load(matches[2]) as ParseDocument["frontMatter"];
  }

  if (matches[3]) {
    output.content = matches[3].trim();
  }

  return output;
}
