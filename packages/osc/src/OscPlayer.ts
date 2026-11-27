import { EventEmitter } from "events";

/**
 * The events triggered by the player.
 */
export type OscPlayerEvents =
  "start" | "finished" | "noAvailableVoices" | "allFinished";

/**
 * The osc player event listener callback.
 * @property id The current osc id.
 */
export type OscPlayerCallback = (params: { id: string }) => void;

/**
 * The parameters accepted by the OscPlayer constructor.
 * @property context The AudioContext used for playback
 * @property analyzer The AnalyserNode used by the oscilloscope
 * @property voices The max allowed playback voices
 */
type OscPlayerConstructors = {
  context: AudioContext;
  analyzer: AnalyserNode;
  voices?: number;
};

/**
 * The parameters accepted by the play function.
 * @property id The oscillator unique identifier
 * @property frequency The oscillator frequency
 * @property duration The playback duration
 * @property volume The playback volume
 * @property fadeInTime The playback fade in time
 * @property fadeOutTime The playback fade out time
 */
type OscPlayParams = {
  id: string;
  frequency: number;
  duration: number;
  volume: number;
  fadeInTime?: number;
  fadeOutTime?: number;
};

const DEFAULT_MAX_VOICES = 2;
const DEFAULT_FADE_IN_TIME = 0.05;
const DEFAULT_FADE_OUT_TIME = 0.05;

export class OscPlayer {
  private context: AudioContext;
  private eventEmitter: EventEmitter;
  private analyser: AnalyserNode;
  private data: Uint8Array<ArrayBuffer>;
  private oscillators: {
    started: boolean;
    osc: OscillatorNode;
    gain: GainNode;
    timeout: number;
  }[];
  /**
   * Creates an `OscPlayer` instance.
   *
   * @param __namedParameters The accepted params
   */
  constructor({
    context,
    analyzer,
    voices = DEFAULT_MAX_VOICES,
  }: OscPlayerConstructors) {
    this.context = context;
    this.eventEmitter = new EventEmitter();

    this.analyser = analyzer;

    this.analyser.connect(context.destination);
    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    this.oscillators = Array.from({ length: voices }, () => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(this.analyser);

      return {
        playing: false,
        started: false,
        osc,
        gain,
        timeout: -1,
      };
    });
  }
  /**
   * Returns the analyzer data at the current time
   * @returns the analyzer data
   */
  getData() {
    this.analyser.getByteTimeDomainData(this.data);
    return this.data;
  }
  /**
   * @returns the current AudioContext
   */
  getAudioContext() {
    return this.context;
  }
  /**
   * Listens to the passed OscPlayer event
   * @param eventName The event name
   * @param callback The event callback
   * @returns The corresponding unsubscribe function
   */
  on(eventName: OscPlayerEvents, callback: OscPlayerCallback) {
    this.eventEmitter.addListener(eventName, callback);
    return () => this.eventEmitter.removeListener(eventName, callback);
  }
  /**
   * Clears all event listeners and future playback scheduled events.
   */
  destroy() {
    this.oscillators.forEach(({ osc, gain, timeout, started }) => {
      gain.disconnect();
      osc.disconnect();
      if (started) {
        osc.stop();
      }
      clearTimeout(timeout);
    });
    this.eventEmitter.removeAllListeners();
  }
  /**
   * Schedules immediate playback.
   * @param __namedParameters The accepted params
   * @returns The current OscPlayer instance
   */
  play({
    id,
    frequency,
    duration,
    volume,
    fadeInTime = DEFAULT_FADE_IN_TIME,
    fadeOutTime = DEFAULT_FADE_OUT_TIME,
  }: OscPlayParams) {
    if (this.oscillators.every(({ timeout }) => timeout > -1)) {
      console.warn("All oscillators are already playing");
      this.eventEmitter.emit("noAvailableVoices", { id });
      return;
    }
    const { currentTime } = this.context;
    const oscillator = this.oscillators.find(({ timeout }) => timeout < 0)!;
    oscillator.osc.frequency.value = frequency;

    if (!oscillator.started) {
      oscillator.started = true;
      oscillator.osc.start();
    }

    oscillator.gain.gain.setValueAtTime(0, currentTime);
    oscillator.gain.gain.linearRampToValueAtTime(
      volume,
      currentTime + fadeInTime,
    );
    oscillator.gain.gain.setValueAtTime(
      volume,
      currentTime + duration - fadeOutTime,
    );
    oscillator.gain.gain.linearRampToValueAtTime(0, currentTime + duration);
    this.eventEmitter.emit("start", { id });

    oscillator.timeout = setTimeout(() => {
      oscillator.timeout = -1;
      this.eventEmitter.emit("finished", { id });
      if (this.oscillators.some(({ timeout }) => timeout === -1)) {
        return;
      }
      this.eventEmitter.emit("allFinished");
    }, duration * 1000);

    return this;
  }
}
