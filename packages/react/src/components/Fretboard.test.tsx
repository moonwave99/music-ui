import { render } from "@testing-library/react";
import { Fretboard } from "./Fretboard";

describe("Fretboard", () => {
  it("renders correctly", () => {
    const { container } = render(<Fretboard />);
    expect(container.querySelector(".fretboard")).toBeInTheDocument();
  });
});
