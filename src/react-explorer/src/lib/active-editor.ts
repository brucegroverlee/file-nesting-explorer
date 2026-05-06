/**
 * Tracks the path of the currently active text editor in the host VS Code
 * window. The extension pushes `activeEditorChanged` messages to the webview
 * and we expose a tiny subscribable store + React hook for components to
 * react to it.
 */

import { useSyncExternalStore } from "react";

import { getVsCodeApi } from "./vscode";

type ActiveEditorMessage = {
  type: "activeEditorChanged";
  path: string | null;
  ancestors?: string[];
};

let activePath: string | null = null;
let activeAncestors: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
let installed = false;

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const v of a) {
    if (!b.has(v)) {
      return false;
    }
  }
  return true;
}

function install() {
  if (installed || typeof window === "undefined") {
    return;
  }

  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as ActiveEditorMessage | undefined;
    if (!data || data.type !== "activeEditorChanged") {
      return;
    }

    console.debug("[active-editor] received", data.path, data.ancestors);

    const nextPath = data.path ?? null;
    const nextAncestors = new Set<string>(data.ancestors ?? []);

    if (nextPath === activePath && sameSet(nextAncestors, activeAncestors)) {
      return;
    }

    activePath = nextPath;
    activeAncestors = nextAncestors;
    listeners.forEach((fn) => fn());
  });

  installed = true;

  // Ask the extension for the current active editor in case it was already
  // active before our message listener was installed.
  const api = getVsCodeApi();
  if (api) {
    api.postMessage({ id: -1, type: "getActiveEditor" });
  }
}

function subscribe(listener: () => void): () => void {
  install();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getPathSnapshot(): string | null {
  return activePath;
}

export function useActiveEditorPath(): string | null {
  return useSyncExternalStore(subscribe, getPathSnapshot, getPathSnapshot);
}

/**
 * Returns true when `path` is one of the ancestors of the currently active
 * editor's file (per `fileNestingSystem.getParent`). Used by collapsible
 * entries to auto-expand themselves so the active file becomes visible.
 */
export function useIsActiveAncestor(path: string): boolean {
  const getSnapshot = () => activeAncestors.has(path);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribes to changes in the ancestor set; the listener is called every
 * time the active editor's ancestor chain changes. Returns the unsubscribe
 * function. Suitable for triggering one-shot side effects (like persistently
 * opening a tree branch) without going through React state.
 */
export function subscribeToActiveAncestors(
  listener: (ancestors: ReadonlySet<string>) => void,
): () => void {
  install();
  // Push the current value immediately so callers don't miss the initial
  // state if the message has already been received.
  listener(activeAncestors);

  const wrapped = () => listener(activeAncestors);
  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}
