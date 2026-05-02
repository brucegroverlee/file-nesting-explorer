import { useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, indentFor } from "@/lib/utils";

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
  const [children, setChildren] = useState<Entry[]>(null);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);

    if (open && children === null) {
      // Load children when opening for the first time
      // TODO: Implement actual loading logic
      setChildren([]);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <EntryContextMenu entry={entry}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-1 rounded-sm px-1 text-left",
              "hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:bg-accent",
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
      </EntryContextMenu>

      <CollapsibleContent>
        {children?.map((entry) => (
          <EntryNode key={entry.name} entry={entry} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};
