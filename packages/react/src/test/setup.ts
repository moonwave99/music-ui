import "@testing-library/jest-dom";

if (typeof SVGElement !== "undefined") {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    configurable: true,
    value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  });
}
