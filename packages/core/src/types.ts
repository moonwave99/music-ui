export type TimeSignature = [number, number];

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
  timeSignature?: string;
  unitNoteLength?: string;
  key?: string;
  bpm?: number;
};

/**
 * Comma separated notes in a single string, or an array of notes (in scientific pitch notation)
 */
export type NoteInput = string | string[];

/**
 * A CSS selector, a single node or a list of nodes.
 */
export type ElementOrSelector<T extends HTMLElement> =
  NodeListOf<T> | T | string;
