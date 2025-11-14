import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { SortingManager } from "../SortingManager";
import { config } from "../config";

export const deleteEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();

    /* console.log("fileNestingExplorer.delete", { entry, selectedEntries }); */

    const message =
      selectedEntries.length > 1
        ? `Are you sure you want to delete the following ${selectedEntries.length} entries?`
        : `Are you sure you want to delete ${selectedEntries[0].name}?`;

    const detail =
      selectedEntries.length > 1
        ? selectedEntries.map((entry) => entry.name).join("\n")
        : undefined;

    const result = await vscode.window.showInformationMessage(
      message,
      { modal: true, detail },
      "Yes"
    );

    if (result !== "Yes") {
      return;
    }

    // useTrash is not supported on remote file systems (e.g., WSL, SSH)
    const isRemote = vscode.env.remoteName !== undefined;

    // Build a list of paths to delete, including container folders for nesting files
    const pathsToDelete: string[] = [];

    for (const selectedEntry of selectedEntries) {
      pathsToDelete.push(selectedEntry.path);

      if (selectedEntry.type === "file" && selectedEntry.isNesting) {
        const fileNameWithoutExtension = basename(
          selectedEntry.path,
          selectedEntry.extension ? `.${selectedEntry.extension}` : ""
        );

        const containerFolderName = `${config.fileNestingPrefix}${fileNameWithoutExtension}`;
        const containerPath = join(
          dirname(selectedEntry.path),
          containerFolderName
        );

        pathsToDelete.push(containerPath);
      }
    }

    await Promise.all(
      pathsToDelete.map(async (path) => {
        const uri = vscode.Uri.file(path);

        try {
          const stat = await vscode.workspace.fs.stat(uri);

          await vscode.workspace.fs.delete(uri, {
            recursive: stat.type === vscode.FileType.Directory,
            useTrash: !isRemote,
          });
        } catch (error) {
          vscode.window.showErrorMessage(
            `fileNestingExplorer: failed to delete '${path}': ${error}`
          );
        }
      })
    );

    // Update sorting files for each parent directory
    const parentDirs = new Set(
      selectedEntries.map((entry) => dirname(entry.path))
    );

    for (const parentPath of parentDirs) {
      const entriesInParent = selectedEntries
        .filter((entry) => dirname(entry.path) === parentPath)
        .map((entry) => entry.path);

      await SortingManager.removeFromSortingOrder(entriesInParent, parentPath);
    }

    fileNestingDataProvider.refresh();
  };
