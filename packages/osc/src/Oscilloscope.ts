import { type OscPlayer } from "./OscPlayer";

/**
 * The parameters accepted by the Oscilloscope constructor.
 * @property element The element where the Oscilloscope will be rendered
 * @property player An OscPlayer instance
 * @property axisColor The middle axis color
 * @property axisStrokeWidth The middle axis stroke width
 * @property waveFormColor The waveform color
 * @property waveFormStrokeWidth The waveform stroke width
 * @property backgroundColor The background color
 */
type OscilloscopeParams = {
  element: HTMLElement;
  player: OscPlayer;
  axisColor?: string;
  axisStrokeWidth?: number;
  waveFormColor?: string;
  waveFormStrokeWidth?: number;
  backgroundColor?: string;
};

const DEFAULT_AXIS_COLOR = "#1C3A26";
const DEFAULT_AXIS_WIDTH = 4;
const DEFAULT_BACKGROUND_COLOR = "#07140C";
const DEFAULT_WAVEFORM_COLOR = "#86FCA4";
const DEFAULT_WAVEFORM_WIDTH = 2;

export class Oscilloscope {
  private element: HTMLElement;
  private rendered: boolean;
  private player: OscPlayer;
  private shouldRefresh: boolean;
  private canvas: HTMLCanvasElement | null;
  private resizeObserver: ResizeObserver | null;
  private axisColor: string;
  private axisStrokeWidth: number;
  private waveFormColor: string;
  private waveFormStrokeWidth: number;
  private backgroundColor: string;
  /**
   * Creates an `Oscilloscope` instance.
   *
   * @param __namedParameters The accepted params
   */
  constructor({
    element,
    player,
    axisColor = DEFAULT_AXIS_COLOR,
    axisStrokeWidth = DEFAULT_AXIS_WIDTH,
    waveFormColor = DEFAULT_WAVEFORM_COLOR,
    waveFormStrokeWidth = DEFAULT_WAVEFORM_WIDTH,
    backgroundColor = DEFAULT_BACKGROUND_COLOR,
  }: OscilloscopeParams) {
    this.element = element;
    this.player = player;
    this.rendered = false;
    this.shouldRefresh = false;
    this.canvas = null;
    this.resizeObserver = null;
    this.axisColor = axisColor;
    this.axisStrokeWidth = axisStrokeWidth;
    this.waveFormColor = waveFormColor;
    this.waveFormStrokeWidth = waveFormStrokeWidth;
    this.backgroundColor = backgroundColor;

    this.player.on("start", () => {
      this.shouldRefresh = true;
      this.drawWave();
    });
    this.player.on("allFinished", () => {
      this.shouldRefresh = false;
      this.render();
    });
  }
  /**
   * Renders the oscilloscope inside the current element.
   * @returns The current Oscilloscope instance.
   */
  render() {
    this.baseRender();
    this.resizeCanvas();
    this.drawBackground();
    this.drawAxis();
    return this;
  }
  /**
   * Clears all event listeners
   */
  destroy() {
    this.resizeObserver?.disconnect();
  }
  private drawBackground() {
    const canvas = this.canvas!;
    const c = canvas.getContext("2d")!;
    c.fillStyle = this.backgroundColor;
    c.fillRect(0, 0, canvas.width, canvas.height);
  }
  private drawAxis() {
    const canvas = this.canvas!;
    const c = canvas.getContext("2d")!;
    c.strokeStyle = this.axisColor;
    c.lineWidth = this.axisStrokeWidth;
    c.beginPath();
    c.moveTo(0, canvas.height / 2);
    c.lineTo(canvas.width, canvas.height / 2);
    c.stroke();
    c.closePath();
  }
  private drawWave() {
    const data = this.player.getData();
    const canvas = this.canvas!;
    const c = canvas.getContext("2d")!;

    this.drawBackground();
    this.drawAxis();

    if (!this.shouldRefresh) {
      return;
    }

    c.beginPath();
    c.strokeStyle = this.waveFormColor;
    c.lineWidth = this.waveFormStrokeWidth;

    const segmentWidth = canvas.width / data.length;
    const startIndex = data.findIndex(
      (value, index) => index > 0 && data[index - 1]! < 128 && value >= 128,
    );
    for (let i = startIndex; i < data.length; i += 1) {
      const x = (i - startIndex) * segmentWidth;
      const v = data[i]! / 128.0;
      const y = (v * canvas.height) / 2;
      c.lineTo(x, y);
    }

    c.stroke();
    c.closePath();

    requestAnimationFrame(this.drawWave.bind(this));
  }
  private resizeCanvas() {
    const { width, height } = this.element.getBoundingClientRect();
    this.canvas!.width = width;
    this.canvas!.height = height;
  }
  private baseRender() {
    /* istanbul ignore if  */
    if (this.rendered) {
      return;
    }
    this.canvas = document.createElement("canvas");
    this.element.appendChild(this.canvas);
    this.rendered = true;
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(this.render.bind(this));
      this.resizeObserver.observe(this.element);
    }
  }
}
