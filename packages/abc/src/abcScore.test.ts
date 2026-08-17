// @vitest-environment jsdom
import { vi, test, describe, it, expect, assert } from "vitest";
import userEvent from "@testing-library/user-event";
import { ABCScore } from "./abcScore";
import { extractIndentedInput } from "@music-ui/core";

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
    const content = extractIndentedInput(wrapper.querySelector(".content")!);

    new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
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
    const content = extractIndentedInput(wrapper.querySelector(".content")!);
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-container")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-cursor")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-time-signature")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("Does not display the score meter when showMeter is false", () => {
    const wrapper = document.querySelector(".score")!;
    const content = extractIndentedInput(wrapper.querySelector(".content")!);
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
      showMeter: false,
    });
    score.render();

    expect(
      wrapper.querySelector<HTMLElement>(".abcjs-time-signature")?.style
        .display,
    ).toBe("none");
  });

  it("Does not display the cursor when showCursor is false", () => {
    const wrapper = document.querySelector(".score")!;
    const content = extractIndentedInput(wrapper.querySelector(".content")!);
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
      showCursor: false,
    });
    score.render();

    expect(wrapper.querySelector(".abcjs-cursor")).toBeNull();
  });

  it("Is idempotent", () => {
    const wrapper = document.querySelector(".score")!;
    const content = extractIndentedInput(wrapper.querySelector(".content")!);
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
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

describe("ABCScore - updateCursor", () => {
  it("Updates the cursor and corresponding note selection", () => {
    const wrapper = document.querySelector(".score")!;
    const content = extractIndentedInput(wrapper.querySelector(".content")!);
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content,
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
});

describe("ABCScore - onClick handler", () => {
  it("Gets called with the position of the clicked note", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")?.textContent.trim(),
      onClick,
    });
    score.render();
    await user.click(wrapper.querySelector(".abcjs-n2")!);
    expect(onClick).toHaveBeenCalledWith({ position: "0:2:0" });
  });
});
