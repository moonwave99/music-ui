import { render, screen } from "@testing-library/react";
import { Fretboard } from "./Fretboard";

describe("Fretboard", () => {
  it("renders correctly", () => {
    const { container } = render(<Fretboard />);
    expect(container.querySelector(".fretboard")).toBeInTheDocument();
  });

  it("renders the passed positions", () => {
    const { container } = render(
      <Fretboard
        positions={[
          { string: 5, fret: 3, note: "C" },
          { string: 4, fret: 2, note: "E" },
        ]}
      />,
    );
    expect(container.querySelector(".fretboard")).toBeInTheDocument();
    expect(container.querySelector(".position-id-s5-f3")).toBeInTheDocument();
    expect(container.querySelector(".position-id-s4-f2")).toBeInTheDocument();
  });

  it("shows the note names if textProperty is note", () => {
    const { container } = render(
      <Fretboard
        textProperty="note"
        positions={[
          { string: 5, fret: 3, note: "C" },
          { string: 4, fret: 2, note: "E" },
        ]}
      />,
    );
    expect(container.querySelector(".fretboard")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeVisible();
    expect(screen.queryByText("E")).toBeVisible();
  });

  it("shows the positions of the passed chordVoicing", () => {
    const { container } = render(
      <Fretboard
        textProperty="note"
        chordVoicing={{
          root: "C",
          type: "drop3",
          string: 6,
          quality: "maj7",
          inversion: 0,
        }}
      />,
    );
    expect(container.querySelector(".fretboard")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeVisible();
    expect(screen.queryByText("E")).toBeVisible();
    expect(screen.queryByText("G")).toBeVisible();
    expect(screen.queryByText("B")).toBeVisible();
  });

  it("highlights the passed areas", () => {
    const { container } = render(
      <Fretboard
        highlightAreas={[
          [
            { string: 6, fret: 1 },
            { string: 1, fret: 3 },
          ],
        ]}
      />,
    );
    expect(container.querySelectorAll(".highlight-areas .area")).toHaveLength(
      1,
    );
  });
});
