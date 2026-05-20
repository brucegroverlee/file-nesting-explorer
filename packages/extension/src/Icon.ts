import * as vscode from "vscode";

export type IconPath =
  | { light: vscode.Uri; dark: vscode.Uri }
  | vscode.ThemeIcon
  | vscode.Uri
  | undefined;

/**
 * Returns the icon for a tree item. We delegate to `vscode.ThemeIcon("file")`
 * because VS Code already resolves it to the user's active icon theme, which
 * is the same behaviour the previous bespoke icon-theme bundling tried to
 * emulate. Kept as a function so call sites can swap in per-extension logic
 * later without churning every caller.
 */
export function getIcon(_extension?: string): IconPath {
  return new vscode.ThemeIcon("file");
}
