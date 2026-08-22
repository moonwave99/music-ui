import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Piano } from "./Piano";
import type { ImperativePiano } from "./usePiano";

describe("Piano", () => {
  it("renders correctly", () => {
    const { container } = render(<Piano />);
    expect(container.querySelector(".piano")).toBeTruthy();
  });

  it("renders with the passed class", () => {
    const { container } = render(<Piano className="my-piano" />);
    expect(container.querySelector(".my-piano")).toBeTruthy();
  });

  it("highlights the passed notes", () => {
    const notes = ["C4", "E4", "G4"];
    const { container } = render(<Piano notes={notes} />);
    notes.forEach((note) =>
      expect(container.querySelector(`.note-with-octave-${note}`)).toBeTruthy(),
    );
  });

  it("sets the played notes", () => {
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

  it("displays the note labels", () => {
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

  it("displays the note labels with multiple voices", () => {
    const notes = "C4 E4, G4 B4";
    const noteLabels = "1 3, _ 7";
    const { container } = render(
      <Piano notes={notes} noteLabels={noteLabels} />,
    );
    notes
      .replace(",", "")
      .split(" ")
      .forEach((note, index) => {
        const label = noteLabels.replace(",", "").split(" ")[index] as string;
        expect(
          container.querySelector(`.note-with-octave-${note}`),
        ).toHaveTextContent(label === "_" ? "" : label);
      });
  });

  it("updates the notes via the imperative handle", async () => {
    const user = userEvent.setup();

    const notes = ["C3", "G3", "C4", "G4"];
    const { container } = render(<ImperativeWrapper notes={notes} />);
    await user.click(screen.getByRole("button", { name: "Set notes" }));

    notes.forEach((note) =>
      expect(container.querySelector(`.note-with-octave-${note}`)).toHaveClass(
        "key-on",
      ),
    );

    await user.click(screen.getByRole("button", { name: "Clear notes" }));

    notes.forEach((note) =>
      expect(
        container.querySelector(`.note-with-octave-${note}`),
      ).not.toHaveClass("key-on"),
    );
  });
});

function ImperativeWrapper({ notes }: { notes: string[] }) {
  const ref = useRef<ImperativePiano>(null);
  return (
    <>
      <Piano imperativeRef={ref} />
      <button onClick={() => ref.current?.setNotes(notes)}>Set notes</button>
      <button onClick={() => ref.current?.clearNotes()}>Clear notes</button>
    </>
  );
}
