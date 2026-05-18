/**
 * Tracks which entry path is currently "selected" in the explorer
 * (independent of which file is the active editor). Mirrors VS Code's
 * `list.activeSelection*` concept: a single entry is selected at a time,
 * persists across focus changes, and is the target of keyboard navigation.
 */

import { useSyncExternalStore } from "react";

let selectedPath: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string | null {
  return selectedPath;
}

export function setSelectedPath(path: string | null): void {
  if (selectedPath === path) {
    return;
  }
  selectedPath = path;
  emit();
}

export function useSelectedPath(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useIsSelected(path: string): boolean {
  const getter = () => selectedPath === path;
  return useSyncExternalStore(subscribe, getter, getter);
}
