// @vitest-environment jsdom
import { describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/dom";
import { initABCScoreWithPlayer } from "./initWithPlayer";

import { Player, getMockedPlayerParams } from "@music-ui/core";

describe("initABCScoreWithPlayer", () => {
  it("renders an abc score with player on selection", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({
      selection: element,
      player,
    });

    expect(element.querySelectorAll(".controls > button").length).toBe(3);

    const playButton =
      element.querySelector<HTMLButtonElement>(".play-button")!;
    const pauseButton =
      element.querySelector<HTMLButtonElement>(".pause-button")!;
    const stopButton =
      element.querySelector<HTMLButtonElement>(".stop-button")!;

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeTruthy();

    await user.click(playButton);

    expect(playButton.disabled).toBeTruthy();
    expect(pauseButton.disabled).toBeFalsy();
    expect(stopButton.disabled).toBeFalsy();

    await user.click(pauseButton);

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeFalsy();

    await user.click(playButton);
    await user.click(stopButton);

    expect(playButton.disabled).toBeFalsy();
    expect(pauseButton.disabled).toBeTruthy();
    expect(stopButton.disabled).toBeTruthy();
  });

  it("renders an abc score with player and piano on selection", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-show-piano>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({
      selection: element,
      player,
    });

    expect(element.querySelector(".piano")).not.toBe(null);
  });

  it("Throws error if no player is passed", () => {
    assert.throws(() => {
      initABCScoreWithPlayer({ player: null as unknown as Player });
    }, "You must pass a Player instance");
  });

  it("Throws error if no staff element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="controls"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player(getMockedPlayerParams());
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "staffElement not found inside element with id: 1");
  });

  it("Throws error if no content element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player(getMockedPlayerParams());
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "contentElement not found inside element with id: 1");
  });

  it("Throws error if no controls element is found", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
      const player = new Player(getMockedPlayerParams());
      initABCScoreWithPlayer({
        selection: element,
        player,
      });
    }, "controlsElement not found inside element with id: 1");
  });

  it("resets status if another score is playing", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2 
            D F A c        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>        
      </main>`;

    const elements =
      document.querySelectorAll<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({ selection: elements, player });

    const firstPlayButton =
      elements[0]!.querySelector<HTMLButtonElement>(".play-button")!;
    const secondPlayButton =
      elements[1]!.querySelector<HTMLButtonElement>(".play-button")!;

    expect(firstPlayButton.disabled).toBe(false);
    expect(secondPlayButton.disabled).toBe(false);

    await user.click(firstPlayButton);
    expect(firstPlayButton.disabled).toBe(true);
    expect(secondPlayButton.disabled).toBe(false);

    await user.click(secondPlayButton);
    expect(firstPlayButton.disabled).toBe(false);
    expect(secondPlayButton.disabled).toBe(true);
  });

  it("updates position on click", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song
            C E G B | D F A C
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({
      selection: element,
      player,
    });

    const playButton =
      element.querySelector<HTMLButtonElement>(".play-button")!;
    let targetNote = element.querySelector(".abcjs-m1.abcjs-n1")!;

    await user.click(targetNote);

    expect(targetNote.classList).toContain("abcjs-note_selected");
    expect(mockedPlayedParams.transport.position).toBe("0:0:0");

    await user.click(playButton);
    expect(mockedPlayedParams.transport.position).toBe("0:1:0");

    targetNote = element.querySelector(".abcjs-m1.abcjs-n2")!;
    await user.click(targetNote);

    expect(targetNote.classList).toContain("abcjs-note_selected");
    expect(mockedPlayedParams.transport.position).toBe("1:1:0");
  });

  it("highlights bars on progress when highlightBars is true", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-highlight-bars>
          <div class="content">
            T:Test Song
            C E G B | D F A C
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
      </main>`;

    const element = document.querySelector<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({
      selection: element,
      player,
    });

    const playButton =
      element.querySelector<HTMLButtonElement>(".play-button")!;

    const barBox = element.querySelector<SVGRectElement>(".abcjs-bar-box")!;
    expect(barBox).not.toBe(null);
    ["x", "y", "width", "height"].forEach((x) =>
      expect(barBox.getAttribute(x)).toBe(null),
    );
    await user.click(playButton);
    ["x", "y", "width", "height"].forEach((x) =>
      // because the getBBox mock implementation returns 0,0,0,0
      expect(barBox.getAttribute(x)).toBe("0"),
    );
  });

  it("handles tempo change", async () => {
    const user = userEvent.setup();
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            Q:110
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2 
            Q:125
            D F A c        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>        
      </main>`;

    const elements =
      document.querySelectorAll<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({ selection: elements, player });

    const firstTempoControls = elements[0]!.querySelector(".tempo-control")!;
    const secondTempoControls = elements[1]!.querySelector(".tempo-control")!;

    expect(firstTempoControls.querySelector("output")!.value).toBe("110");
    expect(secondTempoControls.querySelector("output")!.value).toBe("125");

    fireEvent.change(firstTempoControls.querySelector("input")!, {
      target: { value: 99 },
    });

    expect(firstTempoControls.querySelector("output")!.value).toBe("99");
    expect(secondTempoControls.querySelector("output")!.value).toBe("125");

    await user.click(firstTempoControls.querySelector("button")!);

    expect(firstTempoControls.querySelector("output")!.value).toBe("110");
    expect(secondTempoControls.querySelector("output")!.value).toBe("125");
  });

  it("does not show tempo controls when showTempoControls is false or on free tempo scores", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-show-tempo-controls="false">
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>        
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            M:1/1
            L:1/1
            C E G B        
          </div>
          <div class="staff"></div>
          <div class="controls"></div>
        </div>    
      </main>`;

    const elements =
      document.querySelectorAll<HTMLElement>("[data-abc-score]")!;
    const mockedPlayedParams = getMockedPlayerParams();
    const player = new Player(mockedPlayedParams);

    initABCScoreWithPlayer({ selection: elements, player });

    elements.forEach((element) =>
      expect(element.querySelector(".tempo-control")).toBe(null),
    );
  });
});
