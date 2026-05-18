import { useEffect, useState } from "react";

import { FileSystem } from "@/components/FileSystem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSystemContextMenu } from "@/components/@FileSystem/FileSystemContextMenu";
import { requestRoots } from "@/lib/fs-bridge";
import { subscribeToFsChanged } from "@/lib/fs-events";
import { setSelectedPath } from "@/lib/selection";

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
