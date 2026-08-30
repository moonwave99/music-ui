import * as Tone from "tone";
import { Player, type PlayerOptions } from "./player";
import { createSampler, type CreateSamplerParams } from "./lib";

/**
 * The options needed by the various dependencies.
 * @property samplerOptions The available sampler options.
 * @property playerOptions The available Player options.
 */
export type PlayerFactoryParams = {
  playerOptions: PlayerOptions;
  samplerOptions: CreateSamplerParams;
};

/**
 * Creates a new `Player` with the needed dependencies.
 * @param __namedParameters The options needed by the various dependencies.
 * @returns A `Player` instance.
 */
export function playerFactory({
  playerOptions,
  samplerOptions,
}: Partial<PlayerFactoryParams> = {}): Player {
  const player = new Player({
    draw: Tone.getDraw(),
    transport: Tone.getTransport(),
    sampler: createSampler(samplerOptions),
    startAudio: () => Tone.start(),
    getPart: (callback, info) => new Tone.Part(callback, info),
    options: playerOptions,
  });
  return player;
}
