// @vitest-environment jsdom
import { test, describe, it, expect, assert } from "vitest";
import { ABCScore } from "./abcScore";

test.beforeEach(() => {
  document.body.innerHTML = `
<div class="score">
  <div class="content">
X:1
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
