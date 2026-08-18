import { type Score, ScoreInfo } from "./types";

const abcInfoToScoreInfoMap = {
  T: "title",
  C: "composer",
  M: "timeSignature",
  L: "unitNoteLength",
  K: "key",
  Q: "bpm",
} as const;

type AbcInfoFields = keyof typeof abcInfoToScoreInfoMap;

const abcDirectives = {
  hideTempo: "%%printtempo 0",
} as const;

const DEFAULT_ABC_INFO: Record<AbcInfoFields, unknown> = {
  T: "",
  C: "",
  K: "C",
  M: "4/4",
  L: "1/4",
  Q: 120,
};

export type ParseAbcOptions = {
  showTempo?: boolean;
};

export function parseAbc(
  input: string,
  options: ParseAbcOptions = { showTempo: true },
): Pick<Score, "info" | "content"> {
  const infoFields = Object.keys(abcInfoToScoreInfoMap);
  const [info, content] = input
    .trim()
    .split("\n")
    .reduce(
      ([info, content], line) => {
        if (infoFields.some((field) => line.startsWith(`${field}:`))) {
          const match = line.match(/^(\w):\s?(.*)/);
          return [{ ...info, [match?.at(1) as string]: match?.at(2) }, content];
        }
        return [info, [...content, line]];
      },
      [DEFAULT_ABC_INFO, [] as string[]],
    );

  const abcInfo = getAbcInfo(info, options);

  return {
    info: Object.entries(info).reduce(
      (memo, [key, value]) => ({
        ...memo,
        [abcInfoToScoreInfoMap[key as AbcInfoFields]]: value,
      }),
      {} as ScoreInfo,
    ),
    content: [abcInfo, content.join("\n")].join("\n"),
  };
}

export function getAbcInfo(
  info: Partial<Record<AbcInfoFields, unknown>>,
  { showTempo }: ParseAbcOptions = {},
) {
  const output = Object.entries(info).reduce((memo, [key, value]) => {
    if (!showTempo && key === "Q") {
      return [...memo, abcDirectives.hideTempo, `${key}:${value}`];
    }
    return [...memo, `${key}:${value}`];
  }, [] as string[]);
  return output.join("\n");
}
