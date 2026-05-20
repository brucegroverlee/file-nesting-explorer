/**
 * Tracks whether the explorer webview currently owns the user's focus.
 *
 * VS Code paints the active list selection with two different palettes:
 *   - `list.activeSelection*` (blue) when the list is focused.
 *   - `list.inactiveSelection*` (grey) when the user moved focus away
 *     (to the editor, terminal, another view, etc.).
 *
 * Since the webview is its own iframe document, "focused" here means
 * "any element inside this document currently owns focus".
 */

import { useSyncExternalStore } from "react";

let focused = false;
const listeners = new Set<() => void>();
let installed = false;

function emit() {
  listeners.forEach((fn) => fn());
}

function setFocused(next: boolean) {
  if (next === focused) {
    return;
  }
  focused = next;
  emit();
}

function install() {
  if (installed || typeof window === "undefined") {
    return;
  }
  installed = true;

  // Event-driven: don't consult `document.hasFocus()` because it is unreliable
  // inside VS Code's webview iframe (it can return `false` even right after
  // the user clicks a child element, leaving the selection painted as
  // "inactive" / grey instead of "active" / blue).
  document.addEventListener("focusin", () => setFocused(true));
  window.addEventListener("focus", () => setFocused(true));
  window.addEventListener("blur", () => setFocused(false));

  // Seed: if anything inside the document already has focus when we install,
  // mark as focused so the first paint is correct.
  if (document.activeElement && document.activeElement !== document.body) {
    setFocused(true);
  }
}

function subscribe(listener: () => void): () => void {
  install();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return focused;
}

export function useExplorerFocused(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
