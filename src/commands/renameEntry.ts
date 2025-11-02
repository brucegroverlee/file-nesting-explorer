import * as vscode from "vscode";
import { dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const renameEntry = async (entry: Entry) => {
  /* console.log("fileNestingExplorer.rename", entry); */

  const newName = await vscode.window.showInputBox({ value: entry.name });

  if (!newName) {
    return;
  }

  const newPath = join(dirname(entry.path), newName);

  await vscode.workspace.fs.rename(
    vscode.Uri.file(entry.path),
    vscode.Uri.file(newPath)
  );

  entry.path = newPath;
  entry.name = newName;

  fileNestingProvider.refresh();
};
