import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const deleteEntry = async (entry: Entry) => {
  console.log("fileNestingExplorer.delete", entry);

  const result = await vscode.window.showInformationMessage(
    `Are you sure you want to delete ${entry.name}?`,
    { modal: true },
    "Yes"
  );

  if (result === "Yes") {
    await vscode.workspace.fs.delete(vscode.Uri.file(entry.path), {
      recursive: entry.type === "folder",
      useTrash: true,
    });

    fileNestingProvider.refresh();
  }
};
