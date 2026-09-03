import { FretboardPosition } from "../fretboard/Fretboard";

type ActionBounds = {
  box: FretboardPosition[];
  from: FretboardPosition;
  to: FretboardPosition;
};

type TransformParams = ActionBounds & {
  action: (x: FretboardPosition) => FretboardPosition;
};

const FIRST_FRET = { string: 6, fret: 0 } as const;
const INFINITY_FRET = { string: 1, fret: 100 } as const;

function transform({
  box = [],
  from = FIRST_FRET,
  to = INFINITY_FRET,
  action = (x: FretboardPosition): FretboardPosition => x,
}: TransformParams): FretboardPosition[] {
  const inSelection = ({ string, fret }: FretboardPosition) => {
    if (string > from.string || string < to.string) {
      return false;
    }
    if (string === from.string && fret < from.fret) {
      return false;
    }
    if (string === to.string && fret > to.fret) {
      return false;
    }
    return true;
  };
  return box.map((x) => (inSelection(x) ? action(x) : x));
}

type DisableStringsParams = {
  box: FretboardPosition[];
  strings: number[];
};

export function disableStrings({
  box = [],
  strings = [],
}: DisableStringsParams): FretboardPosition[] {
  return box.map(({ string, ...dot }) => ({
    string,
    disabled: strings.includes(string),
    ...dot,
  }));
}

export function sliceBox({
  box = [],
  from = FIRST_FRET,
  to = INFINITY_FRET,
}: Partial<ActionBounds>): FretboardPosition[] {
  const sortedBox = box.toSorted((a, b) => {
    if (a.string > b.string) {
      return -1;
    }
    if (a.fret > b.fret) {
      return 1;
    }
    return -1;
  });

  const findIndex = (key: FretboardPosition) =>
    sortedBox.findIndex(
      ({ string, fret }) => string === key.string && fret === key.fret,
    );

  let fromIndex = findIndex(from);
  if (fromIndex === -1) {
    fromIndex = 0;
  }
  let toIndex = findIndex(to);
  if (toIndex === -1) {
    toIndex = sortedBox.length;
  }
  return sortedBox.slice(fromIndex, toIndex);
}

export function disableDots({
  box = [],
  from = FIRST_FRET,
  to = INFINITY_FRET,
}: Partial<ActionBounds>): FretboardPosition[] {
  return transform({
    box,
    from,
    to,
    action: (dot: FretboardPosition) => ({ disabled: true, ...dot }),
  });
}
