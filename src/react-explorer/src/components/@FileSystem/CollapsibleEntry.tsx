import { useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, indentFor } from "@/lib/utils";
import { requestChildren } from "@/lib/fs-bridge";

import { EntryNode } from "./EntryNode";
import { EntryContextMenu } from "./EntryContextMenu";
import { Icon } from "./@CollapsibleEntry/Icon";

import type { Entry } from "../../../../Entry";

interface CollapsibleEntryProps {
  entry: Entry;
  depth: number;
}

// This component represents Folder or a Nesting File
export const CollapsibleEntry = ({ entry, depth }: CollapsibleEntryProps) => {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<Entry[] | null>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open && children === null) {
      // Load children lazily on first open.
      requestChildren(entry)
        .then(setChildren)
        .catch((error) => {
          console.error(
            `[CollapsibleEntry] failed to load children of ${entry.path}:`,
            error,
          );
          setChildren([]);
        });
    }
  };

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <EntryContextMenu entry={entry}>
        <div
          role="button"
          className={cn(
            "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
            "hover:bg-accent/10  focus-visible:bg-accent",
          )}
          style={{
            paddingLeft: indentFor(depth),
          }}
        >
          {entry.type === "folder" ? (
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1">
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-90",
                  )}
                  aria-hidden
                />

                <Icon
                  open={open}
                  type={entry.type}
                  extension={entry.extension}
                />

                <span className="truncate">{entry.name}</span>
              </button>
            </CollapsibleTrigger>
          ) : (
            <button className="flex items-center gap-1">
              <CollapsibleTrigger asChild>
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-90",
                  )}
                  aria-hidden
                />
              </CollapsibleTrigger>
              <Icon open={open} type={entry.type} extension={entry.extension} />

              <span className="truncate">{entry.name}</span>
            </button>
          )}
        </div>
      </EntryContextMenu>

      <CollapsibleContent>
        {children?.map((entry) => (
          <EntryNode key={entry.name} entry={entry} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

/**
 * Other alternatives
 * 
 * 
 * Option 1:
 *      <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-1 rounded-sm px-1 text-left",
              "hover:bg-accent/10 focus:outline-none focus-visible:bg-accent",
            )}
            style={{ paddingLeft: indentFor(depth) }}
          >
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
              aria-hidden
            />

            <Icon open={open} type={entry.type} extension={entry.extension} />

            <span className="truncate">{entry.name}</span>
          </button>
        </CollapsibleTrigger>
 * 
 * Option 2:
 * 
 *      <div
          role="button"
          className={cn(
            "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
            "hover:bg-accent/10  focus-visible:bg-accent",
          )}
          style={{
            paddingLeft: indentFor(depth),
          }}
        >
          {entry.type === "folder" ? (
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1">
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-90",
                  )}
                  aria-hidden
                />

                <Icon
                  open={open}
                  type={entry.type}
                  extension={entry.extension}
                />

                <span className="truncate">{entry.name}</span>
              </button>
            </CollapsibleTrigger>
          ) : (
            <button className="flex items-center gap-1">
              <CollapsibleTrigger asChild>
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-90",
                  )}
                  aria-hidden
                />
              </CollapsibleTrigger>
              <Icon open={open} type={entry.type} extension={entry.extension} />

              <span className="truncate">{entry.name}</span>
            </button>
          )}
        </div>
 */
