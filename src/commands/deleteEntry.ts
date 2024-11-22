import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { fileNestingExplorer } from "../FileNestingExplorer";

export const deleteEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingExplorer.getSelection();

    console.log("fileNestingExplorer.delete", { entry, selectedEntries });

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

    await Promise.all(
      selectedEntries.map((entry) =>
        vscode.workspace.fs.delete(vscode.Uri.file(entry.path), {
          recursive: entry.type === "folder",
          useTrash: true,
        })
      )
    );

    fileNestingProvider.refresh();
  };
