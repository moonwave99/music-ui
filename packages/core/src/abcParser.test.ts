import { describe, it, expect } from "vitest";
import { parseAbc } from "./abcParser";

describe("parser", () => {
  it("parses the input as an abc tune", () => {
    const input = `
T:Title
C:Artist
M:3/4
L:1/2
K:G
Q:99
G A B | G A B
    `;
    const output = parseAbc(input);
    expect(output).toStrictEqual({
      info: {
        title: "Title",
        composer: "Artist",
        meter: "3/4",
        unitNoteLength: "1/2",
        key: "G",
        bpm: 99,
      },
      content: `T:Title
C:Artist
M:3/4
L:1/2
K:G
Q:99
G A B | G A B`,
    });
  });

  it("parses the input as an abc tune with frontmatter info", () => {
    const input = `
+++
title: Title
composer: Artist
meter: 3/4
unitNoteLength: 1/2
key: G
bpm: 99
+++

G A B | G A B
    `;
    const output = parseAbc(input);
    expect(output).toEqual({
      info: {
        title: "Title",
        composer: "Artist",
        meter: "3/4",
        unitNoteLength: "1/2",
        key: "G",
        bpm: 99,
      },
      content: `T:Title
C:Artist
M:3/4
L:1/2
K:G
Q:99
G A B | G A B`,
    });
  });
});
