import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "@file-nesting/shared";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";

export const findInFolder = async (entry: Entry) => {
  const selectedEntries = fileNestingTreeViewExplorer.getSelection();
  const targetEntry = entry ?? selectedEntries[0];

  if (!targetEntry) {
    return;
  }

  const folderPath =
    targetEntry.type === "folder"
      ? targetEntry.path
      : dirname(targetEntry.path);

  const relativePath = vscode.workspace.asRelativePath(folderPath, false);

  await vscode.commands.executeCommand("workbench.action.findInFiles", {
    filesToInclude: `./${relativePath}`,
  });
};
