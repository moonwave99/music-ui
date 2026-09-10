import { render, screen } from "@testing-library/react";
import { Scale } from "./Scale";
import { DEFAULT_COLORS } from "@music-ui/fretboard";

describe("Scale", () => {
  it("renders correctly", () => {
    const { container } = render(<Scale root="C" type="major" />);
    expect(container.querySelector(".scale")).toBeInTheDocument();
  });

  it("displays the label if showName is true", () => {
    const { container } = render(<Scale root="C" type="major" showName />);
    expect(container.querySelector(".scale")).toBeInTheDocument();
    expect(screen.queryByText("C major")).toBeInTheDocument();
  });

  it("highlights the roots if highlightRoots is true", () => {
    const { container } = render(
      <Scale root="C" type="major" highlightRoots />,
    );
    expect(container.querySelector(".scale")).toBeInTheDocument();
    container
      .querySelectorAll(".position-note-C circle")
      .forEach((position) =>
        expect(position.getAttribute("fill")).toBe(
          DEFAULT_COLORS.highlightFill,
        ),
      );
  });
});
