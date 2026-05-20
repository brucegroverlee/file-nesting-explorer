/**
 * A file or folder reference exchanged between the extension host
 * (`FileNestingDataProvider`, command handlers) and the React webview
 * (`fs-bridge`, `EntryContextMenu`). Kept in `@file-nesting/shared` so a
 * change to the contract breaks compile-time on both sides.
 */
export interface Entry {
  type: "file" | "folder";
  /**
   * Absolute path on disk. Similar to a VS Code URI without the scheme.
   * Example: `/Users/me/repo/src/components/Component.tsx`.
   */
  path: string;
  /**
   * Basename with extension. Example: `Component.tsx`.
   */
  name: string;
  /**
   * File extension without the leading dot. Example: `tsx`.
   * Optional because folders never carry one.
   */
  extension?: string;
  /**
   * True when the entry is a "nesting file" (a file with a sibling folder
   * prefixed by `fileNestingPrefix` that hosts its nested children).
   * Set on the host side by `FileNestingSystem`.
   */
  isNesting?: boolean;
}
