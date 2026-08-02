import { useRef, type ReactNode, ReactElement } from "react";
import { useAbc, type UseAbcParams } from "./useAbc";
import { type ImperativePiano } from "./usePiano";
import { Piano } from "./Piano";

export type ScoreProps = Omit<UseAbcParams, "content"> & {
  children: ReactNode;
  className?: string;
  showPiano?: boolean;
};

export function Score({
  className = "score",
  children,
  showPiano = false,
  ...params
}: ScoreProps): ReactElement {
  const content = getNodeText(children);
  const pianoRef = useRef<ImperativePiano>(null);
  const { staffRef, audioControlsRef } = useAbc({
    ...params,
    content,
    onNotesChange: (notes: string[]) => {
      pianoRef.current?.setNotes(notes);
    },
  });

  return (
    <div className={className}>
      <div ref={staffRef}></div>
      <div ref={audioControlsRef}></div>
      {showPiano ? <Piano imperativeRef={pianoRef} /> : null}
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
