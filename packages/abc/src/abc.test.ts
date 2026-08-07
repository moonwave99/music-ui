// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

import { initAll, initAbc } from "./abc";

describe("initAbc", () => {
  it("initializes Abc instances on the selected element", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:1
T:Test Song
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc]");

    initAbc({
      id: "1",
      staffElement: element?.querySelector(".staff") as HTMLElement,
      content: element?.querySelector(".content")?.textContent as string,
    });

    expect(element).toBeTruthy();

    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
    expect(element!.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("hides the meter if hideMeter is true", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:4
M:4/4
L:1
CEG
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc]");

    initAbc({
      id: "1",
      staffElement: element?.querySelector(".staff") as HTMLElement,
      content: element?.querySelector(".content")?.textContent as string,
      hideMeter: true,
    });

    expect(
      window.getComputedStyle(
        element?.querySelector(".abcjs-time-signature") as Element,
      ).display,
    ).toBe("none");
  });

  it("hides the meter if it's x/1", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:4
M:1/1
L:1
CEG
          </div>
          <div class="staff"></div>
          <div class="audio-controls"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc]");

    initAbc({
      id: "1",
      staffElement: element?.querySelector(".staff") as HTMLElement,
      content: element?.querySelector(".content")?.textContent as string,
    });

    expect(
      window.getComputedStyle(
        element?.querySelector(".abcjs-time-signature") as Element,
      ).display,
    ).toBe("none");
  });
});

describe("initAll", () => {
  it("initializes Abc instances on all affected elements", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:1
T:Test Song 1
C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc>
          <div class="content">
X:1
T:Test Song 2
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initAll();

    const elements = document.querySelectorAll("[data-abc]");
    expect(elements.length).toBe(2);
    elements.forEach((element, index) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        `Test Song ${index + 1}`,
      );
    });
  });
});
