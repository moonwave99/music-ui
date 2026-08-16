import { synth } from "abcjs";
import { Midi } from "@tonejs/midi";
import { parseMidiData } from "./lib";
import { PlaybackInfo } from "./player";
import { Score } from "./utils";

export class ScoreManager {
  private cache: Record<string, PlaybackInfo[]>;
  constructor() {
    this.cache = {};
  }
  getScoreContent(score: Score, timeTolerance: number): PlaybackInfo[] {
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
