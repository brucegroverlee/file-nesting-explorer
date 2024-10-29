import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { fileNestingSystem } from "../FileNestingSystem";

export const renameEntry = async (entry: Entry) => {
  console.log("fileNestingExplorer.rename", entry);

  const newName = await vscode.window.showInputBox({ value: entry.name });

  if (!newName) {
    return;
  }

  fileNestingSystem.renameEntry(entry, newName);

  fileNestingProvider.refresh();
};
