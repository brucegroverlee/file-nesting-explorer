/**
 * Request/response bridge between the React webview and the VS Code
 * extension host. The extension side lives in `ReactExplorerViewProvider`
 * and handles the same message shapes defined here.
 */

import type { Entry } from "../../../Entry";
import { getVsCodeApi } from "./vscode";

type Request =
  | { id: number; type: "getRoots" }
  | { id: number; type: "getChildren"; entry: Entry }
  | { id: number; type: "openEditor"; entry: Entry };

type Response = {
  id: number;
  ok: boolean;
  entries?: Entry[];
  error?: string;
};

let nextId = 1;
const pending = new Map<
  number,
  { resolve: (entries: Entry[]) => void; reject: (err: Error) => void }
>();

let listenerInstalled = false;

function installListener() {
  if (listenerInstalled || typeof window === "undefined") {
    return;
  }

  window.addEventListener("message", (event: MessageEvent<Response>) => {
    const msg = event.data;
    if (!msg || typeof msg.id !== "number") {
      return;
    }

    const p = pending.get(msg.id);
    if (!p) {
      return;
    }

    pending.delete(msg.id);

    if (msg.ok) {
      p.resolve(msg.entries ?? []);
    } else {
      p.reject(new Error(msg.error ?? "Unknown error"));
    }
  });

  listenerInstalled = true;
}

function send(request: Request): Promise<Entry[]> {
  installListener();

  const api = getVsCodeApi();
  if (!api) {
    // Running outside of VS Code (e.g. `vite dev`): return empty so the UI
    // still mounts instead of crashing.
    return Promise.resolve([]);
  }

  return new Promise<Entry[]>((resolve, reject) => {
    pending.set(request.id, { resolve, reject });
    api.postMessage(request);
  });
}

export function requestRoots(): Promise<Entry[]> {
  return send({ id: nextId++, type: "getRoots" });
}

export function requestChildren(entry: Entry): Promise<Entry[]> {
  return send({ id: nextId++, type: "getChildren", entry });
}

export function requestOpenEditor(entry: Entry): void {
  // Fire-and-forget: the extension delegates to the existing
  // `fileNestingExplorer.openEditor` command, which handles preview vs
  // permanent editor based on its own click-timing logic.
  void send({ id: nextId++, type: "openEditor", entry });
}
