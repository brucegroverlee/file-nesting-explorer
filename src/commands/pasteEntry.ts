import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const pasteEntry = async (entry: Entry) => {
  console.log("fileNestingExplorer.paste", entry);

  const copiedPath = await vscode.env.clipboard.readText();

  if (!copiedPath) {
    return;
  }

  if (copiedPath === entry.path) {
    // paste into the same folder with  the suffix " - Copy"
    const newPath = `${entry.path} - Copy`;

    await vscode.workspace.fs.copy(
      vscode.Uri.file(copiedPath),
      vscode.Uri.file(newPath)
    );
  } else {
    const location = entry.type === "folder" ? entry.path : dirname(entry.path);
    const newName = basename(copiedPath);
    const newPath = join(location, newName);

    await vscode.workspace.fs.copy(
      vscode.Uri.file(copiedPath),
      vscode.Uri.file(newPath)
    );
  }

  fileNestingProvider.refresh();
};
