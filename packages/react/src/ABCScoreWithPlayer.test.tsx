import { describe, it, assert, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { type Score } from "@music-ui/core";
import { ABCScoreWithPlayer } from "./ABCScoreWithPlayer";
import { PlayerProvider } from "./PlayerProvider";

//@ts-expect-error Hard to mock the whole thing without having vi.mock to complain
vi.mock(import("@music-ui/core"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Player: vi.fn(
      class {
        private handlers = {} as Record<
          string,
          ((...params: unknown[]) => void)[]
        >;
        private score: Score | null = null;
        on = (eventName: string, handler: (...params: unknown[]) => void) => {
          if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
          }
          this.handlers[eventName].push(handler);
          return () => {
            delete this.handlers[eventName];
          };
        };
        play = () => {
          this.handlers.progress!.forEach((handler) =>
            handler({
              activeId: this.score?.id,
              playedNotes: this.score?.content.endsWith("]6")
                ? [["C4", "E4", "G4", "B4"]]
                : [["C4"]],
            }),
          );
          setTimeout(() => {
            this.handlers.finished!.forEach((handler) => handler());
          }, 100);
        };
        setScore = (score: Score) => (this.score = score);
        pause = vi.fn();
        stop = vi.fn();
        destroy = vi.fn();
        getScore = vi.fn();
      },
    ),
  };
});

describe("ABCScoreWithPlayer", () => {
  it("Renders correctly", () => {
    const { container } = render(
      <PlayerProvider>
        <ABCScoreWithPlayer>CDEF GABc|</ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(container.querySelector(".abc-score")).toBeTruthy();
  });

  it("throws error if not used within a PlayerProvider", () => {
    assert.throws(() => {
      render(<ABCScoreWithPlayer>Content</ABCScoreWithPlayer>);
    }, "usePlayer has to be used within <PlayerProvider>");
  });

  it("Renders passed button labels", () => {
    render(
      <PlayerProvider>
        <ABCScoreWithPlayer
          playButtonLabel="Play!"
          pauseButtonLabel="Pause!"
          stopButtonLabel="Stop!"
        >
          CDEF GABc|
        </ABCScoreWithPlayer>
      </PlayerProvider>,
    );
    expect(screen.getByLabelText("Play!")).toBeTruthy();
    expect(screen.getByLabelText("Pause!")).toBeTruthy();
    expect(screen.getByLabelText("Stop!")).toBeTruthy();
  });

  it("doesn't show the time signature when showTimeSignature is false",  () => {
    const { container } = render(
      <PlayerProvider>
        <ABCScoreWithPlayer showTimeSignature={false}>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>
    );
    expect(container.querySelector(".abcjs-time-signature")).toBeFalsy();
  });  

  it("doesn't show the tempo when showTempo is false", () => {
    const { container } = render(
      <PlayerProvider>
        <ABCScoreWithPlayer showTempo={false}>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>
    );
    expect(container.querySelector(".abcjs-tempo")).toBeFalsy();
  }); 

  it("shows the piano if showPiano is true",  () => {
    const { container } = render(
      <PlayerProvider>
        <ABCScoreWithPlayer showPiano>
          T: Test Score
          CGEB
        </ABCScoreWithPlayer>
      </PlayerProvider>
    );
    expect(container.querySelector(".piano")).toBeTruthy();
  });  
});
