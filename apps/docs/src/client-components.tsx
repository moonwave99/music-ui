"use client";

import { IoPlay, IoMusicalNotes, IoStop, IoPause } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";

export { VanillaABCScore } from "./VanillaABCScore";
export { VanillaPianoWithPlayer } from "./VanillaPianoWithPlayer";
export { VanillaChords } from "./VanillaChords";
export { VanillaChordsWithPlayer } from "./VanillaChordsWithPlayer";

import {
  PianoWithPlayer as OriginalPianoWithPlayer,
  ChordWithPlayer as OriginalChordWithPlayer,
  ABCScoreWithPlayer as OriginalABCScoreWithPlayer,
  type PianoWithPlayerProps,
  type ChordWithPlayerProps,
  type ABCScoreWithPlayerProps,
} from "@music-ui/react";

export { Chord, Scale, Fretboard, Piano, ABCScore } from "@music-ui/react";

export function ChordWithPlayer(props: ChordWithPlayerProps) {
  return <OriginalChordWithPlayer {...withPlayButtons(props)} />;
}

export function PianoWithPlayer(props: PianoWithPlayerProps) {
  return <OriginalPianoWithPlayer {...withPlayButtons(props)} />;
}

export function ABCScoreWithPlayer(props: ABCScoreWithPlayerProps) {
  return <OriginalABCScoreWithPlayer {...withPlayButtons(props)} />;
}

export function withPlayButtons<T>(props: T) {
  return {
    ...props,
    playButtonContent: (
      <>
        <IoPlay />
        Play
      </>
    ),
    arpeggioButtonContent: (
      <>
        <IoMusicalNotes />
        Arpeggio
      </>
    ),
    pauseButtonContent: (
      <>
        <IoPause />
        Pause
      </>
    ),
    stopButtonContent: (
      <>
        <IoStop />
        Stop
      </>
    ),

    resetButtonContent: (
      <>
        <VscDebugRestart />
        Reset
      </>
    ),
  };
}
