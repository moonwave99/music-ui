// @vitest-environment jsdom
import { vi, describe, it, expect } from "vitest";

// @ts-expect-error the class mock is sufficient even if ts complains
vi.mock(import("abcjs"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original.default,
    synth: {
      ...original.default.synth,
      SynthController: vi.fn(
        class {
          load = vi.fn();
          setTune = vi.fn();
        },
      ),
      CreateSynth: vi.fn(
        class {
          init = vi.fn();
        },
      ),
    },
  };
});

import { initAll, initAbc } from "./abc";

describe("initAbc", () => {
  it("initializes Abc instances on the selected element", async () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:1
T:Test Song
C E G B        
          </div>
          <div class="staff"></div>
          <div class="audio-controls"></div>
        </div>
      </main>`;

    const element = document.querySelector("[data-abc]");

    await initAbc({
      id: "1",
      staffElement: element?.querySelector(".staff") as HTMLElement,
      audioControlsElement: element?.querySelector(
        ".audio-controls",
      ) as HTMLElement,
      content: element?.querySelector(".content")?.textContent as string,
    });

    expect(element).toBeTruthy();

    expect(element!.querySelector(".abcjs-container")).not.toBeNull();
    expect(element!.querySelector(".abcjs-title")?.textContent).toBe(
      `Test Song`,
    );
  });

  it("hides the meter if it's x/1", async () => {
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

    await initAbc({
      id: "1",
      staffElement: element?.querySelector(".staff") as HTMLElement,
      audioControlsElement: element?.querySelector(
        ".audio-controls",
      ) as HTMLElement,
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
  it("initializes Abc instances on all affected elements", async () => {
    document.body.innerHTML = `
      <main>
        <div data-abc>
          <div class="content">
X:1
T:Test Song 1
C E G B        
          </div>
          <div class="staff"></div>
          <div class="audio-controls"></div>
        </div>
        <div data-abc>
          <div class="content">
X:1
T:Test Song 2
C E G B        
          </div>
          <div class="staff"></div>
          <div class="audio-controls"></div>
        </div>
      </main>`;

    await initAll();

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
