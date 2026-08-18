import { PlayerPosition } from "@music-ui/core";

export type TimeSignature = [number, number];

export function getCurrentNote(
  barNotes: NodeListOf<SVGGElement>,
  position: PlayerPosition,
  meter: [number, number],
) {
  const elementsWithDurations = [];

  let relativePosition = 0;

  for (const element of barNotes) {
    const duration = getNoteDuration(element);
    elementsWithDurations.push({
      position: relativePosition,
      element,
      duration,
    });
    relativePosition += duration;
  }

  const relativeNotePosition = getRelativePosition(position, meter);

  for (const { element, position, duration } of elementsWithDurations) {
    if (position + duration > relativeNotePosition) {
      return element;
    }
  }

  return null;
}

export function getNotePosition(
  element: SVGGElement,
  timeSignature: TimeSignature,
): PlayerPosition {
  const bar = getValueFromNote(element, "abcjs-mm");
  const voice = getValueFromNote(element, "abcjs-v");

  const barNotes = element.parentElement!.querySelectorAll<SVGGElement>(
    `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}.abcjs-v${voice}`,
  );

  const indexInBar = Array.from(barNotes).indexOf(element);
  const lengthSoFar = Array.from(barNotes)
    .slice(0, indexInBar)
    .reduce((memo, element) => memo + getNoteDuration(element), 0);

  const barLength = getBarLength(timeSignature);
  const beatWithRest = (lengthSoFar / barLength) * timeSignature[0];
  const rest = beatWithRest % 1;
  const beat = beatWithRest - rest;
  const subDivisions = rest * subDivisionsMap[timeSignature[1]]!;

  return `${bar}:${beat}:${subDivisions}`;
}

export function getValueFromNote(element: SVGGElement, classPrefix: string) {
  return Number(
    element.classList
      .toString()
      .split(" ")
      .find((x) => x.startsWith(classPrefix))
      ?.replace(classPrefix, ""),
  );
}

export function getNoteDuration(element: SVGGElement) {
  const durationValue = element
    .getAttribute("class")
    ?.split(" ")
    .map((x) => x.match(/abcjs-d(.*)/))
    .filter(Boolean)
    .at(0)
    ?.at(1);

  const duration = Number(
    durationValue?.includes("-")
      ? durationValue.replace("-", ".")
      : durationValue,
  );
  // fixes the 32th note duration
  if (duration === 0.031) {
    return 1 / 32;
  }
  // fixes the 16th note duration
  if (duration === 0.063) {
    return 1 / 16;
  }
  return duration;
}

const durationMap = {
  8: 0.125,
  4: 0.25,
  2: 0.5,
  1: 1,
} as Record<number, number>;

const subDivisionsMap = {
  8: 2,
  4: 4,
  2: 8,
  1: 16,
} as Record<number, number>;

function getBarLength([num, den]: TimeSignature) {
  return durationMap[den]! * num;
}

export function getRelativePosition(
  position: PlayerPosition,
  [, den]: TimeSignature,
) {
  const [, beat, subdivisions] = position.split(":").map(Number) as [
    number,
    number,
    number,
  ];

  const beatDuration = durationMap[den]!;
  const subDivisionDuration = beatDuration / subDivisionsMap[den]!;

  return beatDuration * beat + subdivisions * subDivisionDuration;
}
