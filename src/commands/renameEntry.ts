import * as vscode from "vscode";
import { dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { SortingManager } from "../SortingManager";

export const renameEntry = async (entry: Entry) => {
  /* console.log("fileNestingExplorer.rename", entry); */

  const newName = await vscode.window.showInputBox({ value: entry.name });

  if (!newName) {
    return;
  }

  const newPath = join(dirname(entry.path), newName);
  const parentPath = dirname(entry.path);
  const oldName = entry.name;

  await vscode.workspace.fs.rename(
    vscode.Uri.file(entry.path),
    vscode.Uri.file(newPath)
  );

  // Update the sorting file to reflect the rename
  const sortingOrder = await SortingManager.readSortingOrder(parentPath);
  
  if (sortingOrder) {
    const index = sortingOrder.indexOf(oldName);
    if (index !== -1) {
      sortingOrder[index] = newName;
      await SortingManager.writeSortingOrder(parentPath, sortingOrder);
    }
  }

  entry.path = newPath;
  entry.name = newName;

  fileNestingDataProvider.refresh();
};
