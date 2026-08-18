import { synth } from "abcjs";
import { Midi } from "@tonejs/midi";
import type { Score } from "./types";
import { parseMidiData } from "./lib";
import { ParsedVoice } from "./lib";

export class ScoreManager {
  private cache: Record<string, ParsedVoice[]>;
  constructor() {
    this.cache = {};
  }
  getScoreContent(score: Score, timeTolerance: number): ParsedVoice[] {
    /* istanbul ignore if  */
    if (this.cache[score.hash]) {
      return this.cache[score.hash]!;
    }
    const rawMidi = synth
      .getMidiFile(score.content, { midiOutputType: "binary" })
      .at(0);
    const midi = new Midi(rawMidi);
    const scoreData = parseMidiData(midi.toJSON(), timeTolerance);
    this.cache[score.hash] = scoreData;
    return scoreData;
  }
}
