import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { FileNode, FolderNode, FsNode } from "@/lib/fake-fs";

interface FileTreeProps {
  root: FolderNode;
}

/**
 * Prototype tree view. No real filesystem — context-menu actions just
 * `console.log` for now. Depth drives indentation so the layout stays
 * predictable regardless of nesting level.
 */
export function FileTree({ root }: FileTreeProps) {
  return (
    <div className="py-1 text-[13px] leading-[22px]">
      {root.children.map((child) => (
        <TreeNode key={child.name} node={child} depth={0} />
      ))}
    </div>
  );
}

function TreeNode({ node, depth }: { node: FsNode; depth: number }) {
  if (node.kind === "folder") {
    return <FolderRow node={node} depth={depth} />;
  }
  return <FileRow node={node} depth={depth} />;
}

function FolderRow({ node, depth }: { node: FolderNode; depth: number }) {
  // Open the first two levels by default so the demo shows structure at a glance.
  const [open, setOpen] = React.useState(depth < 1);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <NodeContextMenu kind="folder" name={node.name}>
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
            {open ? (
              <FolderOpen
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : (
              <Folder
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )}
            <span className="truncate">{node.name}</span>
          </button>
        </CollapsibleTrigger>
      </NodeContextMenu>

      <CollapsibleContent>
        {node.children.map((child) => (
          <TreeNode key={child.name} node={child} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FileRow({ node, depth }: { node: FileNode; depth: number }) {
  const hasNested = !!node.nested && node.nested.length > 0;
  const [open, setOpen] = React.useState(false);

  if (!hasNested) {
    return (
      <NodeContextMenu kind="file" name={node.name}>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex w-full items-center gap-1 rounded-sm px-1 outline-none",
            "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
          )}
          style={{
            paddingLeft: indentFor(depth) + 18 /* align past chevron */,
          }}
        >
          <File
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="truncate">{node.name}</span>
        </div>
      </NodeContextMenu>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <NodeContextMenu kind="file" name={node.name}>
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
            <File
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="truncate">{node.name}</span>
          </button>
        </CollapsibleTrigger>
      </NodeContextMenu>

      <CollapsibleContent>
        {node.nested!.map((child) => (
          <FileRow key={child.name} node={child} depth={depth + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

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

function NodeContextMenu({
  kind,
  name,
  children,
}: {
  kind: "file" | "folder";
  name: string;
  children: React.ReactNode;
}) {
  const log = (action: string) =>
    // eslint-disable-next-line no-console
    console.log(`[react-explorer] ${action}: ${name}`);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={menuContentClass}>
        {kind === "folder" ? (
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
        ) : (
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
    </ContextMenu>
  );
}

function indentFor(depth: number): number {
  // 12px per level feels right at 13px font size.
  return 4 + depth * 12;
}
