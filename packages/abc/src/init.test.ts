// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { initABCScore } from "./init";

describe("initABCScore - single element", () => {
  it("renders an abc score on the selected element", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
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

  it("renders an empty score if no content if present", () => {
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

  it("does not display the time signature if showTimeSignature is false", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score data-show-time-signature="false">
          <div class="content">
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
        element!.querySelector<HTMLElement>(".abcjs-time-signature")!,
      ).display,
    ).toBe("none");
  });

  it("does not display the time signature if it's x/1", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
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
        element!.querySelector<HTMLElement>(".abcjs-time-signature")!,
      ).display,
    ).toBe("none");
  });
});

describe("initABCScore - multiple elements", () => {
  it("renders an abc score on all elements - by selector", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
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

  it("renders an abc score on all elements - by NodeList", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore({
      selection: document.querySelectorAll<HTMLElement>("[data-abc-score]"),
    });

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
  it("renders an abc score on all elements with the passed abcOptions", () => {
    document.body.innerHTML = `
      <main>
        <div data-abc-score>
          <div class="content">
            T:Test Song 1
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
        <div data-abc-score>
          <div class="content">
            T:Test Song 2
            C E G B        
          </div>
          <div class="staff"></div>
        </div>
      </main>`;

    initABCScore({
      selection: "[data-abc-score]",
      abcOptions: { paddingleft: 30 },
    });

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
