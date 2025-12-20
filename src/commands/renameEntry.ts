import * as vscode from "vscode";
import { dirname, join, parse } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { validateExist } from "../FileSystem";
import { SortingManager } from "../SortingManager";
import { config } from "../config";

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

  const shouldRenameContainer = entry.type === "file" && entry.isNesting;

  if (shouldRenameContainer) {
    const oldContainerName = `${config.fileNestingPrefix}${
      parse(oldName).name
    }`;
    const newContainerName = `${config.fileNestingPrefix}${
      parse(newName).name
    }`;

    const oldContainerPath = join(parentPath, oldContainerName);
    const newContainerPath = join(parentPath, newContainerName);

    const containerExists = await validateExist(oldContainerPath);

    if (containerExists) {
      try {
        await vscode.workspace.fs.rename(
          vscode.Uri.file(oldContainerPath),
          vscode.Uri.file(newContainerPath)
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `fileNestingExplorer: failed to rename container folder '${oldContainerName}' to '${newContainerName}': ${error}`
        );
      }
    }
  }

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

  // fileNestingDataProvider.refresh();
};
