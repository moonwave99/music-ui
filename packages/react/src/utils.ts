import { ReactNode } from "react";

export function getNodeText(node: ReactNode): string {
  if (!node) {
    return "";
  }
  switch (typeof node) {
    case "string":
    case "number":
      return replaceEntities(node.toString());
    case "boolean":
      return "";
    case "object": {
      if (Array.isArray(node)) {
        return node.map(getNodeText).join("");
      }
      if (!("props" in node)) {
        return "";
      }
      return getNodeText((node.props as { children?: ReactNode })?.children);
    }
    default:
      console.warn("Unresolved `node` of type:", typeof node, node);
      return "";
  }
}

function replaceEntities(input: string) {
  return Object.entries(replaceMap).reduce(
    (memo, [key, value]) => memo.replaceAll(key, value),
    input,
  );
}

const replaceMap = {
  "”": '"',
  "“": '"',
  "’": "'",
} as const;
