import * as vscode from "vscode";

export const config = {
  fileNestingExtensions: vscode.workspace
    .getConfiguration()
    .get<string[]>("fileNestingExplorer.fileNestingExtensions") || [
    "jsx",
    "tsx",
    "js",
    "ts",
  ],
  fileNestingPrefix:
    vscode.workspace
      .getConfiguration()
      .get<string>("fileNestingExplorer.fileNestingPrefix") || "@",
};
