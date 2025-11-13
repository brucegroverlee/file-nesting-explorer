import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";

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

    await Promise.all(
      selectedEntries.map((entry) =>
        vscode.workspace.fs.delete(vscode.Uri.file(entry.path), {
          recursive: entry.type === "folder",
          useTrash: !isRemote,
        })
      )
    );

    fileNestingDataProvider.refresh();
  };
