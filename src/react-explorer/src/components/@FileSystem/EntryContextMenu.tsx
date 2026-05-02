import {
  ContextMenu as UIContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

import type { PropsWithChildren } from "react";
import type { Entry } from "../../../../Entry";

/*
 * VS Code exposes menu-specific theme tokens (documented under "menu*"
 * color contributions). Using them directly here makes our context menu
 * look like VS Code's own menus on any theme the user has installed —
 * the shadcn `--popover` tokens are generic and don't track custom themes.
 *
 * See: https://code.visualstudio.com/api/references/theme-color#menu-bar-colors
 */
const menuContentClass = cn(
  "bg-[var(--vscode-menu-background)]",
  "text-[var(--vscode-menu-foreground)]",
  "border-[var(--vscode-menu-border,var(--vscode-widget-border,transparent))]",
);

// Override shadcn's `focus:bg-accent focus:text-accent-foreground` via
// Radix's `data-highlighted` attribute (set while an item is focused by
// keyboard or pointer). `!` forces it past the item's own utilities.
const menuItemClass = cn(
  "data-[highlighted]:!bg-[var(--vscode-menu-selectionBackground)]",
  "data-[highlighted]:!text-[var(--vscode-menu-selectionForeground)]",
);

const menuSeparatorClass =
  "!bg-[var(--vscode-menu-separatorBackground,var(--vscode-widget-border))]";

type EntryContextMenuProps = PropsWithChildren & {
  entry: Entry;
};

export const EntryContextMenu = ({
  entry,
  children,
}: EntryContextMenuProps) => {
  const log = (action: string) =>
    // eslint-disable-next-line no-console
    console.log(`[react-explorer] ${action}: ${entry.name}`);

  return (
    <UIContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className={menuContentClass}>
        {entry.type === "folder" && (
          <>
            <ContextMenuItem
              className={menuItemClass}
              onSelect={() => log("New File")}
            >
              New File…
            </ContextMenuItem>
            <ContextMenuItem
              className={menuItemClass}
              onSelect={() => log("New Folder")}
            >
              New Folder…
            </ContextMenuItem>
            <ContextMenuSeparator className={menuSeparatorClass} />
          </>
        )}

        {entry.isNesting && (
          <>
            <ContextMenuItem
              className={menuItemClass}
              onSelect={() => log("New Nested File")}
            >
              New Nested File…
            </ContextMenuItem>
            <ContextMenuItem
              className={menuItemClass}
              onSelect={() => log("New Nested Folder")}
            >
              New Nested Folder…
            </ContextMenuItem>
            <ContextMenuSeparator className={menuSeparatorClass} />
          </>
        )}

        <ContextMenuItem className={menuItemClass} onSelect={() => log("Copy")}>
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem className={menuItemClass} onSelect={() => log("Cut")}>
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          className={menuItemClass}
          onSelect={() => log("Paste")}
        >
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator className={menuSeparatorClass} />
        <ContextMenuItem
          className={menuItemClass}
          onSelect={() => log("Rename")}
        >
          Rename…
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => log("Delete")}
          className={cn(
            menuItemClass,
            "text-[var(--vscode-errorForeground)]",
            "data-[highlighted]:!text-[var(--vscode-menu-selectionForeground)]",
          )}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </UIContextMenu>
  );
};
