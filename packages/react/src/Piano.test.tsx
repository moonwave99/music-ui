import { render } from "@testing-library/react";
import { Piano } from "./Piano";

describe("Piano", () => {
  it("renders correctly", async () => {
    const { container } = render(<Piano />);
    expect(container.querySelector(".piano")).toBeTruthy();
  });

  it("renders with the passed class", async () => {
    const { container } = render(<Piano className="my-piano" />);
    expect(container.querySelector(".my-piano")).toBeTruthy();
  });

  it("highlights the passed notes", async () => {
    const notes = ["C4", "E4", "G4"];
    const { container } = render(<Piano notes={notes} />);
    notes.forEach((note) =>
      expect(container.querySelector(`.note-with-octave-${note}`)).toBeTruthy(),
    );
  });

  it("sets the played notes", async () => {
    const notes = ["C4", "E4", "G4"];
    const playedNotes = ["C4", "E4"];
    const { container } = render(
      <Piano notes={notes} playedNotes={playedNotes} />,
    );
    playedNotes.forEach((note) =>
      expect(container.querySelector(`.note-with-octave-${note}`)).toHaveClass(
        "key-played",
      ),
    );
  });

  it("displays the note labels", async () => {
    const notes = ["C4", "E4", "G4"];
    const noteLabels = ["1", "3", "5"];
    const { container } = render(
      <Piano notes={notes} noteLabels={noteLabels} />,
    );
    notes.forEach((note, index) =>
      expect(
        container.querySelector(`.note-with-octave-${note}`),
      ).toHaveTextContent(noteLabels[index] as string),
    );
  });
});
