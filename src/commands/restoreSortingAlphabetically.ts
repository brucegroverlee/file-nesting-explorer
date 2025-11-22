import * as vscode from "vscode";
import { dirname, join, parse } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { track } from "./analytics";

export const restoreSortingAlphabetically = async (entry: Entry) => {
  try {
    let targetFolderPath: string;

    if (entry.type === "folder") {
      targetFolderPath = entry.path;
    } else if (entry.type === "file" && entry.isNesting) {
      const containerFolderName = `${config.fileNestingPrefix}${
        parse(entry.name).name
      }`;
      targetFolderPath = join(dirname(entry.path), containerFolderName);
    } else {
      // Only folders and nesting files support restoring custom sorting
      return;
    }

    const sortingFileUri = vscode.Uri.file(join(targetFolderPath, ".sorting"));

    // Check if a .sorting file exists
    try {
      await vscode.workspace.fs.stat(sortingFileUri);
    } catch {
      vscode.window.showInformationMessage(
        `No custom sorting found for "${entry.name}".`
      );
      return;
    }

    // Delete the .sorting file to restore default sorting
    await vscode.workspace.fs.delete(sortingFileUri);

    track("Restore Sorting Alphabetically");

    // Refresh the view to reflect the updated sorting
    // fileNestingDataProvider.refresh();

    vscode.window.showInformationMessage(
      `Restored alphabetical sorting for "${entry.name}".`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to restore sorting for "${entry.name}": ${error}`
    );
  }
};
