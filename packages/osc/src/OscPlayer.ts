import { EventEmitter } from "events";

/**
 * The events triggered by the player.
 */
export type OscPlayerEvents = "start" | "finished" | "noAvailableVoices";

/**
 * The osc player event listener callback.
 * @property id The current osc id.
 */
export type OscPlayerCallback = (params: { id: string }) => void;

type OscPlayerConstructors = {
  context: AudioContext;
  voices?: number;
};

type OscPlayParams = {
  id: string;
  frequency: number;
  duration: number;
  volume: number;
};

const DEFAULT_MAX_VOICES = 2;

export class OscPlayer {
  private context: AudioContext;
  private eventEmitter: EventEmitter;
  private oscillators: {
    started: boolean;
    osc: OscillatorNode;
    gain: GainNode;
    timeout: number;
  }[];
  constructor({ context, voices = DEFAULT_MAX_VOICES }: OscPlayerConstructors) {
    this.context = context;
    this.eventEmitter = new EventEmitter();
    this.oscillators = Array.from({ length: voices }, () => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      return {
        playing: false,
        started: false,
        osc,
        gain,
        timeout: -1,
      };
    });
  }
  on(eventName: OscPlayerEvents, callback: OscPlayerCallback) {
    this.eventEmitter.addListener(eventName, callback);
    return () => this.eventEmitter.removeListener(eventName, callback);
  }
  play({ id, frequency, duration, volume }: OscPlayParams) {
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
    oscillator.gain.gain.setValueAtTime(volume, currentTime);
    oscillator.gain.gain.setValueAtTime(0, currentTime + duration);
    this.eventEmitter.emit("start", { id });
    oscillator.timeout = setTimeout(() => {
      oscillator.timeout = -1;
      this.eventEmitter.emit("finished", { id });
    }, duration * 1000);
  }
  destroy() {
    this.oscillators.forEach(({ osc, gain, timeout }) => {
      gain.disconnect();
      osc.disconnect();
      osc.stop();
      clearTimeout(timeout);
    });
    this.eventEmitter.removeAllListeners();
  }
}
