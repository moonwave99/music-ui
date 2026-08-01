import { type ReactNode, ReactElement } from "react";
import { useAbc, type UseAbcParams } from "./useAbc";

export type AbcProps = Omit<UseAbcParams, "content"> & {
  children: ReactNode;
  className?: string;
};

export function Abc({ className, children, ...params }: AbcProps): ReactElement {
  const content = getNodeText(children);
  const { staffRef, audioControlsRef } = useAbc({ ...params, content });
  return (
    <div className={className}>
      <div ref={staffRef}></div>
      <div ref={audioControlsRef}></div>
    </div>
  );
}

function getNodeText(node: ReactNode): string {
  if (node === null) {
    return "";
  }
  switch (typeof node) {
    case "string":
    case "number":
      return node.toString();
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
