import { useEffect, useState } from "react";

import { FileSystem } from "@/components/FileSystem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSystemContextMenu } from "@/components/@FileSystem/FileSystemContextMenu";
import { requestExecuteCommand, requestRoots } from "@/lib/fs-bridge";
import { subscribeToFsChanged } from "@/lib/fs-events";
import { setSelectedPath } from "@/lib/selection";
import {
  FILESYSTEM_BINDINGS,
  isEditableTarget,
  matchShortcut,
} from "@/lib/shortcuts";

import type { Entry } from "../../Entry";

function App() {
  const [roots, setRoots] = useState<Entry[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoots = () => {
      requestRoots()
        .then((entries) => {
          if (!cancelled) {
            setRoots(entries);
          }
        })
        .catch((error) => {
          console.error("[App] failed to load workspace roots:", error);
          if (!cancelled) {
            setRoots([]);
          }
        });
    };

    loadRoots();
    const unsubscribe = subscribeToFsChanged(loadRoots);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Filesystem-level shortcuts (e.g. ⌘V Paste at the workspace root). A
  // window listener catches the keydown after focused-row handlers have had
  // a chance to consume it: rows call `preventDefault` + `stopPropagation`
  // when they match a binding, so we skip events flagged as defaultPrevented
  // (= a row handled it) or originating from editable elements.
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }
      const command = matchShortcut(event, FILESYSTEM_BINDINGS);
      if (!command) {
        return;
      }
      event.preventDefault();
      requestExecuteCommand(command);
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  return (
    <div id="react-explorer-root" className="flex h-full flex-col">
      <FileSystemContextMenu>
        <ScrollArea
          className="flex-1"
          onClick={() => {
            console.log("ScrollArea clicked");
            setSelectedPath(null);
          }}
        >
          <FileSystem entries={roots ?? []} />
        </ScrollArea>
      </FileSystemContextMenu>
    </div>
  );
}

export default App;
