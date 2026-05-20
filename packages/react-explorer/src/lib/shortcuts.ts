/**
 * Keyboard shortcut bindings for the React Explorer.
 *
 * The shapes here mirror the shortcut hints rendered in the context menus
 * (`EntryContextMenu` for row-level commands, `FileSystemContextMenu` for the
 * empty-area / root menu). Keeping a single source of truth means the menu
 * label and the actual binding can never drift apart.
 *
 * Shortcuts use the "mod" abstraction: `metaKey` on macOS, `ctrlKey` on
 * Windows/Linux. We accept either at runtime so the same binding works
 * cross-platform without per-OS branching.
 */
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type AnyKeyboardEvent = ReactKeyboardEvent | KeyboardEvent;

interface Combo {
  /** `KeyboardEvent.key`, compared case-insensitively. */
  key: string;
  /** Require ⌘ (mac) or Ctrl (win/linux). */
  mod?: boolean;
  /** Require Shift. Default: must NOT be pressed. */
  shift?: boolean;
  /** Require Alt/Option. Default: must NOT be pressed. */
  alt?: boolean;
}

export interface ShortcutBinding {
  combo: Combo;
  command: string;
}

const matches = (event: AnyKeyboardEvent, combo: Combo): boolean => {
  if (event.key.toLowerCase() !== combo.key.toLowerCase()) {
    return false;
  }

  const modPressed = event.metaKey || event.ctrlKey;
  if (Boolean(combo.mod) !== modPressed) {
    return false;
  }

  const wantShift = combo.shift ?? false;
  if (wantShift !== event.shiftKey) {
    return false;
  }

  const wantAlt = combo.alt ?? false;
  if (wantAlt !== event.altKey) {
    return false;
  }

  return true;
};

/**
 * Returns the first command whose binding matches the event, or `null` if no
 * binding matches. Bindings are evaluated in order; combos using more
 * modifiers are deliberately listed before their less-specific siblings to
 * avoid ambiguity even though the matcher is already exact.
 */
export function matchShortcut(
  event: AnyKeyboardEvent,
  bindings: readonly ShortcutBinding[],
): string | null {
  for (const binding of bindings) {
    if (matches(event, binding.combo)) {
      return binding.command;
    }
  }
  return null;
}

/**
 * True when the keydown originated inside a contenteditable / input / select
 * — we never want to swallow native typing or paste-into-textarea events.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Row-level shortcuts (active when a `SelectableRow` has keyboard focus).
 * Mirrors the labels rendered by `EntryContextMenu`.
 */
export const ENTRY_BINDINGS: readonly ShortcutBinding[] = [
  // ⇧⌥⌘C must come before ⌥⌘C and ⌘C — the matcher is exact, but the order
  // also documents intent for readers.
  {
    combo: { key: "c", mod: true, alt: true, shift: true },
    command: "fileNestingExplorer.copyRelativePath",
  },
  {
    combo: { key: "c", mod: true, alt: true },
    command: "fileNestingExplorer.copyPath",
  },
  { combo: { key: "c", mod: true }, command: "fileNestingExplorer.copy" },
  { combo: { key: "x", mod: true }, command: "fileNestingExplorer.cut" },
  { combo: { key: "v", mod: true }, command: "fileNestingExplorer.paste" },
  // VS Code accepts both ⌘⌫ and the standalone Delete key for deletion.
  {
    combo: { key: "Backspace", mod: true },
    command: "fileNestingExplorer.delete",
  },
  { combo: { key: "Delete" }, command: "fileNestingExplorer.delete" },
  { combo: { key: "F2" }, command: "fileNestingExplorer.rename" },
];

/**
 * Root / empty-area shortcuts. Mirrors `FileSystemContextMenu`.
 */
export const FILESYSTEM_BINDINGS: readonly ShortcutBinding[] = [
  { combo: { key: "v", mod: true }, command: "fileNestingExplorer.paste" },
];
