// @vitest-environment jsdom

import { test, expect, assert } from "vitest";
import {
  Position,
  Fretboard,
  DEFAULT_FRETBOARD_OPTIONS,
  getBounds,
} from "./Fretboard";
import { Systems } from "../fretboardSystem/systems/systems";
import { FretboardSystem } from "../fretboardSystem/FretboardSystem";
import { GUITAR_TUNINGS } from "../constants";

const {
  stringCount,
  fretCount,
  width,
  height,
  topPadding,
  bottomPadding,
  leftPadding,
  rightPadding,
  fretNumbersHeight,
} = DEFAULT_FRETBOARD_OPTIONS;

const defaultWidth = width + leftPadding + rightPadding;

const defaultHeight = height + topPadding + bottomPadding + fretNumbersHeight;

test.beforeEach(() => {
  document.body.innerHTML = '<div id="fretboard"></div>';
});

const system = new FretboardSystem();
const pentaDots = system.getScale({
  root: "G",
  type: "minor pentatonic",
  box: {
    system: Systems.pentatonic,
    box: 1,
  },
});

test("Fretboard with default options", () => {
  const fretboard = new Fretboard();
  fretboard.render();

  const svg = document.querySelector<SVGElement>("#fretboard svg")!;

  expect(svg).toBeTruthy();

  expect(svg.getAttribute("viewBox")).toBe(
    `0 0 ${defaultWidth} ${defaultHeight}`,
  );
  expect(svg.querySelectorAll(".strings line").length).toBe(stringCount);
  expect(svg.querySelectorAll(".frets line").length).toBe(fretCount + 1);
  expect(svg.querySelectorAll(".fret-numbers text").length).toBe(fretCount);
});

test("Fretboard with custom tuning - string count mismatch", () => {
  assert.throws(() => {
    new Fretboard({
      tuning: ["E2", "A2", "D2"],
    });
  }, "stringCount (6) and tuning size (3) do not match");
});

test("Fretboard with existing DOM element", () => {
  const element = document.createElement("div");
  element.id = "fretboard";
  document.body.append(element);
  const fretboard = new Fretboard({ element });
  fretboard.render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox"), `0 0 ${defaultWidth} ${defaultHeight}`);
  expect(svg.querySelectorAll(".strings line").length).toBe(stringCount);
  expect(svg.querySelectorAll(".frets line").length).toBe(fretCount + 1);
  expect(svg.querySelectorAll(".fret-numbers text").length).toBe(fretCount);
});

test("Fretboard without fret numbers", () => {
  const fretboard = new Fretboard({
    showFretNumbers: false,
  });
  fretboard.render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox")).toBe(
    `0 0 ${defaultWidth} ${defaultHeight - fretNumbersHeight}`,
  );
  expect(svg.querySelectorAll(".fret-numbers").length).toBe(0);
});

test("Fretboard with linear frets", () => {
  const fretboard = new Fretboard({
    scaleFrets: false,
  });
  fretboard.render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();

  svg
    .querySelectorAll(".frets line")
    .forEach((node, i) =>
      expect(node.getAttribute("x1")).toBe(`${(100 / fretCount) * i}%`),
    );
});

test("Fretboard with dots", () => {
  const fretboard = new Fretboard();
  fretboard.renderScale({
    root: "G2",
    type: "minor pentatonic",
    box: {
      system: Systems.pentatonic,
      box: 1,
    },
  });

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox")).toBe(
    `0 0 ${defaultWidth} ${defaultHeight}`,
  );
  expect(svg.querySelectorAll(".strings line").length).toBe(stringCount);
  expect(svg.querySelectorAll(".frets line").length).toBe(fretCount + 1);
  expect(svg.querySelectorAll(".fret-numbers text").length).toBe(fretCount);
  expect(svg.querySelectorAll(".dots .dot").length).toBe(42);
});

test("Fretboard with cropping", () => {
  const dots = system
    .getScale({
      root: "C",
      type: "minor pentatonic",
      box: {
        system: Systems.pentatonic,
        box: 1,
      },
    })
    .filter(({ inBox }) => inBox);
  new Fretboard({
    scaleFrets: false,
    fretCount: 4,
    crop: true,
  })
    .setDots(dots)
    .render();

  const svg = document.querySelector("#fretboard svg")!;
  expect(svg).toBeTruthy();
  expect(svg.getAttribute("viewBox"), `0 0 ${defaultWidth} ${defaultHeight}`);
  expect(
    Array.from(svg.querySelectorAll(".fret-numbers text")).map(
      (x) => x.innerHTML,
    ),
  ).toEqual(["8", "9", "10", "11"]);
});

test("Fretboard render twice", () => {
  const fretboard = new Fretboard();
  fretboard.setDots(pentaDots).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".dots .dot").length).toBe(pentaDots.length);
  fretboard.setDots(pentaDots).render();
  expect(svg.querySelectorAll(".dots .dot").length).toBe(pentaDots.length);
});

test("Fretboard render dot less than fret count", () => {
  const fretboard = new Fretboard({ fretCount: 12 });
  fretboard.setDots([{ fret: 11, string: 1 }]).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".dots .dot").length).toBe(1);
});

test("Fretboard render dot equal to fret count", () => {
  const fretboard = new Fretboard({ fretCount: 12 });
  fretboard.setDots([{ fret: 12, string: 1 }]).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".dots .dot").length).toBe(1);
});

test("Fretboard render dot greater than fret count", () => {
  const fretboard = new Fretboard({ fretCount: 12 });
  fretboard.setDots([{ fret: 13, string: 1 }]).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".dots .dot").length).toBe(0);
});

test("Fretboard clear", () => {
  const fretboard = new Fretboard();
  fretboard.setDots(pentaDots).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".dots .dot").length).toBe(pentaDots.length);
  fretboard.clear();
  expect(svg.querySelectorAll(".dots .dot").length).toBe(0);
});

test("Fretboard style()", () => {
  const fretboard = new Fretboard();
  fretboard.setDots(pentaDots).render();
  fretboard.style({
    filter: ({ note }) => note === "G",
    text: ({ note }) => note!,
    fill: "red",
  });

  const svg = document.querySelector("#fretboard svg")!;
  svg
    .querySelectorAll(".dots .dot-note-G .dot-text")
    .forEach((node) => expect(node.innerHTML, "G"));

  const dotNodes = svg.querySelectorAll(".dots .dot-note-G .dot-circle");
  dotNodes.forEach((node) => expect(node.getAttribute("fill"), "red"));

  expect(dotNodes.length).toBe(
    pentaDots.filter(({ note }) => note === "G").length,
  );
});

test("Fretboard style() no text", () => {
  const fretboard = new Fretboard();
  fretboard.setDots(pentaDots).render();
  fretboard.style({
    filter: ({ note }) => note === "G",
    fill: "red",
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot-note-G .dot-circle")
    .forEach((node) => expect(node.getAttribute("fill"), "red"));
});

test("Fretboard style() no filter", () => {
  const fretboard = new Fretboard();
  fretboard.setDots(pentaDots).render();
  fretboard.style({
    text: ({ note }) => note!,
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot-text")
    .forEach((node) => expect(node.innerHTML).toBeTruthy());
});

test("Fretboard muteStrings()", () => {
  const fretboard = new Fretboard();
  fretboard.render();
  fretboard.muteStrings({
    strings: [6, 1],
  });

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".muted-strings .muted-string").length).toBe(2);
});

test("Fretboard renderChord()", () => {
  const fretboard = new Fretboard();
  fretboard.renderChord("x32010");

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".muted-strings .muted-string").length).toBe(1);
  expect(svg.querySelectorAll(".dots .dot").length).toBe(3);
});

test("Fretboard renderChord() - above 9th fret", () => {
  const fretboard = new Fretboard();
  fretboard.renderChord("10-x-10-10-8-x");

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".muted-strings .muted-string").length).toBe(2);
  expect(svg.querySelectorAll(".dots .dot").length).toBe(4);
});

test("Fretboard renderChord() - barres", () => {
  const fretboard = new Fretboard();
  fretboard.renderChord("133211", { fret: 1 });

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".barres rect").length).toBe(1);
});

test("Fretboard renderChord() - multiple barres", () => {
  const fretboard = new Fretboard();
  fretboard.renderChord("x35553", [
    { fret: 3, stringFrom: 5 },
    { fret: 5, stringFrom: 4, stringTo: 2 },
  ]);

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg.querySelectorAll(".barres rect").length).toBe(2);
});

test("Fretboard renderBox()", () => {
  const fretboard = new Fretboard({
    dotText: ({ note }: Position): string => note!,
  });
  fretboard.renderBox({
    type: "minor",
    root: "E",
    box: {
      system: Systems.pentatonic,
      box: 1,
    },
  });

  const svg = document.querySelector("#fretboard svg")!;
  const dots = svg.querySelectorAll(".dots .dot");
  dots.forEach((dot) => {
    expect("EGABD".split("").includes(dot.textContent)).toBe(true);
  });
  expect(dots.length).toBe(12);
});

test("Fretboard renderBox() - custom tuning warning", () => {
  const fretboard = new Fretboard({
    tuning: GUITAR_TUNINGS.openG,
  }).renderBox({
    type: "major pentatonic",
    root: "C",
    box: {
      system: Systems.CAGED,
      box: "C",
    },
  });
  expect(fretboard instanceof Fretboard).toBe(true);
});

test("Fretboard renderScale()", () => {
  const fretboard = new Fretboard({
    dotText: ({ note }: Position): string => note!,
  });
  fretboard.renderScale({
    type: "major",
    root: "C",
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot")
    .forEach((dot) =>
      expect("CDEFGAB".split("").includes(dot.textContent)).toBe(true),
    );
});

test("Fretboard renderScale() - pentatonic", () => {
  const fretboard = new Fretboard({
    dotText: ({ note }: Position): string => note!,
  });
  fretboard.renderScale({
    type: "minor pentatonic",
    root: "E",
    box: {
      system: Systems.pentatonic,
      box: 1,
    },
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot")
    .forEach((dot) =>
      expect("EGABD".split("").includes(dot.textContent)).toBe(true),
    );
});

test("Fretboard renderScale() - CAGED", () => {
  const fretboard = new Fretboard({
    dotText: ({ note }: Position): string => note!,
  });
  fretboard.renderScale({
    type: "major pentatonic",
    root: "C",
    box: {
      system: Systems.CAGED,
      box: "C",
    },
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot")
    .forEach((dot) =>
      expect("CDEFGAB".split("").includes(dot.textContent)).toBe(true),
    );
});

test("Fretboard renderScale() - TNPS", () => {
  const fretboard = new Fretboard({
    dotText: ({ note }: Position): string => note!,
  });
  fretboard.renderScale({
    type: "major pentatonic",
    root: "C",
    box: {
      system: Systems.TNPS,
      box: 1,
    },
  });

  const svg = document.querySelector("#fretboard svg")!;

  svg
    .querySelectorAll(".dots .dot")
    .forEach((dot) =>
      expect("CDEFGAB".split("").includes(dot.textContent)).toBe(true),
    );
});

test("Fretboard renderScale() - custom tuning warning", () => {
  const fretboard = new Fretboard({
    tuning: GUITAR_TUNINGS.openG,
  }).renderScale({
    type: "major pentatonic",
    root: "C",
    box: {
      system: Systems.CAGED,
      box: "C",
    },
  });
  expect(fretboard instanceof Fretboard).toBe(true);
});

test("Fretboard event handlers", () => {
  new Fretboard()
    .render()
    .on("click", (position: Position) =>
      expect(position).toEqual({ string: 1, fret: 0, note: "E", chroma: 4 }),
    );
  const hoverDiv = document.querySelector("#fretboard .hoverDiv")!;
  hoverDiv.dispatchEvent(new MouseEvent("click"));
});

test("Fretboard add new event listener", () => {
  let count = 0;
  const handler = (): void => {
    count++;
  };
  const fretboard = new Fretboard().render().on("click", handler);
  const hoverDiv = document.querySelector("#fretboard .hoverDiv")!;
  hoverDiv.dispatchEvent(new MouseEvent("click"));
  expect(count).toBe(1);

  fretboard.on("click", () => true);
  hoverDiv.dispatchEvent(new MouseEvent("click"));
  expect(count).toBe(1);
});

test("Fretboard removeEventListeners", () => {
  let count = 0;
  const handler = (): void => {
    count++;
  };
  const fretboard = new Fretboard().render().on("click", handler);
  const hoverDiv = document.querySelector("#fretboard .hoverDiv")!;
  hoverDiv.dispatchEvent(new MouseEvent("click"));
  expect(count).toBe(1);

  fretboard.removeEventListeners();
  hoverDiv.dispatchEvent(new MouseEvent("click"));
  expect(count).toBe(1);
});

test("Fretboard removeEventListeners before adding listeners", () => {
  new Fretboard().render().removeEventListeners();
  const svg = document.querySelector("#fretboard svg")!;
  expect(svg).toBeTruthy();
});

test("Fretboard event handlers - click on dot", () => {
  new Fretboard()
    .setDots([{ string: 1, fret: 0 }])
    .render()
    .on("click", (position: Position) =>
      expect(position).toEqual({ string: 1, fret: 0, note: "E", chroma: 4 }),
    );
  const hoverDiv = document.querySelector("#fretboard .hoverDiv")!;
  hoverDiv.dispatchEvent(new MouseEvent("click"));
});

test("Fretboard with different stringWidths", () => {
  const stringWidth = [1, 2, 3, 4, 5, 6];
  const fretboard = new Fretboard({ stringWidth });
  fretboard.render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  svg
    .querySelectorAll(".strings line")
    .forEach((el, i) =>
      expect(el.getAttribute("stroke-width")).toBe(`${stringWidth[i]}`),
    );
});

test("Fretboard with custom classes (scalar)", () => {
  const fretboard = new Fretboard();
  const dots = system.getScale({
    root: "G",
    type: "minor pentatonic",
    box: {
      system: Systems.pentatonic,
      box: 1,
    },
  });
  dots[0]!.custom = true;
  dots[2]!.custom = true;
  dots[4]!.custom = true;
  fretboard.setDots(dots).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.querySelectorAll(".dots .dot-custom").length).toBe(3);
});

test("Fretboard with custom classes (array)", () => {
  const fretboard = new Fretboard();
  const dots = system.getScale({
    root: "G",
    type: "minor pentatonic",
    box: {
      system: Systems.pentatonic,
      box: 1,
    },
  });
  dots[0]!.custom = 1;
  dots[2]!.custom = [1, 2];
  dots[4]!.custom = [2];
  fretboard.setDots(dots).render();

  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.querySelectorAll(".dots .dot-custom-1").length).toBe(2);
  expect(svg.querySelectorAll(".dots .dot-custom-2").length).toBe(2);
});

test("Fretboard - highlightAreas", () => {
  const fretboard = new Fretboard();
  fretboard
    .renderScale({
      type: "major",
      root: "G",
    })
    .highlightAreas(
      [
        { string: 1, fret: 5 },
        { string: 6, fret: 2 },
      ],
      [
        { string: 1, fret: 13 },
        { string: 6, fret: 9 },
      ],
    );
  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.querySelectorAll(".highlight-areas .area").length).toBe(2);
});

test("Fretboard - clearHighlightAreas", () => {
  const fretboard = new Fretboard();
  fretboard
    .renderScale({
      type: "major",
      root: "G",
    })
    .highlightAreas(
      [
        { string: 1, fret: 5 },
        { string: 6, fret: 2 },
      ],
      [
        { string: 1, fret: 13 },
        { string: 6, fret: 9 },
      ],
    )
    .clearHighlightAreas();
  const svg = document.querySelector("#fretboard svg")!;

  expect(svg).toBeTruthy();
  expect(svg.querySelectorAll(".highlight-areas .area").length).toBe(0);
});

test("Fretboard - getBounds", () => {
  const positions = [
    { string: 3, fret: 3 },
    { string: 2, fret: 4 },
    { string: 1, fret: 3 },
  ];
  const bounds = getBounds(positions);
  expect(bounds).toEqual({
    bottomLeft: { string: 3, fret: 3 },
    bottomRight: { string: 3, fret: 4 },
    topLeft: { string: 1, fret: 3 },
    topRight: { string: 1, fret: 4 },
  });
});
