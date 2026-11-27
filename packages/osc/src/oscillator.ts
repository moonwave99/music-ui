import type { OscPlayer } from "./OscPlayer";

const FREQUENCY_BOUNDS = [20, 20000] as const;

/**
 * @property {string} content The oscillator element class
 * @property {string} value The oscillator value element class
 * @property {string} controls The oscillator controls element class
 */
export const cssClasses = {
  oscillator: "oscillator",
  value: "value",
  controls: "controls",
} as const;

export const DEFAULT_OSCILLATOR_PARAMS = {
  frequency: 440,
  volume: 0.5,
  duration: 1,
  label: "",
  playbackLabel: "Play",
} as const;

/**
 * The parameters accepted by the Oscillator constructor.
 *
 * @property player The OscPlayer instance
 * @property element The element where the oscillator will be rendered
 * @property id The oscillator unique identifier
 * @property frequency The oscillator frequency
 * @property volume The oscillator volume
 * @property label The oscillator label
 * @property playbackLabel The oscillator playback button label
 */
export type OscillatorParams = {
  player: OscPlayer;
  element: HTMLElement;
  id: string;
  frequency?: number;
  volume?: number;
  duration?: number;
  label?: string;
  playbackLabel?: string;
};

export class Oscillator {
  private player: OscPlayer;
  private element: HTMLElement;
  private id: string;
  private frequency: number = DEFAULT_OSCILLATOR_PARAMS.frequency;
  private volume: number;
  private duration: number;
  private label: string;
  private playbackLabel: string;
  private rendered: boolean;
  private playbackButton: HTMLButtonElement | null;
  /**
   * Creates an `Oscillator` instance.
   *
   * @param __namedParameters The accepted params
   */
  constructor({
    player,
    element,
    id,
    frequency = DEFAULT_OSCILLATOR_PARAMS.frequency,
    volume = DEFAULT_OSCILLATOR_PARAMS.volume,
    duration = DEFAULT_OSCILLATOR_PARAMS.duration,
    label = DEFAULT_OSCILLATOR_PARAMS.label,
    playbackLabel = DEFAULT_OSCILLATOR_PARAMS.playbackLabel,
  }: OscillatorParams) {
    if (!element) {
      throw new Error("Element not found");
    }
    this.player = player;
    this.element = element;
    this.id = id;
    this.setFrequency(frequency);
    this.volume = volume;
    this.duration = duration;
    this.label = label;
    this.playbackLabel = playbackLabel;
    this.rendered = false;
    this.playbackButton = null;
    player.on("start", ({ id }) => {
      if (id !== this.id) {
        return;
      }
      this.playbackButton!.disabled = true;
    });
    player.on("noAvailableVoices", ({ id }) => {
      if (id !== this.id) {
        return;
      }
      this.playbackButton!.disabled = false;
    });
    player.on("finished", ({ id }) => {
      if (id !== this.id) {
        return;
      }
      this.playbackButton!.disabled = false;
    });
  }
  /**
   * Sets the new frequency value, clamped to the audible frequency bounds.
   * @param frequency The new frequency value
   * @returns The current Oscillator instance
   */
  setFrequency(frequency: number): Oscillator {
    const [lowFreq, highFreq] = FREQUENCY_BOUNDS;
    if (frequency < lowFreq) {
      this.frequency = lowFreq;
      console.warn(`Oscillator frequency cannot be lower than ${lowFreq}`);
      return this;
    }
    if (frequency > highFreq) {
      this.frequency = highFreq;
      console.warn(`Oscillator frequency cannot be higher than ${highFreq}`);
      return this;
    }
    this.frequency = frequency;
    return this;
  }
  /**
   * @returns the oscillator frequency
   */
  getFrequency() {
    return this.frequency;
  }
  /**
   * Renders the UI inside the current element.
   * @returns The current Oscillator instance.
   */
  render(): Oscillator {
    /* istanbul ignore if  */
    if (this.rendered) {
      return this;
    }
    this.baseRender();
    return this;
  }
  private onPlay() {
    this.player.play({
      id: this.id,
      frequency: this.frequency,
      duration: this.duration,
      volume: this.volume,
    });
  }
  private baseRender() {
    const valueElement = document.createElement("div");
    valueElement.classList.add(cssClasses.value);
    valueElement.textContent = this.label
      ? `${this.frequency} - ${this.label}`
      : `${this.frequency}`;

    const controlsElement = document.createElement("div");
    controlsElement.classList.add(cssClasses.controls);

    this.playbackButton = document.createElement("button");
    this.playbackButton.textContent = this.playbackLabel;
    this.playbackButton.setAttribute(
      "aria-label",
      `Playback oscillator with frequency: ${this.frequency}`,
    );
    this.playbackButton.addEventListener("click", this.onPlay.bind(this));
    controlsElement.appendChild(this.playbackButton);

    this.element.appendChild(valueElement);
    this.element.appendChild(controlsElement);
    this.rendered = true;
  }
}
