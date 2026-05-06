import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, indentFor } from "@/lib/utils";
import { requestChildren } from "@/lib/fs-bridge";
import { subscribeToActiveAncestors } from "@/lib/active-editor";

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
  // Once a branch has been opened (by the user or by the active-editor
  // reveal), keep it open until the user explicitly collapses it. This
  // mirrors VS Code's tree-view, where switching to another file does not
  // collapse previously-revealed ancestors.
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<Entry[] | null>(null);

  const loadChildrenIfNeeded = () => {
    setChildren((current) => {
      if (current !== null) {
        return current;
      }
      requestChildren(entry)
        .then(setChildren)
        .catch((error) => {
          console.error(
            `[CollapsibleEntry] failed to load children of ${entry.path}:`,
            error,
          );
          setChildren([]);
        });
      return current;
    });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      loadChildrenIfNeeded();
    }
  };

  // Subscribe to the active-editor ancestor set. When this entry becomes an
  // ancestor of the active file, open it persistently and load its children.
  // setState here is inside the subscription callback (the lint-approved
  // pattern for syncing external state into React state).
  useEffect(() => {
    return subscribeToActiveAncestors((ancestors) => {
      if (ancestors.has(entry.path)) {
        setOpen(true);
        loadChildrenIfNeeded();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.path]);

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
