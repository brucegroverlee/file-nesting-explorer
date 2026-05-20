import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  requestChildren,
  requestExecuteCommand,
  requestOpenEditor,
} from "@/lib/fs-bridge";
import { ENTRY_BINDINGS, matchShortcut } from "@/lib/shortcuts";
import { subscribeToActiveAncestors } from "@/lib/active-editor";
import { subscribeToFsChanged } from "@/lib/fs-events";

import { EntryNode } from "./EntryNode";
import { EntryContextMenu } from "./EntryContextMenu";
import {
  SelectableRow,
  type FocusState,
  type SelectionState,
} from "./SelectableRow";
import { Icon } from "./@CollapsibleEntry/Icon";

import type { Entry } from "@file-nesting/shared";

interface CollapsibleEntryProps {
  entry: Entry;
  depth: number;
  /** Override the store-derived selection state (useful for Storybook). */
  selectionState?: SelectionState;
  /** Override the store-derived focus state (useful for Storybook). */
  focusState?: FocusState;
  /** Override the local context-menu state (useful for Storybook). */
  isContextTarget?: boolean;
  /** Override the active-editor flag (useful for Storybook). */
  isActiveEditor?: boolean;
}

// This component represents Folder or a Nesting File
export const CollapsibleEntry = ({
  entry,
  depth,
  selectionState: selectionStateProp,
  focusState: focusStateProp,
  isContextTarget: isContextTargetProp,
  isActiveEditor: isActiveEditorProp,
}: CollapsibleEntryProps) => {
  // Once a branch has been opened (by the user or by the active-editor
  // reveal), keep it open until the user explicitly collapses it. This
  // mirrors VS Code's tree-view, where switching to another file does not
  // collapse previously-revealed ancestors.
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<Entry[] | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const isContextTarget = isContextTargetProp ?? contextOpen;

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

  const reloadChildren = () => {
    requestChildren(entry)
      .then(setChildren)
      .catch((error) => {
        console.error(
          `[CollapsibleEntry] failed to reload children of ${entry.path}:`,
          error,
        );
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

  // Refresh already-loaded children whenever the workspace filesystem
  // changes, so create/rename/delete events are reflected without the user
  // having to collapse and re-expand the branch.
  useEffect(() => {
    return subscribeToFsChanged(() => {
      setChildren((current) => {
        if (current === null) {
          return current;
        }
        reloadChildren();
        return current;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.path]);

  // VS Code's behavior:
  //   - Folder row: a click selects the folder AND toggles its expansion.
  //   - Nesting file row: a click selects the entry and opens the editor;
  //     only the chevron toggles the expansion.
  const handleSelect = () => {
    if (entry.type === "folder") {
      handleOpenChange(!open);
    } else {
      requestOpenEditor(entry);
    }
  };

  // For nesting files, the chevron is its own toggle. Stop propagation so
  // the SelectableRow's onClick doesn't also fire (which would open the
  // editor at the same time).
  const handleChevronClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  // Row-scoped shortcuts (only fire while this row owns keyboard focus).
  // We `preventDefault` + `stopPropagation` so the App-level window listener
  // doesn't double-dispatch.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const command = matchShortcut(event, ENTRY_BINDINGS);
    if (!command) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    requestExecuteCommand(command, entry);
  };

  const chevron = (
    <ChevronRight
      className={cn(
        "size-3.5 shrink-0 text-muted-foreground transition-transform",
        open && "rotate-90",
      )}
      aria-hidden
    />
  );

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <EntryContextMenu
        entry={entry}
        onOpenChange={(open) => {
          setContextOpen(open);
          // VS Code does NOT move the selection on right-click: the clicked
          // row only becomes the context target (blue outline) while the
          // previously selected row keeps its selection.
        }}
      >
        <SelectableRow
          path={entry.path}
          depth={depth}
          selectionState={selectionStateProp}
          focusState={focusStateProp}
          isContextTarget={isContextTarget}
          isActiveEditor={isActiveEditorProp}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
        >
          {entry.type === "folder" ? (
            <>
              {chevron}
              <Icon open={open} type={entry.type} name={entry.name} />
              <span className="truncate">{entry.name}</span>
            </>
          ) : (
            <>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  onClick={handleChevronClick}
                  className="flex items-center"
                  aria-label={open ? "Collapse" : "Expand"}
                >
                  {chevron}
                </button>
              </CollapsibleTrigger>
              <Icon open={open} type={entry.type} name={entry.name} />
              <span className="truncate">{entry.name}</span>
            </>
          )}
        </SelectableRow>
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

            <Icon open={open} type={entry.type} name={entry.name} />

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
                  name={entry.name}
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
              <Icon open={open} type={entry.type} name={entry.name} />

              <span className="truncate">{entry.name}</span>
            </button>
          )}
        </div>
 */
