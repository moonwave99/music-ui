// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

import { initABCScore } from "./init";

describe("initABCScore - single element", () => {
  it("initializes Abc instances on the selected element", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(element).toBeTruthy();

    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
    expect(element!.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("initializes an empty staff if no content if present", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(element).toBeTruthy();
    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
  });

  it("hides the meter if showMeter is false", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-show-meter="false">
          <div class="content">
X:4
M:4/4
L:1
CEG
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(
      window.getComputedStyle(
        element?.querySelector(".abcjs-time-signature") as Element,
      ).display,
    ).toBe("none");
  });

  it("hides the meter if it's x/1", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
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

    const element = document.querySelector("[data-abc-score]");

    initABCScore();

    expect(
      window.getComputedStyle(
        element?.querySelector(".abcjs-time-signature") as Element,
      ).display,
    ).toBe("none");
  });
});

describe("initABCScore - multiple elements", () => {
  it("initializes Abc instances on all affected elements", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 1
C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 2
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore();

    const elements = document.querySelectorAll("[data-abc-score]");
    expect(elements.length).toBe(2);
    elements.forEach((element, index) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        `Test Song ${index + 1}`,
      );
    });
  });

  it("initializes Abc instances on all passed elements", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 1
C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 2
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore(document.querySelectorAll<HTMLElement>("[data-abc-score]"));

    const elements = document.querySelectorAll("[data-abc-score]");
    expect(elements.length).toBe(2);
    elements.forEach((element, index) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        `Test Song ${index + 1}`,
      );
    });
  });
});

describe("initABCScore - abcOptions", () => {
  it("initializes Abc instances on all affected elements", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 1
C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
X:1
T:Test Song 2
C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore("[data-abc-score]", { paddingleft: 30 });

    const elements = document.querySelectorAll("[data-abc-score]");

    elements.forEach((element) => {
      expect(
        element
          .querySelector(".abcjs-staff path")
          ?.getAttribute("d")
          ?.startsWith("M 30"),
      ).toBe(true);
    });
  });
});
