import { useEffect, useRef, type KeyboardEvent } from "react";
import { File } from "lucide-react";

import { cn, indentFor } from "@/lib/utils";
import { requestOpenEditor } from "@/lib/fs-bridge";
import { useActiveEditorPath } from "@/lib/active-editor";

import { EntryContextMenu } from "./EntryContextMenu";

import type { Entry } from "../../../../Entry";

interface FileEntryProps {
  entry: Entry;
  depth: number;
}

export const FileEntry = ({ entry, depth }: FileEntryProps) => {
  const activePath = useActiveEditorPath();
  const isActive = activePath === entry.path;
  const ref = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    requestOpenEditor(entry);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      requestOpenEditor(entry);
    }
  };

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [isActive]);

  return (
    <EntryContextMenu entry={entry}>
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
          "hover:bg-accent/10 focus-visible:bg-accent",
          isActive && "bg-accent/20",
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
