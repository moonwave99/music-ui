import * as Tone from "tone";
import { Player, type PlayerOptions } from "./player";
import { createSampler, type CreateSamplerParams } from "./lib";

type PlayerFactoryParams = CreateSamplerParams & PlayerOptions;

export function playerFactory(options?: PlayerFactoryParams): Player {
  const player = new Player({
    draw: Tone.getDraw(),
    transport: Tone.getTransport(),
    sampler: createSampler(options),
    startAudio: () => Tone.start(),
    getPart: (callback, info) => new Tone.Part(callback, info),
    options,
  });
  return player;
}
