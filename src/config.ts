import * as vscode from "vscode";

export const config = {
  fileNestingExtensions: vscode.workspace
    .getConfiguration()
    .get<string[]>("fileNestingExplorer.fileNestingExtensions") || ["tsx"],
  fileNestingPrefix:
    vscode.workspace
      .getConfiguration()
      .get<string>("fileNestingExplorer.fileNestingPrefix") || "@",
};
