import * as vscode from "vscode";
import { dirname, basename, join } from "path";

import { config } from "./config";
import { Entry } from "./Entry";
import { fileNestingDataProvider } from "./FileNestingDataProvider";

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
      const fileName = basename(
        target.path,
        target.extension ? `.${target.extension}` : ""
      );
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
        if (
          sourceEntry.type === "folder" &&
          targetPath.startsWith(sourceEntry.path)
        ) {
          /* vscode.window.showErrorMessage(
            `Cannot move '${sourceEntry.name}' into itself or its subdirectory`
          ); */
          continue;
        }

        // When dragging a nesting file, also move its associated container folder
        if (sourceEntry.type === "file" && sourceEntry.isNesting) {
          const fileNameWithoutExtension = basename(
            sourceEntry.path,
            sourceEntry.extension ? `.${sourceEntry.extension}` : ""
          );

          const containerFolderName = `${config.fileNestingPrefix}${fileNameWithoutExtension}`;
          const sourceDir = dirname(sourceEntry.path);
          const containerSourcePath = join(sourceDir, containerFolderName);
          const containerSourceUri = vscode.Uri.file(containerSourcePath);

          // Prevent moving the container folder into itself or its descendants
          if (targetPath.startsWith(containerSourcePath)) {
            /* vscode.window.showErrorMessage(
              `Cannot move container folder '${containerFolderName}' into itself or its subdirectory`
            ); */
            continue;
          }

          const fileDestinationName = basename(sourceEntry.path);
          const fileDestinationPath = join(targetPath, fileDestinationName);
          const fileDestinationUri = vscode.Uri.file(fileDestinationPath);

          const containerDestinationPath = join(
            targetPath,
            containerFolderName
          );
          const containerDestinationUri = vscode.Uri.file(
            containerDestinationPath
          );

          // Check if destination file already exists
          try {
            await vscode.workspace.fs.stat(fileDestinationUri);
            /* vscode.window.showErrorMessage(
              `A file or folder '${fileDestinationName}' already exists at the destination`
            ); */
            continue;
          } catch {
            // Destination file doesn't exist, which is what we want
            /* vscode.window.showInformationMessage(
              "DragAndDropController: destination file does not exist, proceeding with move."
            ); */
          }

          // Check if destination container folder already exists
          try {
            await vscode.workspace.fs.stat(containerDestinationUri);
            /* vscode.window.showErrorMessage(
              `A file or folder '${containerFolderName}' already exists at the destination`
            ); */
            continue;
          } catch {
            // Destination folder doesn't exist, which is what we want
            /* vscode.window.showInformationMessage(
              "DragAndDropController: destination container folder does not exist, proceeding with move."
            ); */
          }

          // Attempt to move the container folder if it exists
          try {
            await vscode.workspace.fs.rename(
              containerSourceUri,
              containerDestinationUri,
              { overwrite: false }
            );
          } catch {
            // If the container folder does not exist or cannot be moved,
            // proceed with moving only the nesting file.
            /* vscode.window.showInformationMessage(
              "DragAndDropController: container folder could not be moved; moving only the nesting file."
            ); */
          }

          // Move the nesting file itself
          await vscode.workspace.fs.rename(
            vscode.Uri.file(sourceEntry.path),
            fileDestinationUri,
            { overwrite: false }
          );

          continue;
        }

        const sourceName = basename(sourceEntry.path);
        const newPath = join(targetPath, sourceName);
        const newPathUri = vscode.Uri.file(newPath);

        // Check if destination already exists
        try {
          await vscode.workspace.fs.stat(newPathUri);
          /* vscode.window.showErrorMessage(
            `A file or folder '${sourceName}' already exists at the destination`
          ); */
          continue;
        } catch {
          // File doesn't exist, which is what we want
          /*  vscode.window.showInformationMessage(
            "DragAndDropController: destination path does not exist, proceeding with move."
          ); */
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
  }
}

export const dragAndDropController = new DragAndDropController();
