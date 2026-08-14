// @vitest-environment jsdom
import { test, describe, it, expect, assert } from "vitest";
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
  it("Renders with default options", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")?.textContent.trim(),
    });
    score.render();
    expect(wrapper.querySelector(".abcjs-container")).not.toBeNull();
    expect(wrapper.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("Throws error if selected element is not found", () => {
    assert.throws(() => {
      const element = document.querySelector<HTMLElement>("#does-not-exist")!;
      new ABCScore({ element });
    }, "Element not found");
  });
});

describe("ABCScore - updateCursor", () => {
  it("Updates the cursor and corresponding note selection", () => {
    const wrapper = document.querySelector(".score")!;
    const score = new ABCScore({
      element: wrapper.querySelector(".staff")!,
      content: wrapper.querySelector(".content")?.textContent.trim(),
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
