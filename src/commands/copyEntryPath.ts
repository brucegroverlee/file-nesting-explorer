import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const copyEntryPath =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    console.log("fileNestingExplorer.copyEntryPath", entry);

    context.globalState.update("cutEntryPath", null);

    vscode.env.clipboard.writeText(entry.path);

    fileNestingProvider.refresh();
  };
