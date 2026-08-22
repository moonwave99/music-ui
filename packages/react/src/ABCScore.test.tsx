import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { ABCScore } from "./ABCScore";

describe("ABCScore", () => {
  it("renders correctly", () => {
    const { container } = render(
      <ABCScore>
        T: Test Score
        CGEB
      </ABCScore>
    );
    expect(container.querySelector(".abc-score")).toBeTruthy();
  });

  it("doesn't show the time signature when showTimeSignature is false",  () => {
    const { container } = render(
      <ABCScore showTimeSignature={false}>
        T: Test Score
        CGEB
      </ABCScore>
    );
    expect(container.querySelector(".abcjs-time-signature")).toBeFalsy();
  });  

  it("doesn't show the tempo when showTempo is false", () => {
    const { container } = render(
      <ABCScore showTempo={false}>
        T: Test Score
        CGEB
      </ABCScore>
    );
    expect(container.querySelector(".abcjs-tempo")).toBeFalsy();
  });  
});
