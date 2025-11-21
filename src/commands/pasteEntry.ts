import * as vscode from "vscode";
import { basename, dirname, extname, join } from "path";

import { Entry, getName } from "../Entry";
import { config } from "../config";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { validateExist, validateFiles } from "../FileSystem";
import { SortingManager } from "../SortingManager";

const paste = async (
  pathToBePasted: string,
  selectedEntries: readonly Entry[],
  targetEntry?: Entry
) => {
  const selectedEntry = selectedEntries[0];
  const effectiveTargetEntry = targetEntry ?? selectedEntry;
  const targetPath = effectiveTargetEntry.path;

  if (pathToBePasted === targetPath) {
    const newPath = join(
      dirname(targetPath),
      `${getName(targetPath)}(copy)${extname(targetPath)}`
    );

    return await vscode.workspace.fs.copy(
      vscode.Uri.file(pathToBePasted),
      vscode.Uri.file(newPath)
    );
  }

  let location: string;

  if (effectiveTargetEntry.type === "folder") {
    location = effectiveTargetEntry.path;
  } else if (
    effectiveTargetEntry.type === "file" &&
    effectiveTargetEntry.isNesting
  ) {
    const folderPath = join(
      dirname(effectiveTargetEntry.path),
      `${config.fileNestingPrefix}${getName(effectiveTargetEntry.path)}`
    );
    location = folderPath;
  } else {
    location = dirname(effectiveTargetEntry.path);
  }

  if (selectedEntries.length > 1) {
    location = dirname(selectedEntry.path);
  }

  const newName = basename(pathToBePasted);
  let newPath = join(location, newName);

  const fileExists = await validateExist(newPath);

  if (fileExists) {
    newPath = join(
      location,
      `${getName(pathToBePasted)}(copy)${extname(pathToBePasted)}`
    );
  }

  await vscode.workspace.fs.copy(
    vscode.Uri.file(pathToBePasted),
    vscode.Uri.file(newPath)
  );
};

export const pasteEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();

    const cutEntryPaths = context.globalState.get<string[]>("cutEntryPaths");
    const copiedEntryPaths =
      context.globalState.get<string[]>("copiedEntryPaths");

    const clipboard = await vscode.env.clipboard.readText();

    /* console.log("fileNestingExplorer.paste", {
      entry,
      selectedEntries,
      cutEntryPaths,
      copiedEntryPaths,
      clipboard,
    }); */

    let pathsToBePasted = cutEntryPaths || copiedEntryPaths;

    if (!pathsToBePasted) {
      const clipboardParts = clipboard.split(" ");

      if (clipboardParts.length === 0 || clipboardParts.length > 5) {
        return;
      }

      const areFiles = validateFiles(clipboardParts);

      if (!areFiles) {
        return;
      }

      pathsToBePasted = clipboardParts;
    }

    await Promise.all(
      pathsToBePasted.map((path) => paste(path, selectedEntries, entry))
    );

    if (cutEntryPaths) {
      context.globalState.update("cutEntryPaths", null);

      // Update sorting files for each parent directory of cut entries
      const parentDirs = new Set(cutEntryPaths.map((path) => dirname(path)));

      for (const parentPath of parentDirs) {
        const entriesInParent = cutEntryPaths.filter(
          (path) => dirname(path) === parentPath
        );

        await SortingManager.removeFromSortingOrder(
          entriesInParent,
          parentPath
        );
      }

      await Promise.all(
        cutEntryPaths.map(async (path) => {
          const uri = vscode.Uri.file(path);

          try {
            const stat = await vscode.workspace.fs.stat(uri);

            if (stat.type === vscode.FileType.Directory) {
              await vscode.workspace.fs.delete(uri, { recursive: true });
            } else {
              await vscode.workspace.fs.delete(uri);
            }
          } catch (error) {
            // Best-effort delete; ignore errors to avoid blocking paste completion.
            vscode.window.showInformationMessage(
              `fileNestingExplorer: failed to delete cut path '${path}': ${error}`
            );
          }
        })
      );
    }

    // fileNestingDataProvider.refresh();
  };
