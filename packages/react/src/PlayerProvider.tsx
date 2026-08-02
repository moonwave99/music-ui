import {
  createContext,
  use,
  useState,
  useEffect,
  type Context,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import { PolySynth, Sequence, getTransport } from "tone";

let synth: PolySynth;

type PlayerContextType = {
  playingId: string | null;
  setPlayingId: Dispatch<SetStateAction<string | null>>;
};

const PlayerContext: Context<PlayerContextType> =
  createContext<PlayerContextType>({
    playingId: null,
    setPlayingId: () => {},
  });

type PlaybackMode = "block" | "arpeggio";

export type UsePlayer = {
  play: (mode?: PlaybackMode) => void;
  isPlaying: boolean;
  activeNotes: string[];
};

type UsePlayerParams = {
  id: string;
  notes: string[];
};

const PLAYBACK_BLOCK_DURATION = 1;
const PLAYBACK_ARPEGGIO_DURATION = 0.1;

export function usePlayer({ id, notes }: UsePlayerParams): UsePlayer {
  const playerContext = use(PlayerContext);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);

  if (!playerContext) {
    throw new Error("useCurrentUser has to be used within <PlayerProvider>");
  }

  const { playingId, setPlayingId } = playerContext;

  function play(mode: PlaybackMode = "block") {
    setPlayingId(id);
    if (mode === "block") {
      setActiveNotes(notes);
      synth.triggerAttackRelease(notes, PLAYBACK_BLOCK_DURATION);
      setTimeout(() => {
        setActiveNotes([]);
        setPlayingId(null);
      }, PLAYBACK_BLOCK_DURATION * 1000);
      return;
    }
    const transport = getTransport();
    const sequence = new Sequence((time, note) => {
      setActiveNotes([note]);
      synth.triggerAttackRelease(note, PLAYBACK_ARPEGGIO_DURATION, time);
      if (note === notes.at(-1)) {
        setTimeout(
          () => {
            setActiveNotes([]);
            setPlayingId(null);
            transport.stop();
            sequence.clear();
          },
          PLAYBACK_ARPEGGIO_DURATION * 1000 * notes.length,
        );
      }
    }, notes);
    sequence.loop = 1;
    sequence.start(0);
    transport.start();
  }

  return { play, activeNotes, isPlaying: !!playingId };
}

type PlayerProviderProps = {
  children: ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (synth) {
      return;
    }
    synth = new PolySynth().toDestination();
  }, []);

  return (
    <PlayerContext value={{ playingId, setPlayingId }}>
      {children}
    </PlayerContext>
  );
}
