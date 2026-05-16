/**
 * Subscribes the webview to filesystem-change notifications pushed by the
 * extension host (`ReactExplorerViewProvider`). The extension forwards the
 * same `onDidChangeTreeData` signal that drives the native TreeView, so
 * components only have to re-fetch the data they currently render.
 */

type FsChangedMessage = { type: "fsChanged" };

const listeners = new Set<() => void>();
let installed = false;

function install() {
  if (installed || typeof window === "undefined") {
    return;
  }

  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as FsChangedMessage | undefined;
    if (!data || data.type !== "fsChanged") {
      return;
    }
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error("[fs-events] listener threw:", error);
      }
    });
  });

  installed = true;
}

export function subscribeToFsChanged(listener: () => void): () => void {
  install();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
