import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type ReactNode,
} from "react";

import { cn, indentFor } from "@/lib/utils";
import { useActiveEditorPath } from "@/lib/active-editor";
import { useExplorerFocused } from "@/lib/explorer-focus";
import { setSelectedPath, useIsSelected } from "@/lib/selection";

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

interface SelectableRowProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "ref"
> {
  path: string;
  depth: number;
  selectionState?: SelectionState;
  focusState?: FocusState;
  isContextTarget?: boolean;
  isActiveEditor?: boolean;
  onSelect: () => void;
  collapsible?: boolean;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  ref?: Ref<HTMLDivElement>;
}

export const SelectableRow = ({
  path,
  depth,
  selectionState: selectionStateProp,
  focusState: focusStateProp,
  isContextTarget = false,
  isActiveEditor: isActiveEditorProp,
  onSelect,
  collapsible = false,
  children,
  onClick,
  onKeyDown,
  ref: forwardedRef,
  ...props
}: SelectableRowProps) => {
  const activePath = useActiveEditorPath();
  const isSelected = useIsSelected(path);
  const explorerFocused = useExplorerFocused();
  const ref = useRef<HTMLDivElement>(null);

  const selectionState: SelectionState =
    selectionStateProp ?? (isSelected ? "selected" : "unselected");
  const focusState: FocusState =
    focusStateProp ?? (explorerFocused ? "focused" : "inactive");
  const isActiveEditor = isActiveEditorProp ?? activePath === path;

  const handleSelect = () => {
    setSelectedPath(path);
    onSelect();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  const extraPaddingLeft = collapsible ? 18 : 0;

  useEffect(() => {
    if (isActiveEditor) {
      setSelectedPath(path);
      ref.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [isActiveEditor, path]);

  return (
    <div
      {...props}
      ref={(node) => {
        ref.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleSelect();
        }
      }}
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
        paddingLeft: indentFor(depth) + extraPaddingLeft,
      }}
    >
      {children}
    </div>
  );
};
