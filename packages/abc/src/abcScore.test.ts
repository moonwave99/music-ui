// @vitest-environment jsdom
import { vi, test, describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { ABCScore } from "./abcScore";

test.beforeEach(() => {
  document.body.innerHTML = `
<div class="score">
  <div class="content">
M:4/4
L:1/4
T:Test Song
C E G B
  </div>
  <div class="staff"></div>
</div>  
  `;
});

test.afterEach(() => {
  document.body.innerHTML = "";
});

describe("ABCScore - constructor", () => {
  it("Does not render until render() is called", () => {
    const wrapper = document.querySelector(".score")!;
    new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    expect(wrapper.querySelector(".abcjs-container")).toBeNull();
  });
  it("Throws error if selected element is not found", () => {
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("#does-not-exist")!;
      new ABCScore({ element });
    }, "Element not found");
  });
});

describe("ABCScore - render", () => {
  it("Renders with default options", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-container")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-cursor")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-time-signature")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("Does not display the score time signature when showTimeSignature is false", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      showTimeSignature: false,
    });
    score.render();
    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-time-signature")?.style
        .display,
    ).toBe("none");
  });

  it("Does not display the cursor when showCursor is false", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      showCursor: false,
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-cursor")).toBeNull();
  });

  it("Is idempotent", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-container")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
    score.render();
    expect(wrapper.querySelectorAll(".abcjs-container").length).toBe(1);
  });
});

describe("ABCScore - updatePosition", () => {
  it("Updates the cursor and corresponding note selection", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();

    score.updatePosition("0:0:0");
    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(1);
    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-current-note path")?.dataset
        .name,
    ).toBe("C");

    score.updatePosition("0:1:0");
    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(1);
    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-current-note path")?.dataset
        .name,
    ).toBe("E");
  });

  it("Updates the cursor and corresponding note selection - free tempo", () => {
    document.body.innerHTML = `
      <div class="score">
        <div class="content">
      M:1/1
      L:1/1
      T:Test Song
      C E G B
        </div>
        <div class="staff"></div>
      </div>
      `;
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();

    score.updatePosition("0:0:0");
    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(1);
    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-current-note path")?.dataset
        .name,
    ).toBe("C");

    score.updatePosition("1:0:0");
    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(1);
    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-current-note path")?.dataset
        .name,
    ).toBe("E");
  });

  it("Does nothing if there is no note at the passed position", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();

    score.updatePosition("0:4:0");

    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(0);
  });

  it("Does nothing if showCursor is false", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      showCursor: false,
    });
    score.render();

    score.updatePosition("0:1:0");

    expect(wrapper.querySelectorAll(".abcjs-current-note").length).toBe(0);
  });
});

describe("ABCScore - clearSelection", () => {
  it("Clears the current note selection", async () => {
    const user = userEvent.setup();
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
    });
    score.render();

    await user.click(wrapper.querySelector(".abcjs-n2")!);

    expect(
      wrapper
        .querySelector(".abcjs-n2")
        ?.classList.contains("abcjs-note_selected"),
    ).toBeTruthy();

    score.clearSelection();

    expect(
      wrapper
        .querySelector(".abcjs-n2")
        ?.classList.contains("abcjs-note_selected"),
    ).not.toBeTruthy();
  });
});

describe("ABCScore - onClick handler", () => {
  it("Gets called with the position of the clicked note", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      onClick,
    });
    score.render();
    await user.click(wrapper.querySelector(".abcjs-n2")!);
    expect(onClick).toHaveBeenCalledWith({ position: "0:2:0" });
  });

  it("Gets called with the position of the clicked note - free tempo", async () => {
    document.body.innerHTML = `
      <div class="score">
        <div class="content">
          T: Test Song
          M: 1/1
          L: 1/1
          C E G B | D F A c
        </div>
        <div class="staff"></div>
      </div>
  `;

    const user = userEvent.setup();
    const onClick = vi.fn();
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      onClick,
    });
    score.render();
    await user.click(wrapper.querySelector(".abcjs-mm0.abcjs-n2")!);
    expect(onClick).toHaveBeenCalledWith({ position: "2:0:0" });

    await user.click(wrapper.querySelector(".abcjs-mm1.abcjs-n2")!);
    expect(onClick).toHaveBeenCalledWith({ position: "6:0:0" });
  });
});

describe("ABCScore - highlightBars", () => {
  it("does not create the highlight bar box if highlightBars is false", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      highlightBars: false,
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-bar-box")).toBe(null);
  });

  it("does create the highlight bar box if highlightBars is true", () => {
    document.body.innerHTML = `
      <div class="score">
        <div class="content">
          M:4/4
          L:1/4
          V:V1 clef=treble
          V:V2 clef=bass      
          [V:V1] CDEF|CDEF|
          [V:V2] CDEF|CDEF|
        </div>
        <div class="staff"></div>
      </div>  
  `;
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")!.textContent,
      highlightBars: true,
    });
    score.render();

    const barBox = wrapper.querySelector<SVGRectElement>(".abcjs-bar-box")!;
    expect(barBox).not.toBe(null);
    ["x", "y", "width", "height"].forEach((x) =>
      expect(barBox.getAttribute(x)).toBe(null),
    );

    score.highlightBar("5:0:0");
    ["x", "y", "width", "height"].forEach((x) =>
      expect(barBox.getAttribute(x)).toBe(null),
    );

    score.highlightBar("1:0:0");
    ["x", "y", "width", "height"].forEach((x) =>
      // because the getBBox mock implementation returns 0,0,0,0
      expect(barBox.getAttribute(x)).toBe("0"),
    );

    score.highlightBar("0:0:0");
    ["x", "y", "width", "height"].forEach((x) =>
      // because the getBBox mock implementation returns 0,0,0,0
      expect(barBox.getAttribute(x)).toBe("0"),
    );
  });
});
