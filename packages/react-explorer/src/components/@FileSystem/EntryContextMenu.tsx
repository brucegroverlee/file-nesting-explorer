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
import type { Entry, EntryCommand } from "@file-nesting/shared";

/*
 * VS Code exposes menu-specific theme tokens (documented under "menu*"
 * color contributions). Using them directly here makes our context menu
 * look like VS Code's own menus on any theme the user has installed —
 * the shadcn `--popover` tokens are generic and don't track custom themes.
 *
 * See: https://code.visualstudio.com/api/references/theme-color#menu-bar-colors
 */
// Shrinks the shadcn defaults by 2px on both font size and inner padding so
// the menu reads at VS Code's denser scale. `cn` uses `tailwind-merge`, so
// these utilities win over the ones declared in `ui/context-menu.tsx`.
const menuContentClass = cn(
  "bg-[var(--vscode-menu-background)]",
  "text-[var(--vscode-menu-foreground)]",
  "border-[var(--vscode-menu-border,var(--vscode-widget-border,transparent))]",
  "p-0.5", // was p-1 (4px → 2px)
);

// Override shadcn's `focus:bg-accent focus:text-accent-foreground` via
// Radix's `data-highlighted` attribute (set while an item is focused by
// keyboard or pointer). `!` forces it past the item's own utilities.
const menuItemClass = cn(
  "data-[highlighted]:!bg-[var(--vscode-menu-selectionBackground)]",
  "data-[highlighted]:!text-[var(--vscode-menu-selectionForeground)]",
  "text-[10px] px-1.5 py-1", // font: text-sm 14 → text-xs 12 → 10px
);

const menuShortcutClass = "text-[10px] pl-1.5"; // shadcn default is text-xs 12 → 10 → 8

const menuSeparatorClass = cn(
  "!bg-[var(--vscode-menu-separatorBackground,var(--vscode-widget-border))]",
  "my-0.5", // was my-1 (4px → 2px)
);

/**
 * Mirrors the `viewItem` context value computed by `FileNestingDataProvider`
 * (see `src/FileNestingDataProvider.ts`). Driving the menu off this discrete
 * union keeps the React shell in sync with the VS Code `view/item/context`
 * `when` clauses declared in `package.json`.
 */
export type EntryKind =
  | "folder"
  | "file"
  | "file_with_nesting_extension"
  | "nesting_file";

type EntryContextMenuProps = PropsWithChildren & {
  entry: Entry;
  /**
   * Overrides the kind inferred from the entry. Useful for stories and for
   * callers that know an extension supports nesting before the user has
   * created any nested children (i.e. `file_with_nesting_extension`).
   */
  kind?: EntryKind;
  onOpenChange?: (open: boolean) => void;
  onCommand?: (command: EntryCommand, entry: Entry) => void;
};

/**
 * Default kind inference. `file_with_nesting_extension` cannot be detected
 * from the `Entry` alone (it depends on the user's `fileNestingExtensions`
 * config), so callers that have that information must pass `kind` explicitly.
 */
const inferKind = (entry: Entry): EntryKind => {
  if (entry.type === "folder") return "folder";
  if (entry.isNesting) return "nesting_file";
  return "file";
};

type MenuItem = {
  command: EntryCommand;
  label: string;
  shortcut?: string;
  /** Renders the item with VS Code's error foreground (used for Delete). */
  danger?: boolean;
};

const NEW_FILE_FOLDER: MenuItem[] = [
  { command: "fileNestingExplorer.newFile", label: "New File…" },
  { command: "fileNestingExplorer.newFolder", label: "New Folder…" },
];

const NEW_NESTED: MenuItem[] = [
  { command: "fileNestingExplorer.newNestedFile", label: "New Nested File…" },
  {
    command: "fileNestingExplorer.newNestedFolder",
    label: "New Nested Folder…",
  },
];

const CLIPBOARD: MenuItem[] = [
  { command: "fileNestingExplorer.cut", label: "Cut", shortcut: "⌘X" },
  { command: "fileNestingExplorer.copy", label: "Copy", shortcut: "⌘C" },
  { command: "fileNestingExplorer.paste", label: "Paste", shortcut: "⌘V" },
];

const COPY_PATHS: MenuItem[] = [
  {
    command: "fileNestingExplorer.copyPath",
    label: "Copy Path",
    shortcut: "⌥⌘C",
  },
  {
    command: "fileNestingExplorer.copyRelativePath",
    label: "Copy Relative Path",
    shortcut: "⇧⌥⌘C",
  },
];

const MOVE: MenuItem[] = [
  { command: "fileNestingExplorer.moveUp", label: "Move Up" },
  { command: "fileNestingExplorer.moveDown", label: "Move Down" },
];

const SORTING: MenuItem[] = [
  {
    command: "fileNestingExplorer.restoreSortingAlphabetically",
    label: "Restore Sorting Alphabetically",
  },
  {
    command: "fileNestingExplorer.editSortingFile",
    label: "Edit Sorting File",
  },
];

/**
 * Builds the per-kind menu, group by group, following the `group1`…`group8`
 * ordering declared under `view/item/context` in `package.json`.
 */
const buildGroups = (kind: EntryKind): MenuItem[][] => {
  const isFolder = kind === "folder";
  const canCreateNested =
    kind === "file_with_nesting_extension" || kind === "nesting_file";
  const isNesting = kind === "nesting_file";
  const isFileWithNestingExt = kind === "file_with_nesting_extension";

  const group1: MenuItem[] = [
    ...(isFolder ? NEW_FILE_FOLDER : []),
    ...(canCreateNested ? NEW_NESTED : []),
  ];

  const group2: MenuItem[] = isFileWithNestingExt
    ? [
        {
          command: "fileNestingExplorer.createFileNestingContainer",
          label: "Enable Nested Files",
        },
      ]
    : [];

  /* const group3: MenuItem[] = [
    {
      command: "fileNestingExplorer.openDocumentation",
      label: "See React File Nesting Documentation",
    },
  ]; */

  const group4: MenuItem[] = isFolder
    ? [
        {
          command: "fileNestingExplorer.findInFolder",
          label: "Find in Folder…",
        },
      ]
    : [];

  const group5 = CLIPBOARD;
  const group6 = COPY_PATHS;

  const group7: MenuItem[] = [
    ...MOVE,
    ...(isFolder || isNesting ? SORTING : []),
  ];

  const group8: MenuItem[] = [
    {
      command: "fileNestingExplorer.delete",
      label: "Delete",
      shortcut: "⌘⌫",
      danger: true,
    },
    ...(isNesting
      ? [
          {
            command: "fileNestingExplorer.deleteFileNestingContainer" as const,
            label: "Delete Nested Files / Remove Expand Icon",
            danger: true,
          },
        ]
      : []),
    { command: "fileNestingExplorer.rename", label: "Rename", shortcut: "F2" },
  ];

  return [group1, group2, /* group3, */ group4, group5, group6, group7, group8];
};

const renderItem = (
  item: MenuItem,
  onSelect: (command: EntryCommand) => void,
) => (
  <ContextMenuItem
    key={item.command}
    onSelect={() => onSelect(item.command)}
    className={cn(
      menuItemClass,
      item.danger &&
        cn(
          "text-[var(--vscode-errorForeground)]",
          "data-[highlighted]:!text-[var(--vscode-menu-selectionForeground)]",
        ),
    )}
  >
    {item.label}
    {item.shortcut && (
      <ContextMenuShortcut className={menuShortcutClass}>
        {item.shortcut}
      </ContextMenuShortcut>
    )}
  </ContextMenuItem>
);

export const EntryContextMenu = ({
  entry,
  kind,
  children,
  onOpenChange,
  onCommand,
}: EntryContextMenuProps) => {
  const resolvedKind = kind ?? inferKind(entry);

  const handleSelect = (command: EntryCommand) => {
    if (onCommand) {
      onCommand(command, entry);
      return;
    }
    // Default: forward the selection to the extension host, which dispatches
    // the matching `fileNestingExplorer.*` command (see
    // `ReactExplorerViewProvider`).
    requestExecuteCommand(command, entry);
  };

  const groups = buildGroups(resolvedKind).filter((group) => group.length > 0);

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
