import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { cn, indentFor } from "@/lib/utils";
import { requestOpenEditor } from "@/lib/fs-bridge";
import { useActiveEditorPath } from "@/lib/active-editor";
import { useIsSelected, setSelectedPath } from "@/lib/selection";
import { useExplorerFocused } from "@/lib/explorer-focus";
import { MaterialIcon } from "@/components/MaterialIcon";

import { EntryContextMenu } from "./EntryContextMenu";

import type { Entry } from "../../../../Entry";

/**
 * Visual state model for an entry row. Two orthogonal axes plus two
 * independent flags, mirroring VS Code's own list rendering:
 *
 *   selectionState
 *     - "unselected":   row is not the selected one.
 *     - "selected":     row is the explorer's current selection.
 *
 *   focusState (only meaningful when selectionState === "selected")
 *     - "focused":      explorer (webview) owns keyboard focus → blue bg.
 *     - "inactive":     focus is elsewhere → grey bg.
 *
 *   isContextTarget   row owns the currently open context menu. Painted
 *                     as a blue outline; coexists with another row being
 *                     `selected`+`inactive`.
 *
 *   isActiveEditor    row's file is the active text editor. Independent
 *                     from selection.
 */
export type SelectionState = "unselected" | "selected";
export type FocusState = "focused" | "inactive";

interface FileEntryProps {
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

export const FileEntry = ({
  entry,
  depth,
  selectionState: selectionStateProp,
  focusState: focusStateProp,
  isContextTarget: isContextTargetProp,
  isActiveEditor: isActiveEditorProp,
}: FileEntryProps) => {
  const activePath = useActiveEditorPath();
  const isSelected = useIsSelected(entry.path);
  const explorerFocused = useExplorerFocused();
  const [contextOpen, setContextOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectionState: SelectionState =
    selectionStateProp ?? (isSelected ? "selected" : "unselected");
  const focusState: FocusState =
    focusStateProp ?? (explorerFocused ? "focused" : "inactive");
  const isContextTarget = isContextTargetProp ?? contextOpen;
  const isActiveEditor = isActiveEditorProp ?? activePath === entry.path;

  const handleSelect = (event?: MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation();
    setSelectedPath(entry.path);
    // Mirror VS Code's explorer: single click opens the file in preview
    // mode. The extension-side `openEditor` command decides preview vs
    // permanent based on click timing (same path within ~1s → permanent),
    // so the double-click handler below just fires a second call.
    requestOpenEditor(entry);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  useEffect(() => {
    if (isActiveEditor) {
      setSelectedPath(entry.path);
      ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [isActiveEditor]);

  return (
    <EntryContextMenu
      entry={entry}
      onOpenChange={(open) => {
        setContextOpen(open);
        // VS Code does NOT move the selection on right-click: the clicked
        // row only becomes the context target (blue outline) while the
        // previously selected row keeps its selection.
      }}
    >
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        // onDoubleClick={handleOpen}
        onKeyDown={handleKeyDown}
        data-selection-state={selectionState}
        data-focus-state={focusState}
        data-context-target={isContextTarget || undefined}
        data-active-editor={isActiveEditor || undefined}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
          // hover (only really visible when not selected)
          "hover:bg-[var(--vscode-list-hoverBackground)] hover:text-[var(--vscode-list-hoverForeground)]",
          // selected + explorer focused → blue active selection + focus outline
          selectionState === "selected" &&
            focusState === "focused" &&
            "bg-[var(--vscode-list-activeSelectionBackground)] text-[var(--vscode-list-activeSelectionForeground)] outline outline-1 -outline-offset-1 outline-[var(--vscode-list-focusOutline)] hover:bg-[var(--vscode-list-activeSelectionBackground)] hover:text-[var(--vscode-list-activeSelectionForeground)]",
          // selected + explorer not focused → grey inactive selection
          selectionState === "selected" &&
            focusState === "inactive" &&
            "bg-[var(--vscode-list-inactiveSelectionBackground)] text-[var(--vscode-list-inactiveSelectionForeground)] hover:bg-[var(--vscode-list-inactiveSelectionBackground)] hover:text-[var(--vscode-list-inactiveSelectionForeground)]",
          // context menu open on this row → blue outline (border)
          isContextTarget &&
            "outline outline-1 -outline-offset-1 outline-[var(--vscode-list-focusOutline)]",
        )}
        style={{
          paddingLeft: indentFor(depth) + 18 /* align past chevron */,
        }}
      >
        <MaterialIcon name={entry.name} type="file" />
        <span className="truncate">{entry.name}</span>
      </div>
    </EntryContextMenu>
  );
};
