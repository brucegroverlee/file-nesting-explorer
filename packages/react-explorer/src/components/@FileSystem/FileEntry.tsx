import { useState, type KeyboardEvent } from "react";

import { requestExecuteCommand, requestOpenEditor } from "@/lib/fs-bridge";
import { ENTRY_BINDINGS, matchShortcut } from "@/lib/shortcuts";
import { MaterialIcon } from "@/components/MaterialIcon";

import { EntryContextMenu } from "./EntryContextMenu";
import {
  SelectableRow,
  type FocusState,
  type SelectionState,
} from "./SelectableRow";

import type { Entry } from "@file-nesting/shared";

export type { SelectionState, FocusState };

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
  const [contextOpen, setContextOpen] = useState(false);
  const isContextTarget = isContextTargetProp ?? contextOpen;

  const handleSelect = () => {
    // Mirror VS Code's explorer: single click opens the file in preview
    // mode. The extension-side `openEditor` command decides preview vs
    // permanent based on click timing (same path within ~1s → permanent),
    // so the double-click handler below just fires a second call.
    requestOpenEditor(entry);
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
      <SelectableRow
        path={entry.path}
        depth={depth}
        collapsible
        selectionState={selectionStateProp}
        focusState={focusStateProp}
        isContextTarget={isContextTarget}
        isActiveEditor={isActiveEditorProp}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
      >
        <MaterialIcon name={entry.name} type="file" />
        <span className="truncate">{entry.name}</span>
      </SelectableRow>
    </EntryContextMenu>
  );
};
