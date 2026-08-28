/**
 * The time signature of a score, expressed as a tuple of two integers.
 */
export type TimeSignature = [number, number];

/**
 * The default note length of an abc score, expressed as a fraction.
 */
export type UnitNoteLength = `${number}/${number}`;

/**
 * Indicates a transport position in the format {bars}:{beats}:{sub-subdivisions}.
 * A TransportPosition must always be considered in the time signature context.
 */
export type TransportPosition = `${number}:${number}:${number}`;

/**
 * @property id The score id
 * @property content The score content (in abc notation)
 * @property hash The score hash (computed for caching)
 * @property info The score meta info
 */
export type Score = {
  id: string;
  content: string;
  hash: string;
  info: ScoreInfo;
};

/**
 * @property title The score title
 * @property composer The score composer
 * @property timeSignature The score time signature (e.g. "4/4", "3/8")
 * @property unitNoteLength The score unit note length (e.g. "1/8", "1/4")
 * @property key The score key (e.g. "C", "Eb")
 * @property bpm The score tempo
 */
export type ScoreInfo = {
  title?: string;
  composer?: string;
  timeSignature: TimeSignature;
  unitNoteLength?: UnitNoteLength;
  key?: string;
  bpm: number;
};

/**
 * The current player status.
 */
export type PlayerStatus = "playing" | "paused" | "stopped";

/**
 * Comma separated notes in a single string, or an array of notes (in scientific pitch notation)
 */
export type NoteInput = string | string[];

/**
 * A CSS selector, a single node or a list of nodes.
 */
export type ElementOrSelector<T extends HTMLElement> =
  NodeListOf<T> | T | string;
