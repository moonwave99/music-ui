import { type TransportPosition, TimeSignature } from "@music-ui/core";

/**
 * Returns the note at the given position (to update the score cursor on playback progress)
 * @param barNotes The notes contained in the bar
 * @param position The position to look for
 * @param timeSignature The score time signature
 * @returns
 */
export function getCurrentNote(
  barNotes: NodeListOf<SVGGElement>,
  position: TransportPosition,
  timeSignature: TimeSignature,
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

  const relativeNotePosition = getRelativePosition(position, timeSignature);

  for (const { element, position, duration } of elementsWithDurations) {
    if (position + duration > relativeNotePosition) {
      return element;
    }
  }

  return null;
}

/**
 * Returns the transport position of the passed note (e.g. 1:2:1).
 * @param element The note element
 * @param timeSignature The score time signature
 * @returns the note position
 */
export function getNotePosition(
  element: SVGGElement,
  timeSignature: TimeSignature,
): TransportPosition {
  const bar = getValueFromNote(element, "abcjs-mm");
  const voice = getValueFromNote(element, "abcjs-v");

  if (`${timeSignature}` == "1,1") {
    const barNotes = element.parentElement!.querySelectorAll<SVGGElement>(
      `:is(.abcjs-note, .abcjs-rest).abcjs-v${voice}`,
    );
    const index = [...barNotes].indexOf(element);
    return `${index}:0:0`;
  }

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

/**
 * Extracts a value from an abc.js element for the passed class prefix.
 * @remark Abc.js stores note metadata inside css classes (and not inside data attributes)
 * @see {@link https://docs.abcjs.net/visual/classes|Abc.js documentation}
 * @example
 * // returns the measure from the beginning of the tune
 * getValueFromNote(element, "abcjs-mm");
 * @param element The note element
 * @param classPrefix How the class name starts (without the value)
 * @returns The value for the passed class prefix
 */
export function getValueFromNote(element: SVGGElement, classPrefix: string) {
  return Number(
    element.classList
      .toString()
      .split(" ")
      .find((x) => x.startsWith(classPrefix))
      ?.replace(classPrefix, ""),
  );
}

/**
 * Extracts the note duration from an abc.js element.
 * @param element The note element
 * @returns The note duration
 */
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

const subDivisionsMap = {
  8: 2,
  4: 4,
  2: 8,
  1: 16,
} as Record<number, number>;

function getBarLength([num, den]: TimeSignature) {
  return (1 / den!) * num;
}

function getRelativePosition(
  position: TransportPosition,
  [, den]: TimeSignature,
) {
  const [, beat, subdivisions] = position.split(":").map(Number) as [
    number,
    number,
    number,
  ];

  const beatDuration = 1 / den!;
  const subDivisionDuration = beatDuration / subDivisionsMap[den]!;

  return beatDuration * beat + subdivisions * subDivisionDuration;
}
