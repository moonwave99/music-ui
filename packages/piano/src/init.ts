import Piano, { Options, DEFAULT_PIANO_OPTIONS } from "./Piano";

function parseOptions(el: HTMLElement): Options {
  const options = {} as Record<string, string | number | boolean>;

  Object.entries(DEFAULT_PIANO_OPTIONS).forEach(([key, sample]) => {
    const value = el.dataset[key];
    switch (typeof sample) {
      case "number":
        if (value) {
          options[key] = +value;
        }
        break;
      case "boolean":
        if (value) {
          options[key] = value !== "false";
        }
        break;
    }
  });

  return options as Options;
}

const DEFAULT_INIT_OPTIONS = {
  elements: "[data-piano]",
};

type InitOptions = {
  elements: string | NodeList;
};

function parseNotes(notes: string) {
  return notes.trim().split(" ");
}

function parseHands(notes: string) {
  const [left, right] = notes.split(",");
  if (!left || !right) {
    throw new Error('Hands input should be like "A B, C D"');
  }
  const leftTokens = parseNotes(left);
  const rightTokens = parseNotes(right);
  return {
    notes: [...leftTokens, ...rightTokens],
    left: leftTokens,
    right: rightTokens,
  };
}

function parseSatb(notes: string) {
  const tokens = notes.split(",").map(parseNotes);
  if (tokens.length !== 4) {
    throw new Error('SATB input should be like "A, B, C, D"');
  }
  return {
    notes: tokens.flat(),
    soprano: tokens[3],
    alto: tokens[2],
    tenor: tokens[1],
    bass: tokens[0],
  };
}

export const parsers = {
  notes: parseNotes,
  notesHands: parseHands,
  notesSatb: parseSatb,
};

export default function init(
  options: InitOptions = DEFAULT_INIT_OPTIONS,
): void {
  options = Object.assign({}, DEFAULT_INIT_OPTIONS, options);
  const elements =
    typeof options.elements === "string"
      ? document.querySelectorAll(options.elements)
      : options.elements;

  elements.forEach((el: HTMLElement) => {
    const options = parseOptions(el);
    const piano = new Piano({ el, ...options });
    piano.render();

    Object.entries(parsers).forEach(([key, handler]) => {
      if (el.dataset[key]) {
        piano.setNotes(handler(el.dataset[key]));
      }
    });

    const otherNotes = Object.keys(el.dataset)
      .filter(
        (x) =>
          x.startsWith("notes") &&
          !Object.keys(parsers).includes(x.replace("notes-", "")),
      )
      .reduce(
        (memo, key) => ({
          ...memo,
          ...{
            [key.replace("notes", "").toLowerCase()]: parseNotes(
              el.dataset[key],
            ),
          },
        }),
        {},
      );

    if (!Object.keys(otherNotes).length) {
      return;
    }
    piano.setNotes(otherNotes);
  });
}
