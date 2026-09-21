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
    textProperty: "note",
  },
  {
    input: "x5454x",
    chordName: "D7b9",
    showName: true,
    crop: true,
    showFretNumbers: true,
    textProperty: "note",
  },
  {
    input: "131244",
    chordName: "F7#9",
    showName: true,
    crop: true,
    showFretNumbers: true,
    textProperty: "note",
    barres: "1:6:4,4:2",
  },
] as const;

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
