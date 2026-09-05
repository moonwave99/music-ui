import { render, screen } from "@testing-library/react";
import { Chord } from "./Chord";

describe("Chord", () => {
  it("renders correctly", () => {
    const input = "x32010";
    const { container } = render(<Chord input={input} chordName="C major" />);
    expect(container.querySelector(".chord")).toBeInTheDocument();
    expect(screen.getByText("C major")).toBeVisible();

    input
      .split("")
      .reverse()
      .forEach((fret, i) => {
        const position = container.querySelector(
          `.position-id-s${i + 1}-f${fret}`,
        );
        if (fret === "x" || fret === "0") {
          expect(position).not.toBeInTheDocument();
          return;
        }
        expect(position).toBeInTheDocument();
      });
  });

  it("does not display the label if showName is false", () => {
    const { container } = render(
      <Chord input="x32010" chordName="C major" showName={false} />,
    );
    expect(container.querySelector(".chord")).toBeInTheDocument();
    expect(screen.queryByText("C major")).not.toBeInTheDocument();
  });

  it("displays the open strings positions if showOpenStrings is true", () => {
    const input = "x32010";
    const { container } = render(
      <Chord input={input} chordName="C major" showOpenStrings />,
    );
    expect(container.querySelector(".chord")).toBeInTheDocument();
    expect(screen.getByText("C major")).toBeVisible();

    input
      .split("")
      .reverse()
      .forEach((fret, i) => {
        const position = container.querySelector(
          `.position-id-s${i + 1}-f${fret}`,
        );
        if (fret === "x") {
          expect(position).not.toBeInTheDocument();
          return;
        }
        expect(position).toBeInTheDocument();
      });
  });
});
