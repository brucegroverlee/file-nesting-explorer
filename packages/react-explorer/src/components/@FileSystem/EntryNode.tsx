import { FileEntry } from "./FileEntry";
import { CollapsibleEntry } from "./CollapsibleEntry";

import type { Entry } from "@file-nesting/shared";

interface EntryNodeProps {
  entry: Entry;
  depth?: number;
}

export const EntryNode = ({ entry, depth = 0 }: EntryNodeProps) => {
  if (entry.type === "folder" || entry.isNesting) {
    return <CollapsibleEntry entry={entry} depth={depth} />;
  }

  return <FileEntry entry={entry} depth={depth} />;
};
