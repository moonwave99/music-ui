import { describe, it, expect, assert } from "vitest";
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
        timeSignature: [3, 4],
        unitNoteLength: "1/2",
        key: "G",
        bpm: 99,
      },
      content: `T:Title
C:Artist
K:G
M:3/4
L:1/2
Q:99
G A B | G A B`,
    });
  });

  it("throws error if the time signature is not in the right format", () => {
    const input = `
T:Title
C:Artist
M:3,4
L:1/2
K:G
Q:99
G A B | G A B
    `;

    assert.throws(
      () => parseAbc(input),
      "M field should be in N/M format, received 3,4 instead",
    );
  });

  it("throws error if the unit note length is not in the right format", () => {
    const input = `
T:Title
C:Artist
M:3/4
L:1,2
K:G
Q:99
G A B | G A B
    `;

    assert.throws(
      () => parseAbc(input),
      "L field should be in N/M format, received 1,2 instead",
    );
  });
});
