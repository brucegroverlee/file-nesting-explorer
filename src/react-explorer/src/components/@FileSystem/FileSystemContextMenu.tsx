import {
  ContextMenu as UIContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { requestExecuteCommand } from "@/lib/fs-bridge";
import { cn } from "@/lib/utils";

import type { PropsWithChildren, ReactNode } from "react";

/*
 * VS Code exposes menu-specific theme tokens (documented under "menu*"
 * color contributions). Using them directly here makes our context menu
 * look like VS Code's own menus on any theme the user has installed.
 *
 * Kept in sync with `EntryContextMenu.tsx` — if you tweak the look there,
 * update it here too (or extract the constants into a shared module).
 *
 * See: https://code.visualstudio.com/api/references/theme-color#menu-bar-colors
 */
const menuContentClass = cn(
  "bg-[var(--vscode-menu-background)]",
  "text-[var(--vscode-menu-foreground)]",
  "border-[var(--vscode-menu-border,var(--vscode-widget-border,transparent))]",
  "p-0.5",
);

const menuItemClass = cn(
  "data-[highlighted]:!bg-[var(--vscode-menu-selectionBackground)]",
  "data-[highlighted]:!text-[var(--vscode-menu-selectionForeground)]",
  "text-[10px] px-1.5 py-1",
);

const menuShortcutClass = "text-[10px]";

const menuSeparatorClass = cn(
  "!bg-[var(--vscode-menu-separatorBackground,var(--vscode-widget-border))]",
  "my-0.5",
);

/**
 * Commands available from the empty-area (root) context menu. None of these
 * carry an entry: the underlying `fileNestingExplorer.*` handlers fall back
 * to the workspace root when called without one.
 */
export type FileSystemCommand =
  | "fileNestingExplorer.newFile"
  | "fileNestingExplorer.newFolder"
  | "fileNestingExplorer.paste"
  | "fileNestingExplorer.refresh";

type MenuItem = {
  command: FileSystemCommand;
  label: string;
  shortcut?: string;
};

/**
 * Groups follow the same convention as `EntryContextMenu`: separators only
 * appear between non-empty groups, mirroring the `group1`…`groupN` layout
 * declared under `view/title` in `package.json`.
 */
const GROUPS: MenuItem[][] = [
  [
    { command: "fileNestingExplorer.newFile", label: "New File…" },
    { command: "fileNestingExplorer.newFolder", label: "New Folder…" },
  ],
  [{ command: "fileNestingExplorer.paste", label: "Paste", shortcut: "⌘V" }],
  [{ command: "fileNestingExplorer.refresh", label: "Refresh" }],
];

type FileSystemContextMenuProps = PropsWithChildren & {
  onOpenChange?: (open: boolean) => void;
  onCommand?: (command: FileSystemCommand) => void;
};

const renderItem = (
  item: MenuItem,
  onSelect: (command: FileSystemCommand) => void,
) => (
  <ContextMenuItem
    key={item.command}
    onSelect={() => onSelect(item.command)}
    className={menuItemClass}
  >
    {item.label}
    {item.shortcut && (
      <ContextMenuShortcut className={menuShortcutClass}>
        {item.shortcut}
      </ContextMenuShortcut>
    )}
  </ContextMenuItem>
);

export const FileSystemContextMenu = ({
  children,
  onOpenChange,
  onCommand,
}: FileSystemContextMenuProps) => {
  const handleSelect = (command: FileSystemCommand) => {
    if (onCommand) {
      onCommand(command);
      return;
    }
    // Root-level commands don't carry an `entry`; the host's
    // `fileNestingExplorer.*` handlers default to the workspace root.
    requestExecuteCommand(command);
  };

  const groups = GROUPS.filter((group) => group.length > 0);
  const nodes: ReactNode[] = [];
  groups.forEach((group, index) => {
    if (index > 0) {
      nodes.push(
        <ContextMenuSeparator
          key={`sep-${index}`}
          className={menuSeparatorClass}
        />,
      );
    }
    group.forEach((item) => nodes.push(renderItem(item, handleSelect)));
  });

  return (
    <UIContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={menuContentClass}>
        {nodes}
      </ContextMenuContent>
    </UIContextMenu>
  );
};
