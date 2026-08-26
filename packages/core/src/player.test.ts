// @vitest-environment jsdom
import { describe, it, expect, vi, assert } from "vitest";
import { Player, BPM_RANGE } from "./player";
import { getAbcScore } from "./utils";
import { getMockedPlayerParams } from "./test/mocks";

describe("Player - constructor", () => {
  it("Creates a new player with default options", () => {
    const player = new Player(getMockedPlayerParams());
    expect(player.getScore()).toBe(null);
  });
});

describe("Player - events", () => {
  it("Listens to the player events", async () => {
    const mockedParams = getMockedPlayerParams();
    const player = new Player(mockedParams);

    const onProgress = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();
    const onFinished = vi.fn();

    player.on("progress", onProgress);
    player.on("pause", onPause);
    player.on("stop", onStop);
    player.on("finished", onFinished);

    const input = [
      ["C", "F"],
      ["D", "E"],
      ["E", "D"],
      ["F", "C"],
    ];
    const score = getAbcScore({
      id: "1",
      input: `
L:1/4
V:V1 clef=treble
V:V2 clef=bass      
[V:V1] CDEF
[V:V2] F,E,D,C,
      `,
    });
    player.setScore(score);

    await player.play();
    player.pause();

    mockedParams.transport.playUntilEnd();

    player.stop();

    expect(onPause).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
    expect(onFinished).toHaveBeenCalled();

    input.forEach(([a, b], index) => {
      expect(onProgress).toHaveBeenCalledWith({
        activeId: "1",
        voice: 1,
        playedNotes: [[`${a}4`], [`${b}3`]],
        position: `0:${index}:0`,
      });
    });
  });
});

describe("Player - play", () => {
  it("Does nothing if no parts are present", async () => {
    const player = new Player(getMockedPlayerParams());
    const onProgress = vi.fn();
    player.on("progress", onProgress);
    await player.play();
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe("Player - setScore", () => {
  it("Sets the current score", () => {
    const player = new Player(getMockedPlayerParams());
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    expect(player.getScore()).toEqual(score);
    player.setScore(null);
    expect(player.getScore()).toEqual(null);
  });

  it("Does not recompute the parts if the new score has the same hash as the current one", () => {
    const player = new Player(getMockedPlayerParams());
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    expect(player.getScore()).toEqual(score);
    player.setScore({ ...score });
    expect(player.getScore()).toEqual(score);
  });
});

describe("Player - setBpm", () => {
  it("Sets the playback bpm", () => {
    const mockedParams = getMockedPlayerParams();
    const player = new Player(mockedParams);
    player.setBpm(99);
    expect(mockedParams.transport.bpm.value).toBe(99);
  });

  it("Throws error if new value is out of range", () => {
    const mockedParams = getMockedPlayerParams();
    const player = new Player(mockedParams);

    assert.throws(() => {
      player.setBpm(BPM_RANGE[0] - 1);
    }, `Value must be in the ${BPM_RANGE} range`);

    expect(mockedParams.transport.bpm.value).toBe(120);

    assert.throws(() => {
      player.setBpm(BPM_RANGE[1] + 1);
    }, `Value must be in the ${BPM_RANGE} range`);

    expect(mockedParams.transport.bpm.value).toBe(120);
  });

  it("Does not recompute the parts if the new score has the same hash as the current one", () => {
    const player = new Player(getMockedPlayerParams());
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    expect(player.getScore()).toEqual(score);
    player.setScore({ ...score });
    expect(player.getScore()).toEqual(score);
  });
});

describe("Player - destroy", () => {
  it("Removes all listeners, clears all parts and scheduled events", async () => {
    const player = new Player(getMockedPlayerParams());
    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    const onProgress = vi.fn();
    player.on("progress", onProgress);
    player.destroy();
    await player.play();
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe("Player - seek", () => {
  it("Seeks to the passed position", async () => {
    const player = new Player(getMockedPlayerParams());

    const onProgress = vi.fn();
    player.on("progress", onProgress);

    const score = getAbcScore({
      id: "1",
      input: "CDEF",
    });
    player.setScore(score);
    player.seekTo("0:1:0");
    await player.play();

    expect(onProgress).toHaveBeenCalledWith({
      activeId: "1",
      playedNotes: [["D4"]],
      position: "0:1:0",
      voice: 0,
    });
  });
});
