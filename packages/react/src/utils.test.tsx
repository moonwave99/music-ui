import { type ReactNode } from "react";
import { getNodeText } from "./utils";

describe("getNodeText", () => {
  it("returns the text of a React node", () => {
    expect(getNodeText(null)).toBe("");
    expect(getNodeText("hello")).toBe("hello");
    expect(getNodeText("”hello”")).toBe(`"hello"`);
    expect(getNodeText(99)).toBe("99");
    expect(getNodeText(true)).toBe("");
    expect(getNodeText(false)).toBe("");
    expect(getNodeText({} as ReactNode)).toBe("");
    expect(getNodeText((() => {}) as unknown as ReactNode)).toBe("");
    expect(getNodeText([99, "hello", false])).toBe("99hello");
    expect(getNodeText(<div>hello</div>)).toBe("hello");
  });
});
