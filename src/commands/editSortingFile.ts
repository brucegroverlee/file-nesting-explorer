import * as vscode from "vscode";
import { dirname, join, parse } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { track } from "./analytics";

export const editSortingFile = async (entry: Entry) => {
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
      return;
    }

    const sortingFileUri = vscode.Uri.file(join(targetFolderPath, ".sorting"));

    // Check if the .sorting file exists
    try {
      await vscode.workspace.fs.stat(sortingFileUri);
    } catch {
      vscode.window.showInformationMessage(
        `No sorting file found in "${entry.name}".`,
      );
      return;
    }

    // Open the .sorting file in the editor
    const document = await vscode.workspace.openTextDocument(sortingFileUri);
    await vscode.window.showTextDocument(document);

    track("Edit Sorting File");
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to open sorting file for "${entry.name}": ${error}`,
    );
  }
};
