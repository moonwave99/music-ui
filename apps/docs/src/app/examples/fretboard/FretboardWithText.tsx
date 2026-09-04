"use client";

import { Fretboard } from "@music-ui/react";

const arpeggio = [
  { string: 6, fret: 0, note: "E" },
  { string: 6, fret: 3, note: "G" },
  { string: 5, fret: 3, note: "C" },
  { string: 4, fret: 2, note: "E" },
  { string: 3, fret: 0, note: "G" },
  { string: 2, fret: 1, note: "C" },
  { string: 1, fret: 0, note: "E" },
  { string: 1, fret: 3, note: "G" },
];

export function Arpeggio() {
  return <Fretboard width={600} fretCount={5} positions={arpeggio} />;
}

export function ArpeggioWithText() {
  return (
    <Fretboard
      width={600}
      fretCount={5}
      positions={arpeggio}
      positionText={({ note }) => note!}
    />
  );
}

export function ArpeggioWithTextAndRootNotes() {
  return (
    <Fretboard
      width={600}
      fretCount={5}
      positions={arpeggio}
      positionText={({ note }) => note!}
      style={{
        fill: ({ note }) => (note === "C" ? "orange" : "white"),
      }}
    />
  );
}
