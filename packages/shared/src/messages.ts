import type { Entry } from "./Entry";

/**
 * Messages the React webview sends to the extension host via
 * `acquireVsCodeApi().postMessage(...)`. Discriminated by `type`; the host
 * dispatches on it inside `ReactExplorerViewProvider.onDidReceiveMessage`.
 *
 * Every request carries a numeric `id` that the host echoes back on the
 * matching `ResponseMessage` so the webview can resolve the pending promise
 * in `fs-bridge.ts`.
 *
 * `command` is typed as `string` (not `EntryCommand`) on the wire because
 * the host can't trust the webview's claimed type at runtime — it validates
 * the incoming string against `ALLOWED_WEBVIEW_COMMANDS_SET` regardless.
 */
export type IncomingMessage =
  | { id: number; type: "getRoots" }
  | { id: number; type: "getChildren"; entry: Entry }
  | { id: number; type: "openEditor"; entry: Entry }
  | { id: number; type: "getActiveEditor" }
  | {
      id: number;
      type: "executeCommand";
      command: string;
      entry?: Entry;
    };

/**
 * Reply to any `IncomingMessage`. `ok: true` carries the result (currently
 * always an `Entry[]`; empty for commands that don't return data). `ok: false`
 * carries an error message string.
 */
export type ResponseMessage =
  | { id: number; ok: true; entries: Entry[] }
  | { id: number; ok: false; error: string };

/**
 * Push from host → webview when VS Code's active text editor changes (or when
 * the panel is becoming visible). The webview uses `path` + `ancestors` to
 * highlight the row and auto-expand the path that contains it.
 */
export interface ActiveEditorChangedMessage {
  type: "activeEditorChanged";
  path: string | null;
  ancestors: string[];
}

/**
 * Push from host → webview when the underlying file system changed (debounced
 * upstream by `FileNestingDataProvider`'s watcher). The webview refetches its
 * cached roots/children in response.
 */
export interface FsChangedMessage {
  type: "fsChanged";
}

/**
 * Union of every message the host can push to the webview without a prior
 * request (i.e. without an `id`).
 */
export type OutgoingMessage =
  | ActiveEditorChangedMessage
  | FsChangedMessage;
