// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { Player } from "./player";
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

    const input = "CDEF";

    const score = getAbcScore({
      id: "1",
      input,
    });
    player.setScore(score);

    await player.play();
    player.pause();

    mockedParams.transport.playUntilEnd();

    player.stop();

    expect(onPause).toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
    expect(onFinished).toHaveBeenCalled();

    input.split("").forEach((x) => {
      expect(onProgress).toHaveBeenCalledWith({
        activeId: "1",
        voice: 0,
        playedNotes: [[`${x}4`]],
        position: `0:0:0`,
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
