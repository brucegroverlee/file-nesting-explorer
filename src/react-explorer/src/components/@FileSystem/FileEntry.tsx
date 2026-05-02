import { File } from "lucide-react";

import { cn, indentFor } from "@/lib/utils";

import { EntryContextMenu } from "./EntryContextMenu";

import type { Entry } from "../../../../Entry";

interface FileEntryProps {
  entry: Entry;
  depth: number;
}

export const FileEntry = ({ entry, depth }: FileEntryProps) => {
  return (
    <EntryContextMenu entry={entry}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
          "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
        )}
        style={{
          paddingLeft: indentFor(depth) + 18 /* align past chevron */,
        }}
      >
        <File className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{entry.name}</span>
      </div>
    </EntryContextMenu>
  );
};
