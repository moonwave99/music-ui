import md5 from "md5";
import { scientificToAbcNotation } from "@tonaljs/abc-notation";
import { parseAbc, getAbcInfo, type ParseAbcOptions } from "./abcParser";
import dedent from "dedent";
import type {
  TimeSignature,
  TransportPosition,
  ElementOrSelector,
  Score,
  NoteInput,
} from "./types";

import { DEFAULT_TIME_SIGNATURE } from "./player";

/**
 * @param id The score id
 * @param input The score input (in abc notation)
 * @param options The abc parse options
 */
type GetAbcScoreParams = Pick<Score, "id"> & {
  input: string;
  options?: ParseAbcOptions;
};

/**
 * Wraps abc notation input with meta info, and normalizes abc info fields.
 * @param {GetAbcScoreParams} params The input for generating the score  
 * @returns A score object with the normalized meta info and content
 */
export function getAbcScore({ id, input, options }: GetAbcScoreParams): Score {
  const { info, content } = parseAbc(input, options);
  return {
    id,
    info,
    content,
    hash: getScoreHash(id, content),
  };
}

/**
 * Playback mode for the Piano widget.
 */
export type PlaybackMode = "block" | "arpeggio";

/**
 * @property id The score id
 * @property bpm The score bpm
 * @property input The score input (in scientific pitch notation)
 * @property playbackMode The playback mode (block or arpeggio)
 */
type GetPianoScoreParams = {
  id: string;
  bpm?: number;
  input: NoteInput;
  playbackMode?: PlaybackMode;
};

/**
 * Generates a small abc score for playback of Piano widget chords / arpeggios.
 * @param __namedParameters The parameters for generating a piano score
 * @returns a Score with the abc notation of the passed notes in the desired playback mode (arpeggio / block).
 */
export function getPianoScore({
  id,
  input,
  playbackMode = "block",
  bpm = 120,
}: GetPianoScoreParams): Score {
  const content = [
    getAbcInfo({ Q: bpm }),
    withPlaybackMode(input, playbackMode),
  ].join("\n");

  return {
    id,
    content,
    info: { bpm, timeSignature: [4, 4] },
    hash: getScoreHash(id, content),
  };
}

/**
 * Converts scientific pitch notation input to abc notation.
 * @example
 * // returns CEG
 * toAbcNotation(['C3, 'G3', 'B3']);
 * @example
 * // returns CEG
 * toAbcNotation('C3 G3 B3');
 * @param input The note input in scientific pitch notation
 * @returns The corresponding abc notation output
 */
export function toAbcNotation(input: NoteInput) {
  return (Array.isArray(input) ? input : input.split(" "))
    .map(scientificToAbcNotation)
    .join(" ");
}

/**
 * Converts a scientific pitch notation input to the abc notation of the desired playback mode.
 * @example
 * // returns [CEG]6
 * withPlaybackMode(['C3', 'G3', 'B3'], 'block');
 * @example
 * // returns CEG
 * withPlaybackMode(['C3', 'G3', 'B3'], 'arpeggio');
 * @param input The note input in scientific pitch notation
 * @param playbackMode The playback mode (arpeggio / block)
 * @returns The corresponding abc notation
 */
export function withPlaybackMode(input: NoteInput, playbackMode: PlaybackMode) {
  const output = toAbcNotation(input);
  return playbackMode === "block" ? `[${output}]6` : output;
}

/**
 * Normalizes a selection (string, Element, NodeList) to a fixed state (jQuery <3).
 * @param elementOrSelector A CSS selector, a single node or a list of nodes
 * @returns An array of the selected elements
 */
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

/**
 * Extracts data attributes from a given element out of a sample whitelist.
 * @param el The element to gather attributes from
 * @param baseOptions The whitelist of accepted data attributes and their relative types
 * @returns An object of the available attributes and their values
 */
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

/**
 * Joins an array of voices to a comma separated string in reverse order.
 * Needed to make the top voice (0-indexed) stay at the top when rendering on a Piano (right hand).
 * @param voices The array of voices (e.g. [["G3", "B3"], ["C3", "G3"]])
 * @returns The joined voices string
 */
export function joinVoices(voices: string[][]) {
  return voices
    .map((notes) => notes.join(" "))
    .toReversed()
    .join(",");
}

/**
 * Removes indentation and leading / trailing whitespace from embedded content.
 * Useful for cleaning up abc notation.
 * @param input The input to be cleaned
 * @returns The cleaned content
 */
export function extractIndentedInput(input: string) {
  return dedent(input.trim());
}

/**
 * Parses a time signature into a tuple of numbers.
 * @example
 * // returns [6, 8]
 * parseTimeSignature("6/8");
 * @param timeSignature The string containing the time signature, e.g. 4/4 or 6/8
 * @returns The corresponding number tuple
 */
export function parseTimeSignature(timeSignature = "4/4"): TimeSignature {
  const match = timeSignature.match(/(\d+)\/(\d+)/);
  if (!match) {
    console.warn(
      `Could not parse the passed time signature (${timeSignature}), assuming 4/4.`,
    );
    return DEFAULT_TIME_SIGNATURE;
  }
  return [Number(match[1]), Number(match[2])];
}

/**
 * Checks if the time signature is 1/1 (for free tempos)
 * @param timeSignature The time signature
 * @returns
 */
export function isTimeSignatureUnary(timeSignature: TimeSignature) {
  return `${timeSignature}` === "1,1";
}

/**
 * Converts the Tone transport position to match the score time signature.
 * @remark Since Tone.js converts all time signatures to simple (e.g. 6/8 to 3/4), we need to convert the transport position to update the score progress position
 * @param position The current position
 * @param timeSignature The score time signature
 * @returns
 */
export function tonePositionToNormalizedPosition(
  position: TransportPosition,
  timeSignature: TimeSignature,
) {
  if (!isTimeSignatureCompound(timeSignature)) {
    return position;
  }
  const numerator = timeSignature.at(0)!;
  const [bars, beats, subdivisions] = parseTransportPosition(position);
  const totalBeats = bars * 3 + beats;
  const newBars = Math.floor(totalBeats / numerator);
  const newBeats = totalBeats - newBars * numerator;
  const newSubdivisions = subdivisions / 2;

  return `${newBars}:${newBeats}:${newSubdivisions}`;
}

/**
 * Converts the current position to the Tone transport one.
 * @see {@link tonePositionToNormalizedPosition}
 * @param position The current position
 * @param timeSignature The score time signature
 * @returns
 */
export function normalizedPositionToTonePosition(
  position: TransportPosition,
  timeSignature: TimeSignature,
): TransportPosition {
  if (!isTimeSignatureCompound(timeSignature)) {
    return position;
  }
  const numerator = timeSignature.at(0)!;
  const [bars, beats, subdivisions] = parseTransportPosition(position);
  const totalBeats = bars * numerator + beats;
  const newBars = Math.floor(totalBeats / 3);
  const newBeatsWithRest = totalBeats - newBars * 3;
  const newBeats = Math.floor(newBeatsWithRest);
  const newSubdivisions = subdivisions * 2;

  return `${newBars}:${newBeats}:${newSubdivisions}`;
}

/**
 * Creates buttons from a key-value list of handlers, attaches the handlers to them and appends them to the passed element.
 * @param element The element where the buttons will be appended
 * @param handlers The event handlers attached to the buttons
 * @returns
 */
export function createControls(
  element: HTMLElement,
  handlers: Record<string, () => void>,
) {
  const buttons = {} as Record<string, HTMLButtonElement>;

  Object.entries(handlers).forEach(([name, handler]) => {
    const button = document.createElement("button");
    button.classList.add(`${name}-button`);
    button.addEventListener("click", handler);
    button.textContent = name;
    element.append(button);
    buttons[name] = button;
  });

  return buttons;
}

/**
 * @property id The rendering context id (e.g. `piano-1`, `score-3`)
 * @property parentElement The element that should contain the children elements
 * @property elements The key-value lookup list
 *
 * @example
 * {
 *    staffElement: ".staff",
 *    controlsElement: ".controls",
 * }
 */
type EnsureElementsParams = {
  id: string;
  parentElement: HTMLElement;
  elements: Record<string, string>;
};

/**
 * Given a key-value lookup list of desired element names and relative CSS selectors, it populates an object with the same keys and the found elements.
 * @throws `${key} not found inside element with id: ${id}` as soon as an element of the list is not found.
 * @param __namedParameters The id of the context, the parent element, the key-value lookup list
 * @returns The key-value list of element names and selections
 */
export function ensureElements({
  id,
  parentElement,
  elements,
}: EnsureElementsParams) {
  const output = {} as Record<string, HTMLElement>;
  Object.entries(elements).forEach(([key, value]) => {
    const element = parentElement.querySelector<HTMLElement>(value);
    if (!element) {
      throw new Error(`${key} not found inside element with id: ${id}`);
    }
    output[key] = element;
  });
  return output;
}

function getScoreHash(id: string, content: string) {
  return md5(`${id}${content}`);
}

function isTimeSignatureCompound(timeSignature: TimeSignature) {
  return ["6,8", "9,8", "12,8"].includes(`${timeSignature}`);
}

function parseTransportPosition(
  position: TransportPosition,
): [number, number, number] {
  return position.split(":").map(Number) as [number, number, number];
}
