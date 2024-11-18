import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const copyEntryRelativePath =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    console.log("fileNestingExplorer.copyEntryRelativePath", entry);

    context.globalState.update("cutEntryPath", null);

    const relativePath = vscode.workspace.asRelativePath(entry.path, false);

    vscode.env.clipboard.writeText(relativePath);

    fileNestingProvider.refresh();
  };
