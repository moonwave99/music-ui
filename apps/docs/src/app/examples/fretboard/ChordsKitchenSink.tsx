"use client";

import { Chord } from "@music-ui/react";
import { ChordWithPlayer } from "@music-ui/react";

const chords = [
  {
    input: "x32010",
    chordName: "C major",
    showName: true,
    showFretNumbers: true,
    includeOpenStrings: true,
    showNoteNames: true,
  },
  {
    input: "x5454x",
    chordName: "D7b9",
    showName: true,
    crop: true,
    showFretNumbers: true,
    includeOpenStrings: true,
    showNoteNames: true,
  },
  {
    input: "131244",
    chordName: "F7#9",
    showName: true,
    crop: true,
    showFretNumbers: true,
    includeOpenStrings: true,
    showNoteNames: true,
    barres: "1:6:4,4:2",
  },
];

type ChordsKitchenSinkProps = {
  withPlayer?: boolean;
};

export function ChordsKitchenSink({
  withPlayer = false,
}: ChordsKitchenSinkProps) {
  const Component = withPlayer ? ChordWithPlayer : Chord;
  return (
    <div className="chords">
      {chords.map((props, index) => (
        <Component key={index} {...props} />
      ))}
    </div>
  );
}
