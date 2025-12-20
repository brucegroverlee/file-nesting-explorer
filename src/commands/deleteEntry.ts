import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { SortingManager } from "../SortingManager";
import { config } from "../config";

/**
 * There is an issue when the user has selected multiple entries and clicks on one that is not selected,
 * the action is applied in the selected entries instead of just the clicked entry.
 *
 * This function determines which entries should be deleted based on whether the clicked entry is in the selection.
 * If the clicked entry is in the selection, delete all selected entries.
 * Otherwise, delete only the clicked entry.
 *
 * @param entry The entry that was clicked
 * @param selectedEntries The currently selected entries
 * @returns The entries to be deleted
 */
const getTargetEntries = (entry: Entry, selectedEntries: readonly Entry[]) => {
  const isClickInSelectedEntries = selectedEntries
    .map((selectedEntry) => selectedEntry.path)
    .includes(entry.path);

  return isClickInSelectedEntries ? selectedEntries : [entry];
};

export const deleteEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();

    /* console.log("fileNestingExplorer.delete", { entry, selectedEntries }); */

    const targetEntries = getTargetEntries(entry, selectedEntries);

    const message =
      targetEntries.length > 1
        ? `Are you sure you want to delete the following ${targetEntries.length} entries?`
        : `Are you sure you want to delete ${targetEntries[0].name}?`;

    const detail =
      targetEntries.length > 1
        ? targetEntries.map((entry) => entry.name).join("\n")
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

    for (const selectedEntry of targetEntries) {
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
      targetEntries.map((entry) => dirname(entry.path))
    );

    for (const parentPath of parentDirs) {
      const entriesInParent = targetEntries
        .filter((entry) => dirname(entry.path) === parentPath)
        .map((entry) => entry.path);

      await SortingManager.removeFromSortingOrder(entriesInParent, parentPath);
    }

    // fileNestingDataProvider.refresh();
  };
