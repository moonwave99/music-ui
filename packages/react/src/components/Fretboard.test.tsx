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

  it("shows the note names if showNoteNames is true", () => {
    const { container } = render(
      <Fretboard
        showNoteNames
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
});
