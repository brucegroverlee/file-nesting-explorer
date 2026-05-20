/**
 * Commands the React webview is allowed to ask the extension host to run via
 * `postMessage({ type: "executeCommand", ... })`. Treated as an allow-list by
 * `ReactExplorerViewProvider` so the webview can't trigger arbitrary commands.
 *
 * Mirrored by the menu/shortcut layer in the webview (`EntryContextMenu`,
 * `shortcuts.ts`). The `as const` makes this both a runtime Set source and the
 * canonical `EntryCommand` union type.
 */
export const ALLOWED_WEBVIEW_COMMANDS = [
  "fileNestingExplorer.newFile",
  "fileNestingExplorer.newFolder",
  "fileNestingExplorer.newNestedFile",
  "fileNestingExplorer.newNestedFolder",
  "fileNestingExplorer.createFileNestingContainer",
  "fileNestingExplorer.openDocumentation",
  "fileNestingExplorer.findInFolder",
  "fileNestingExplorer.cut",
  "fileNestingExplorer.copy",
  "fileNestingExplorer.paste",
  "fileNestingExplorer.copyPath",
  "fileNestingExplorer.copyRelativePath",
  "fileNestingExplorer.moveUp",
  "fileNestingExplorer.moveDown",
  "fileNestingExplorer.restoreSortingAlphabetically",
  "fileNestingExplorer.editSortingFile",
  "fileNestingExplorer.delete",
  "fileNestingExplorer.deleteFileNestingContainer",
  "fileNestingExplorer.rename",
  "fileNestingExplorer.refresh",
] as const;

export type EntryCommand = (typeof ALLOWED_WEBVIEW_COMMANDS)[number];

/**
 * Runtime helper: O(1) lookup so the host can validate incoming command names
 * without scanning the array on every message.
 */
export const ALLOWED_WEBVIEW_COMMANDS_SET: ReadonlySet<string> = new Set(
  ALLOWED_WEBVIEW_COMMANDS,
);

export function isAllowedWebviewCommand(value: string): value is EntryCommand {
  return ALLOWED_WEBVIEW_COMMANDS_SET.has(value);
}
