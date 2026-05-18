import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import type { PropsWithChildren } from "react";

export const FileSystemContextMenu = ({ children }: PropsWithChildren) => {
  const log = (action: string) =>
    console.log(`[FileSystemContextMenu] ${action}`);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={() => log("New File")}>
          New File…
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => log("New Folder")}>
          New Folder…
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => log("Paste")}>
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
