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

import { initAll } from "./abc";

describe("initAll", () => {
  it("initializes Abc instances on all affected elements", async () => {
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

    await initAll();

    const elements = document.querySelectorAll("[data-abc]");
    expect(elements.length).toBe(1);
    elements.forEach((element) => {
      expect(element.querySelector(".abcjs-container")).not.toBeNull();
      expect(element.querySelector(".abcjs-title")?.textContent).toBe(
        "Test Song",
      );
    });
  });
});
