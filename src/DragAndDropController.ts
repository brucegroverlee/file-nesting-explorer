import * as vscode from "vscode";
import { dirname, basename, join } from "path";

import { config } from "./config";
import { Entry } from "./Entry";
import { fileNestingProvider } from "./FileNestingProvider";

export class DragAndDropController
  implements vscode.TreeDragAndDropController<Entry>
{
  dropMimeTypes = ["application/vnd.code.tree.fileNestingExplorer"];
  dragMimeTypes = ["text/uri-list"];

  public async handleDrag(
    source: Entry[],
    treeDataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    treeDataTransfer.set(
      "application/vnd.code.tree.fileNestingExplorer",
      new vscode.DataTransferItem(source)
    );
  }

  public async handleDrop(
    target: Entry | undefined,
    sources: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = sources.get(
      "application/vnd.code.tree.fileNestingExplorer"
    );

    if (!transferItem) {
      return;
    }

    const sourceEntries: Entry[] = transferItem.value;

    // Determine target directory
    let targetPath: string;
    
    if (!target) {
      // Dropped at root level
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }
      targetPath = workspaceRoot;
    } else if (target.type === "folder") {
      // Dropped on a folder
      targetPath = target.path;
    } else if (target.type === "file" && target.isNesting) {
      // Dropped on a nesting file - move into its container folder
      const fileName = basename(target.path, target.extension ? `.${target.extension}` : "");
      targetPath = join(
        dirname(target.path),
        `${config.fileNestingPrefix}${fileName}`
      );
    } else {
      // Dropped on a regular file - use its parent directory
      targetPath = dirname(target.path);
    }

    // Move each source entry to the target location
    for (const sourceEntry of sourceEntries) {
      try {
        // Prevent moving a folder into itself or its descendants
        if (sourceEntry.type === "folder" && targetPath.startsWith(sourceEntry.path)) {
          vscode.window.showErrorMessage(
            `Cannot move '${sourceEntry.name}' into itself or its subdirectory`
          );
          continue;
        }

        const sourceName = basename(sourceEntry.path);
        const newPath = join(targetPath, sourceName);
        const newPathUri = vscode.Uri.file(newPath);

        // Check if destination already exists
        try {
          await vscode.workspace.fs.stat(newPathUri);
          vscode.window.showErrorMessage(
            `A file or folder '${sourceName}' already exists at the destination`
          );
          continue;
        } catch {
          // File doesn't exist, which is what we want
        }

        // Perform the move operation
        await vscode.workspace.fs.rename(
          vscode.Uri.file(sourceEntry.path),
          newPathUri,
          { overwrite: false }
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to move '${sourceEntry.name}': ${error}`
        );
      }
    }

    // Refresh the tree view
    fileNestingProvider.refresh();
  }
}

export const dragAndDropController = new DragAndDropController();
