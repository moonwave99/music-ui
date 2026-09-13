import type { NoteInput } from "@music-ui/core";
import { type GroupedInput } from "./Piano";

/**
 * Parses the note input and groups it by voice.
 * @param input The note input
 * @param noteLabels The note labels
 * @returns The notes grouped by voice
 */
export function parseNoteInput(
  input: NoteInput,
  noteLabels: NoteInput = "",
): GroupedInput {
  const noteGroups = getGroups(input).toReversed();
  const labelGroups = getGroups(noteLabels).toReversed();
  return noteGroups.flatMap((group, groupIndex) =>
    group.map((note, noteIndex) => ({
      note,
      group: groupIndex,
      label: getNoteLabel(
        labelGroups[groupIndex] ? labelGroups[groupIndex][noteIndex] : "",
      ),
    })),
  );
}

function getGroups(input: NoteInput) {
  return Array.isArray(input)
    ? [input]
    : input
        .split(",")
        .filter(Boolean)
        .map((x) => x.split(" ").filter(Boolean));
}

function getNoteLabel(label: string | undefined) {
  if (!label || label === "_") {
    return "";
  }
  return label;
}

/**
 * Returns an array of notes from a mixed input.
 *
 * @example
 * // returns ["C3", "E3", "G3"]
 * normalizeInput("C3, E3 G3");
 *
 * @example
 * // returns ["C3", "E3", "G3"]
 * normalizeInput(["C3", "E3", "G3"]);
 *
 * @param input The note input (either a comma-separated list of notes or an array of notes)
 * @returns An array of notes
 */
export function normalizeInput(input: NoteInput) {
  return Array.isArray(input)
    ? input
    : input.replaceAll(",", "").split(" ").filter(Boolean);
}
