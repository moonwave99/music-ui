import { PlayerPosition } from "@music-ui/core";

export function getCurrentNote(
  barNotes: NodeListOf<SVGGElement>,
  position: PlayerPosition,
) {
  const [, beat, sixteenths] = position.split(":").map(Number) as [
    number,
    number,
    number,
  ];
  const elementsWithDurations = [];

  let relativePosition = 0;

  for (const element of barNotes) {
    const duration = getNoteDuration(element);
    elementsWithDurations.push({
      position: relativePosition * 4,
      element,
      duration,
    });
    relativePosition += duration;
  }

  // #TODO handle sixteenths properly
  for (const { element, position, duration } of elementsWithDurations) {
    if (position + duration * 4 > beat + sixteenths / 4) {
      return element;
    }
  }

  return null;
}

export function getNotePosition(element: SVGGElement): PlayerPosition {
  const bar = getValueFromNote(element, "abcjs-mm");

  const barNotes = element.parentElement!.querySelectorAll<SVGGElement>(
    `:is(.abcjs-note, .abcjs-rest).abcjs-mm${bar}`,
  );

  const barPosition = Array.from(barNotes).indexOf(element);
  const beatWithRest =
    Array.from(barNotes)
      .slice(0, barPosition)
      .reduce((memo, element) => memo + getNoteDuration(element), 0) * 4;

  const rest = beatWithRest % 1;
  const beat = beatWithRest - rest;
  const sixteenths = rest * 4;

  const position = `${bar}:${beat}:${sixteenths}` as PlayerPosition;
  return position;
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
  return duration;
}
